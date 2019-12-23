"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var metrics_1 = require("./metrics");
var leveldb_1 = require("./leveldb");
var dbPath = './db/metrics';
var dbMet;
describe('Metrics', function () {
    before(function () {
        leveldb_1.LevelDB.clear(dbPath);
        dbMet = new metrics_1.MetricsHandler(dbPath);
    });
    after(function () {
        dbMet.db.close();
    });
    describe('#get', function () {
        it('should get empty array on non existing group', function () {
            dbMet.loadAllFrom("0", function (err, result) {
                chai_1.expect(err).to.be.null;
                chai_1.expect(result).to.not.be.undefined;
                chai_1.expect(result).to.be.empty;
            });
        });
    });
    describe('#save', function () {
        it('should save data', function () {
            var metrics = [];
            metrics.push(new metrics_1.Metric("1234", 5));
            dbMet.save("0", 1234, 5, function (err) {
                chai_1.expect(err).to.be.undefined;
                chai_1.expect(metrics).to.not.be.empty;
                chai_1.expect(metrics, "You're an array of Metric right?").to.be.an.instanceOf(Array);
                dbMet.loadAllFrom("0", function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result, "You shouldn't be undefined!").to.not.be.undefined;
                    chai_1.expect(result).to.be.an.instanceOf(Array);
                    chai_1.expect(result[0].value).to.be.equal(5);
                });
            });
        });
        it('should update existing data', function () {
            dbMet.save("0", 1234, 5, function (err) { });
            dbMet.save("0", 1234, 7, function (err) {
                chai_1.expect(err).to.be.undefined;
                dbMet.loadAllFrom("0", function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.not.be.undefined;
                    chai_1.expect(result).to.be.an.instanceOf(Array);
                    chai_1.expect(result[0].value).to.be.equal(7);
                });
            });
        });
    });
    describe('#delete', function () {
        it('should delete data', function () {
            var metrics = [];
            metrics.push(new metrics_1.Metric("1234", 5));
            dbMet.save("0", 1234, 5, function (err) { });
            dbMet.deleteAllFrom("0", function (err, result) {
                dbMet.delete(result);
                chai_1.expect(err).to.be.null;
                chai_1.expect(result).to.be.empty;
            });
        });
        it('should not fail if data does not exist', function () {
            dbMet.deleteAllFrom("1", function (err, result) {
                chai_1.expect(err).to.be.null;
                chai_1.expect(result).to.be.empty;
                dbMet.delete(result);
                chai_1.expect(err).to.be.null;
                chai_1.expect(result).to.be.empty;
            });
        });
    });
});
