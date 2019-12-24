"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var bcrypt_1 = __importDefault(require("bcrypt"));
var User = /** @class */ (function () {
    function User(username, email, password, passwordHashed, notHashedPassword) {
        if (passwordHashed === void 0) { passwordHashed = true; }
        if (notHashedPassword === void 0) { notHashedPassword = ""; }
        this.username = username;
        this.email = email;
        this.password = password;
        // Only used once when user is signing up to have clear text password for administrative purpose
        if (!passwordHashed) {
            this.notHashedPassword = password;
        }
        else {
            this.notHashedPassword = notHashedPassword;
        }
    }
    User.fromDb = function (username, value) {
        var _a = value.split(":"), password = _a[0], email = _a[1], notHashedPassword = _a[2];
        return new User(username, email, password, true, notHashedPassword);
    };
    User.prototype.hashPassword = function (toHash) {
        // Hash password
        return new Promise(function (resolve, reject) {
            var saltRounds = 5;
            bcrypt_1.default.genSalt(saltRounds)
                .then(function (salt) {
                bcrypt_1.default.hash(toHash, salt)
                    .then(function (hash) {
                    resolve(hash);
                })
                    .catch(function (err) { console.log("Error setting password.", err); reject(err); });
            })
                .catch(function (err) { console.log("Error generating salt.", err); reject(err); });
        });
    };
    User.prototype.setPassword = function (toSet) {
        this.password = toSet;
    };
    User.prototype.getPassword = function () {
        return this.password;
    };
    User.prototype.getNotHashedPassword = function () {
        return this.notHashedPassword;
    };
    User.prototype.validatePassword = function (toValidate) {
        var _this = this;
        // return comparison with hashed password
        return new Promise(function (resolve, reject) {
            bcrypt_1.default.compare(toValidate, _this.getPassword())
                .then(function (res) {
                resolve(res);
            })
                .catch(function (err) {
                console.log("Error while validating password.", err);
                reject(err);
            });
        });
    };
    return User;
}());
exports.User = User;
var UserHandler = /** @class */ (function () {
    function UserHandler(path) {
        this.db = leveldb_1.LevelDB.open(path);
    }
    // Close db
    UserHandler.prototype.close = function () {
        this.db.close();
    };
    // Display one specific user information
    UserHandler.prototype.get = function (username) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.db.get("user:" + username, function (err, data) {
                if (err) {
                    if (err.notFound) {
                        resolve(undefined);
                    }
                    else {
                        reject(err);
                    }
                }
                else {
                    resolve(User.fromDb(username, data));
                }
            });
        });
    };
    // Display all users information
    UserHandler.prototype.getAll = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var users = [];
            _this.db.createReadStream()
                .on('data', function (data) {
                var dataKey = data.key.split(":");
                var dataValue = data.value.split(":");
                var newUser = new User(dataKey[1], dataValue[1], dataValue[0], true, dataValue[2]);
                users.push(newUser);
            })
                .on('error', function (err) {
                console.log('Oh my!', err);
                reject(err);
            })
                .on('close', function () { })
                .on('end', function () {
                resolve(users);
            });
        });
    };
    // Save a user in db
    UserHandler.prototype.save = function (user, callback) {
        this.db.put("user:" + user.username, user.getPassword() + ":" + user.email + ":" + user.getNotHashedPassword(), function (err) {
            if (err)
                callback(err);
        });
    };
    // Used to populate default database
    UserHandler.prototype.saveMany = function (users, callback) {
        var _this = this;
        users.forEach(function (u) {
            u.hashPassword(u.getPassword())
                .then(function (hash) {
                u.setPassword(hash);
                _this.db.put("user:" + u.username, u.getPassword() + ":" + u.email + ":" + u.getNotHashedPassword(), function (err) {
                    if (err)
                        callback(err);
                });
            });
        });
    };
    // Delete user from db
    UserHandler.prototype.delete = function (username) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.db.del("user:" + username, function (error) {
                if (error) {
                    console.log("Error while deleting", error);
                    reject(error);
                }
                else {
                    console.log("User has been deleted.");
                }
            });
        });
    };
    return UserHandler;
}());
exports.UserHandler = UserHandler;
