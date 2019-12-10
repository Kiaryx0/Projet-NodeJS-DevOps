import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"

const dbPath: string = './db'
var dbMet: MetricsHandler

describe('Metrics', function () {
  before(function () {
    LevelDB.clear(dbPath)
    dbMet = new MetricsHandler(dbPath)
  })


  after(function () {
    dbMet.db.close()
  })

  describe('#get', function () {
    it('should get empty array on non existing group', function () {
      dbMet.loadAllMetricsFrom("maxime", function (err: Error | null, result: any | null) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
      })
    })
  })

  describe('#post', function () {
    let metrics = new Array();
    metrics.push(new Metric("maxime", 22));
    metrics.push(new Metric("maxime", 52));

    it('should save array of data', function () {
      dbMet.save("maxime", metrics, function (err: Error | null) {
        expect(err).to.be.undefined;
        console.log("coucou");
      })
    })
  })

})

