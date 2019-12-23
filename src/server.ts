import express = require('express');
import path = require('path');
import { MetricsHandler } from './metrics';
import bodyparser = require('body-parser');
import session from 'express-session';
import levelSession from 'level-session-store';
import { UserHandler, User } from './user';

const app = express();
const port: string = process.env.PORT || '8080';
const LevelStore = levelSession(session);
// Metrics Instance
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics');
const dbUser: UserHandler = new UserHandler('./db/users');
const authRouter = express.Router();
const userRouter = express.Router();
const metricRouter = express.Router();

// Check if user is logged in
const authCheck = function (req: any, res: any, next: any) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Get login page
authRouter.get('/login', (req: any, res: any) => {
    res.render('login');
});

// Get signup page
authRouter.get('/signup', (req: any, res: any) => {
    res.render('signup');
});

// Get logout redirection
authRouter.get('/logout', (req: any, res: any) => {
    delete req.session.loggedIn;
    delete req.session.user;
    res.redirect('/login');
});

// Login validation and redirection
authRouter.post('/login', (req: any, res: any, next: any) => {
    dbUser.get(req.body.username)
        .then(function (result: User) {
            if (result === undefined) {
                res.redirect('/login');
            } else {
                result.validatePassword(req.body.password)
                    .then((validPassword: boolean) => {
                        if (!validPassword) {
                            res.redirect('/login');
                        } else {
                            req.session.loggedIn = true;
                            req.session.user = result;
                            res.redirect('/home');
                        }
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
        })
        .catch((err) => {
            next(err);
        })
});

// Sign up form validation and input in db
authRouter.post('/signup', (req: any, res: any, next: any) => {
    dbUser.get(req.body.username)
        .then(function (result: User) {
            if (result === undefined) {
                let newUser: User = new User(req.body.username, req.body.email, req.body.password, false);
                newUser.hashPassword(newUser.getPassword())
                    .then((hash: string) => {
                        newUser.setPassword(hash);
                        dbUser.save(newUser, (err: Error | null) => {
                            if (err) next(err);
                        });
                        console.log("User has been registered.");
                        req.session.loggedIn = true;
                        req.session.user = newUser;
                        res.redirect('/');
                    })
                    .catch((err) => {
                        next(err);
                    })
            } else {
                res.redirect('/signup');
            }
        })
        .catch((err) => {
            next(err);
        });
});

// Admin post ONE new user in db
userRouter.post('/', (req: any, res: any, next: any) => {
    dbUser.get(req.body.username)
        .then(function (result: User) {
            if (result !== undefined) {
            res.status(409).send("User already exists!");
            } else {
                let newUser: User = new User(req.body.username, req.body.email, req.body.password);
                dbUser.save(newUser, function (err: Error | null) {
                    if (err) {
                        console.log("Saving error", err);
                        next (err);
                    }
                })
                res.status(201).send("User has been created!");
            }
        })
        .catch((err) => {
            res.status(404).send("Page not found!");
        });
});

// Admin get a user from db
userRouter.get('/:username', (req: any, res: any, next: any) => {
    dbUser.get(req.params.username)
        .then(function (result: User) {
            if (result === undefined) {
                res.status(404).send("User not found.");
            } else {
            res.status(200).json(result);
            }
        })
        .catch((err) => {
            res.status(404).send("What happened?");
        })
});

// Admin get all users from db
userRouter.get('/admin/allusers', (req: any, res: any, next: any) => {
    dbUser.getAll()
        .then(function (result: User) {
            if (result === undefined) {
                res.status(404).send("User not found.");
            } else {
                res.status(200).json(result);
            }
        })
        .catch((err) => {
            res.status(404).send("What happened?");
        })
})

// Admin delete a user from db
userRouter.delete('/:username', (req: any, res: any, next: any) => {
    dbUser.get(req.params.username)
        .then(function (result: User) {
            if (result !== undefined) {
                dbUser.delete(result.username).catch( (err) => { next(err) });
                res.status(200).send("User has been deleted!");
            } else res.status(409).send("User doesn't exist!");
        })
        .catch((err) => {
            res.status(409).send("User doesn't exist!");
        })
});

// Get All Function Using PostMan
metricRouter.get('/getall/:username', (req: any, res: any) => {
    dbMet.loadAllFrom(req.params.username, (err: Error | null, result: any) => {
        if (err) throw err
        return res.status(200).send(result);
    })
});

// Get Function Using PostMan
metricRouter.get('/get/:username/:timestamp', (req: any, res: any) => {
    dbMet.loadOneFrom(req.params.username, req.params.timestamp, (err: Error | null, result: any) => {
        if (err) throw err
        return res.status(200).send(result);
    })
});

// Insert Function Using PostMan
metricRouter.post('/insert/:username', (req: any, res: any) => {
    let metrics = req.body;
    if (metrics != null) {
        dbMet.saveMany("username", metrics, (err: Error | null) => {
            if (err) throw err
            return res.status(200).send("OK");
        })
    }
});

// Delete Function Using PostMan
metricRouter.delete('/delete/:username/:timestamp', (req: any, res: any) => {
    if (req.params.timestamp !== null) {
        dbMet.deleteOneFrom(req.params.username, req.params.timestamp, (err: Error | null, result: any | null) => {
            if (err) throw err
            dbMet.delete(result);
            return res.status(200).send(result);
        })
    }
});

// Delete All Function Using PostMan
metricRouter.delete('/deleteall/:username', (req: any, res: any) => {
    
    dbMet.deleteAllFrom(req.params.username, (err: Error | null, result: any | null) => {
        if (err) throw err
        dbMet.delete(result);
        return res.status(200).send(result);
    })
});

// Configure Express to use EJS
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

// Configure Express to serve static files in the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Configure session and routers
app.use(session({
    secret: 'my very secret phrase',
    store: new LevelStore('./db/sessions'),
    resave: true,
    saveUninitialized: true
}));
app.use(authRouter);
app.use('/user', userRouter);
app.use('/metric', metricRouter);


// Default page
app.get('/', authCheck, (req: any, res: any) => {
    dbMet.loadAllFrom(req.session.user.username, (err: Error | null, result: any) => {
        if (err) throw err
        return res.status(200).render('home.ejs', { dataset: result, name: req.session.user.username });
    })
});

// Home Page
app.get('/home', (req: any, res: any) => {
    dbMet.loadAllFrom(req.session.user.username, (err: Error | null, result: any) => {
        if (err) throw err
        return res.status(200).render('home.ejs', { dataset: result, name: req.session.user.username });
    })
})

// Search Function 
app.get('/home/search', (req: any, res: any) => {
    // Result of the request
    var search = null;
    var dataset = null;
    // Getting the data
    let str = req.query['date'] + " " + req.query['time'] + " UTC";
    let date = new Date(str).getTime();
    dbMet.loadAllFrom(req.session.user.username, (err: Error | null, result: any) => {
        if (err) throw err
        dataset = result;
        if (date !== null) {
            dbMet.loadOneFrom(req.session.user.username, date, (err: Error | null, result: any) => {
                if (err) throw err
                search = result;
                return res.status(200).render('home.ejs', { metric: search, dataset: dataset, name: req.session.user.username  });
            })
        } else {
            return res.status(200).render('home.ejs', {  dataset: dataset, name: req.session.user.username  });
        }
    })
})

// Insert Function
app.post('/home/insert', (req: any, res: any) => {
    let str = req.body.date + " " + req.body.time + " UTC";
    let date = new Date(str).getTime();
    let value = req.body.value
    if (date !== null && value !== null) {
        dbMet.save(req.session.user.username, date, value, (err: Error | null) => {
            if (err) throw err
            return res.status(200).redirect("/home");
        })
    }
});

// Delete Function
app.post('/home/delete', (req: any, res: any) => {
    let str = req.body.date + " " + req.body.time + " UTC";
    let date = new Date(str).getTime();
    if (date !== null) {
        dbMet.deleteOneFrom(req.session.user.username, date, (err: Error | null, result: any | null) => {
            if (err) throw err
            dbMet.delete(result);
            return res.status(200).redirect("/home");
        })
    }
})

// Delete Function
app.post('/home/deleteall', (req: any, res: any) => {
    let str = req.body.date + " " + req.body.time + " UTC";
    let date = new Date(str).getTime();
    if (date !== null) {
        dbMet.deleteAllFrom(req.session.user.username, (err: Error | null, result: any | null) => {
            if (err) throw err
            dbMet.delete(result);
            return res.status(200).redirect("/home");
        })
    }
})

// Use port 8080 for our project
app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});