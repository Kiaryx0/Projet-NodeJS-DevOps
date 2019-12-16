"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var bcrypt_1 = __importDefault(require("bcrypt"));
var User = /** @class */ (function () {
    function User(username, email, password, passwordHashed) {
        if (passwordHashed === void 0) { passwordHashed = false; }
        this.password = "";
        this.username = username;
        this.email = email;
        if (!passwordHashed) {
            this.setPassword(password);
        }
        else {
            this.password = password;
        }
    }
    User.fromDb = function (username, value) {
        var _a = value.split(":"), password = _a[0], email = _a[1];
        return new User(username, email, password);
    };
    User.prototype.setPassword = function (toSet) {
        var _this = this;
        // Hash and set password
        var rounds = 5;
        bcrypt_1.default.hash(toSet, rounds, function (err, hash) {
            if (err) {
                console.log("SURPRISE! I'M AN ERROR", err);
            }
            _this.password = hash;
            console.log(hash);
        });
    };
    User.prototype.getPassword = function () {
        return this.password;
    };
    User.prototype.validatePassword = function (toValidate) {
        // return comparison with hashed password
        var cres = false;
        bcrypt_1.default.compare(toValidate, this.password, function (err, res) {
            if (err) {
                console.log("SURPRISE! I'M AN ERROR", err);
            }
            cres = res;
            console.log(res);
        });
        return cres;
    };
    return User;
}());
exports.User = User;
var UserHandler = /** @class */ (function () {
    function UserHandler(path) {
        this.db = leveldb_1.LevelDB.open(path);
    }
    UserHandler.prototype.get = function (username, callback) {
        this.db.get("user:" + username, function (err, data) {
            if (err)
                callback(err);
            else if (data === undefined)
                callback(null, data);
            callback(null, User.fromDb(username, data));
        });
    };
    UserHandler.prototype.save = function (user, callback) {
        this.db.put("user:" + user.username, user.getPassword + ":" + user.email, function (err) {
            callback(err);
        });
    };
    UserHandler.prototype.delete = function (username, callback) {
        // TODO
    };
    return UserHandler;
}());
exports.UserHandler = UserHandler;
