"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var level_ws_1 = __importDefault(require("level-ws"));
var Metric = /** @class */ (function () {
    function Metric(ts, v) {
        this.timestamp = ts;
        this.value = v;
    }
    return Metric;
}());
exports.Metric = Metric;
var MetricsHandler = /** @class */ (function () {
    function MetricsHandler(dbPath) {
        this.db = leveldb_1.LevelDB.open(dbPath);
    }
    MetricsHandler.prototype.close = function () {
        this.db.close();
    };
    MetricsHandler.prototype.save = function (key, timestamp, value, callback) {
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        stream.write({ key: "metric:" + key + ":" + timestamp, value: Number(value) });
        stream.end();
    };
    MetricsHandler.prototype.saveMany = function (key, metrics, callback) {
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        metrics.forEach(function (m) {
            stream.write({ key: "metric:" + key + ":" + m.timestamp, value: m.value });
        });
        stream.end();
    };
    MetricsHandler.prototype.loadAllFrom = function (name, callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            if (key[1] === name) {
                metrics.push(new Metric(key[2], data.value));
            }
        })
            .on('close', function () { })
            .on('end', function () {
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.loadOneFrom = function (name, timestamp, callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            if (key[1] === name && key[2] === timestamp.toString()) {
                metrics.push(new Metric(key[2], data.value));
            }
        })
            .on('close', function () { })
            .on('end', function () {
            if (metrics.length === 1) {
                callback(null, metrics[0]);
            }
            else {
                callback(null, null);
            }
        });
    };
    MetricsHandler.prototype.deleteOneFrom = function (name, timestamp, callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            if (key[1] === name && key[2] === timestamp.toString()) {
                metrics.push(new Metric(data.key, data.value));
            }
        })
            .on('close', function () { })
            .on('end', function () {
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.deleteAllFrom = function (name, callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            if (key[1] === name) {
                metrics.push(new Metric(data.key, data.value));
            }
        })
            .on('close', function () { })
            .on('end', function () {
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.delete = function (metrics) {
        var _this = this;
        metrics.forEach(function (m) {
            console.log("Deleting " + m.timestamp);
            _this.db.del(m.timestamp);
        });
    };
    return MetricsHandler;
}());
exports.MetricsHandler = MetricsHandler;
