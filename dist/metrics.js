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
    MetricsHandler.prototype.save = function (name, metrics, callback) {
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        metrics.forEach(function (m) {
            stream.write({ key: "metric:" + name + ":" + m.timestamp, value: m.value });
        });
        stream.end();
    };
    MetricsHandler.prototype.loadAllMetrics = function (callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            metrics.push(new Metric(key[2], data.value));
        })
            .on('error', function (err) {
            console.log('Oh my!', err);
            callback(err, null);
        })
            .on('close', function () { })
            .on('end', function () {
            console.log('Stream ended');
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.loadAllMetricsFrom = function (name, callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            if (key[1] === name) {
                metrics.push(new Metric(key[2], data.value));
            }
        })
            .on('error', function (err) {
            console.log('Oh my!', err);
            callback(err, null);
        })
            .on('close', function () { })
            .on('end', function () {
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.loadOneMetricFrom = function (name, timestamp, callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            if (key[1] === name && key[2] === timestamp.toString()) {
                metrics.push(new Metric(key[2], data.value));
            }
        })
            .on('error', function (err) {
            console.log('Oh my!', err);
            callback(err, null);
        })
            .on('close', function () { })
            .on('end', function () {
            console.log('Stream ended');
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.deleteAllMetrics = function (callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            metrics.push(new Metric(data.key, data.value));
        })
            .on('error', function (err) {
            console.log('Oh my!', err);
            callback(err, null);
        })
            .on('close', function () { })
            .on('end', function () {
            console.log('Stream ended');
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.deleteAllMetricsFrom = function (name, callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            if (key[1] === name) {
                metrics.push(new Metric(data.key, data.value));
            }
        })
            .on('error', function (err) {
            console.log('Oh my!', err);
            callback(err, null);
        })
            .on('close', function () { })
            .on('end', function () {
            console.log('Stream ended');
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.deleteOneMetricFrom = function (name, timestamp, callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var key = data.key.split(":");
            if (key[1] === name && key[2] === timestamp.toString()) {
                metrics.push(new Metric(data.key, data.value));
            }
        })
            .on('error', function (err) {
            console.log('Oh my!', err);
            callback(err, null);
        })
            .on('close', function () { })
            .on('end', function () {
            console.log('Stream ended');
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
