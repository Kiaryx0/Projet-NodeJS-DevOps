"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var metrics_1 = require("./metrics");
var bodyparser = require("body-parser");
var express_session_1 = __importDefault(require("express-session"));
var level_session_store_1 = __importDefault(require("level-session-store"));
var user_1 = require("./user");
var app = express();
var port = process.env.PORT || '8080';
var LevelStore = level_session_store_1.default(express_session_1.default);
// Metrics Instance
var dbMet = new metrics_1.MetricsHandler('./db/metrics');
var dbUser = new user_1.UserHandler('./db/users');
var authRouter = express.Router();
var userRouter = express.Router();
// Check if user is logged in
var authCheck = function (req, res, next) {
    if (req.session.loggedIn) {
        next();
    }
    else {
        res.redirect('/login');
    }
};
// Get login page
authRouter.get('/login', function (req, res) {
    res.render('login');
});
// Get signup page
authRouter.get('/signup', function (req, res) {
    res.render('signup');
});
// Get logout redirection
authRouter.get('/logout', function (req, res) {
    delete req.session.loggedIn;
    delete req.session.user;
    res.redirect('/login');
});
// Login validation and redirection
authRouter.post('/login', function (req, res, next) {
    dbUser.get(req.body.username)
        .then(function (result) {
        if (result === undefined) {
            res.redirect('/login');
        }
        else {
            result.validatePassword(req.body.password)
                .then(function (validPassword) {
                if (!validPassword) {
                    res.redirect('/login');
                }
                else {
                    req.session.loggedIn = true;
                    req.session.user = result;
                    res.redirect('/home');
                }
            })
                .catch(function (err) {
                next(err);
            });
        }
    })
        .catch(function (err) {
        next(err);
    });
});
// Sign up form validation and input in db
authRouter.post('/signup', function (req, res, next) {
    dbUser.get(req.body.username)
        .then(function (result) {
        if (result === undefined) {
            var newUser_1 = new user_1.User(req.body.username, req.body.email, req.body.password, false);
            newUser_1.hashPassword(newUser_1.getPassword())
                .then(function (hash) {
                newUser_1.setPassword(hash);
                dbUser.save(newUser_1, function (err) {
                    if (err)
                        next(err);
                });
                console.log("User has been registered.");
                req.session.loggedIn = true;
                req.session.user = newUser_1;
                var met = [new metrics_1.Metric("" + new Date().getTime(), 0)];
                dbMet.saveMany(req.session.user.username, met, function (err) {
                    if (err)
                        throw err;
                    console.log('Default metrics saved');
                });
                res.redirect('/');
            })
                .catch(function (err) {
                next(err);
            });
        }
        else {
            res.redirect('/signup');
        }
    })
        .catch(function (err) {
        next(err);
    });
});
// Admin post ONE new user in db
userRouter.post('/', function (req, res, next) {
    dbUser.get(req.body.username)
        .then(function (result) {
        if (result !== undefined) {
            res.status(409).send("User already exists!");
        }
        else {
            var newUser = new user_1.User(req.body.username, req.body.email, req.body.password);
            dbUser.save(newUser, function (err) {
                if (err) {
                    console.log("Saving error", err);
                    next(err);
                }
            });
            res.status(201).send("User has been created!");
        }
    })
        .catch(function (err) {
        res.status(404).send("Page not found!");
    });
});
// Admin get a user from db
userRouter.get('/:username', function (req, res, next) {
    dbUser.get(req.params.username)
        .then(function (result) {
        if (result === undefined) {
            res.status(404).send("User not found.");
        }
        else {
            res.status(200).json(result);
        }
    })
        .catch(function (err) {
        res.status(404).send("What happened?");
    });
});
// Admin get all users from db
userRouter.get('/admin/allusers', function (req, res, next) {
    dbUser.getAll()
        .then(function (result) {
        if (result === undefined) {
            res.status(404).send("User not found.");
        }
        else {
            res.status(200).json(result);
        }
    })
        .catch(function (err) {
        res.status(404).send("What happened?");
    });
});
// Admin delete a user from db
userRouter.delete('/:username', function (req, res, next) {
    dbUser.get(req.params.username)
        .then(function (result) {
        if (result !== undefined) {
            dbUser.delete(result.username).catch(function (err) { next(err); });
            res.status(200).send("User has been deleted!");
        }
        else
            res.status(409).send("User doesn't exist!");
    })
        .catch(function (err) {
        res.status(409).send("User doesn't exist!");
    });
});
// Configure Express to use EJS
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
// Configure Express to serve static files in the public folder
app.use(express.static(path.join(__dirname, '../public')));
// Configure session and routers
app.use(express_session_1.default({
    secret: 'my very secret phrase',
    store: new LevelStore('./db/sessions'),
    resave: true,
    saveUninitialized: true
}));
app.use(authRouter);
app.use('/user', userRouter);
// Default page
app.get('/', authCheck, function (req, res) {
    res.render('home.ejs', { name: req.session.user.username });
});
// Home Page
app.get('/home', function (req, res) {
    dbMet.loadAllFrom(req.session.user.username, function (err, result) {
        if (err)
            throw err;
        return res.status(200).render('home.ejs', { dataset: result, name: req.session.user.username });
    });
});
// Search Function 
app.get('/home/search', function (req, res) {
    // Result of the request
    var search = null;
    var dataset = null;
    // Getting the data
    var str = req.query['date'] + " " + req.query['time'] + " UTC";
    var date = new Date(str).getTime();
    dbMet.loadAllFrom(req.session.user.username, function (err, result) {
        if (err)
            throw err;
        dataset = result;
        if (date !== null) {
            dbMet.loadOneFrom(req.session.user.username, date, function (err, result) {
                if (err)
                    throw err;
                search = result;
                return res.status(200).render('home.ejs', { metric: search, dataset: dataset });
            });
        }
        else {
            return res.status(200).render('home.ejs', { dataset: dataset });
        }
    });
});
// Insert Function
app.post('/home/insert', function (req, res) {
    var str = req.body.date + " " + req.body.time + " UTC";
    var date = new Date(str).getTime();
    var value = req.body.value;
    if (date !== null && value !== null) {
        dbMet.save(req.session.user.username, date, value, function (err) {
            if (err)
                throw err;
            return res.status(200).redirect("/home");
        });
    }
});
// Delete Function
app.post('/home/delete', function (req, res) {
    var str = req.body.date + " " + req.body.time + " UTC";
    var date = new Date(str).getTime();
    if (date !== null) {
        dbMet.deleteOneFrom(req.session.user.username, date, function (err, result) {
            if (err)
                throw err;
            dbMet.delete(result);
            return res.status(200).redirect("/home");
        });
    }
});
// Delete Function
app.post('/home/deleteall', function (req, res) {
    var str = req.body.date + " " + req.body.time + " UTC";
    var date = new Date(str).getTime();
    if (date !== null) {
        dbMet.deleteAllFrom(req.session.user.username, function (err, result) {
            if (err)
                throw err;
            dbMet.delete(result);
            return res.status(200).redirect("/home");
        });
    }
});
// Use port 8080 for our project
app.listen(port, function () {
    console.log("server is listening on port " + port);
});
