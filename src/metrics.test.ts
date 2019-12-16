import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"

const dbPath: string = './db/metrics'
var dbMet: MetricsHandler

describe('Metrics', function () {

  before(function () {
    LevelDB.clear(dbPath)
    dbMet = new MetricsHandler(dbPath)
  })

  after(function () {
    dbMet.db.close();
  })

  describe('#get', function () {

    it('should get empty array on non existing group', function () {
      dbMet.loadAllMetricsFrom("0", function (err: Error | null, result?: Metric[]) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
      })
    })

  })

  describe('#save', function () {

    it('should save data', function () {
      let metrics: Metric[] = [];
      metrics.push(new Metric("1234", 5));
      dbMet.save("0", metrics, function (err: Error | null) {
        expect(err).to.be.undefined;
        expect(metrics).to.not.be.empty;
        expect(metrics, "You're an array of Metric right?").to.be.an.instanceOf(Array);
        dbMet.loadAllMetricsFrom("0", function (err: Error | null, result?: Metric[]) {
          expect(err).to.be.null;
          expect(result, "You shouldn't be undefined!").to.not.be.undefined;
          expect(result).to.be.an.instanceOf(Array);
          expect(result[0].value).to.be.equal(5);
        })
      })
    })

    it('should update existing data', function () {
      let metrics: Metric[] = [];
      metrics.push(new Metric("1234", 5));
      dbMet.save("0", metrics, function (err: Error | null) { });
      metrics.pop();
      metrics.push(new Metric("1234", 7));
      dbMet.save("0", metrics, function (err: Error | null) {
        expect(err).to.be.undefined;
        expect(metrics).to.not.be.empty;
        expect(metrics).to.be.an.instanceOf(Array);
        dbMet.loadAllMetricsFrom("0", function(err: Error | null, result?: Metric[]) {
          expect(err).to.be.null;
          expect(result).to.not.be.undefined;
          expect(result).to.be.an.instanceOf(Array);
          expect(result[0].value).to.be.equal(7);
        })
      })
    })
  })

  describe('#delete', function() {

    it('should delete data', function () {
      let metrics: Metric[] = [];
      metrics.push(new Metric("1234", 5));
      dbMet.save("0", metrics, function (err: Error | null) { });
      dbMet.deleteAllMetricsFrom("0", function(err: Error | null, result: any) {
        dbMet.delete(result);
        expect(err).to.be.null;
        expect(result).to.be.empty;
      })
    })

    it('should not fail if data does not exist', function () {
      dbMet.deleteAllMetricsFrom("1", function(err: Error | null, result: any) {
        expect(err).to.be.null;
        expect(result).to.be.empty;
        dbMet.delete(result);
        expect(err).to.be.null;
        expect(result).to.be.empty;
      })
    })
  })

})