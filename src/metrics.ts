import { LevelDB } from './leveldb';
import WriteStream from 'level-ws';

export class Metric {
    public timestamp: string
    public value: number

    constructor(ts: string, v: number) {
        this.timestamp = ts;
        this.value = v;
    }

}

export class MetricsHandler {
    public db: any

    constructor(dbPath: string) {
        this.db = LevelDB.open(dbPath);
    }

    public close(){
        this.db.close();
    }

    public save(key: string, metrics: Metric[], callback: (error: Error | null) => void) {

        const stream = WriteStream(this.db)
        stream.on('error', callback)
        stream.on('close', callback)
        metrics.forEach((m: Metric) => {
            stream.write({ key: `metric:${key}:${m.timestamp}`, value: m.value })
        })
        stream.end()
    }

    public loadAllMetrics(callback: (error: Error | null, result: any | null) => void) {

        let metrics: Metric[] = [];
        this.db.createReadStream()
            .on('data', function (data) {
                let key : string[] = data.key.split(":"); 
                metrics.push(new Metric(key[2], data.value))
            })
            .on('error', function (err) {
                console.log('Oh my!', err)
            })
            .on('close', function () {})
            .on('end', function () {
                console.log('Stream ended')
                callback(null, metrics);
            })
    }

    public loadAllMetricsFrom(name: string, callback: (error: Error | null, result: any | null) => void) {

        let metrics: Metric[] = [];
        this.db.createReadStream()
            .on('data', function (data) {
                let key : string[] = data.key.split(":"); 
                if(key[1]===name){
                    metrics.push(new Metric(key[2], data.value))
                }
            })
            .on('error', function (err) {
                console.log('Oh my!', err)
            })
            .on('close', function () {})
            .on('end', function () {
                console.log('Stream ended')
                callback(null, metrics);
            })
    }

    public loadOneMetricFrom(name: string, timestamp: number, callback: (error: Error | null, result: any | null) => void) {

        let metrics: Metric[] = [];
        this.db.createReadStream()
            .on('data', function (data) {
                let key : string[] = data.key.split(":"); 
                if(key[1]===name && key[2]===timestamp.toString()){
                    metrics.push(new Metric(key[2], data.value))
                }
                    
            })
            .on('error', function (err) {
                console.log('Oh my!', err)
            })
            .on('close', function () {})
            .on('end', function () {
                console.log('Stream ended')
                callback(null, metrics);
            })
    }

    public deleteAllMetrics(callback: (error: Error | null, result: any | null) => void) {

        let metrics: Metric[] = [];
        this.db.createReadStream()
            .on('data', function (data) {
                let key : string[] = data.key.split(":"); 
                metrics.push(new Metric(data.key, data.value))
            })
            .on('error', function (err) {
                console.log('Oh my!', err)
            })
            .on('close', function () {})
            .on('end', function () {
                console.log('Stream ended')
                callback(null, metrics);
            })
    }

    public deleteAllMetricsFrom(name: string, callback: (error: Error | null, result: any | null) => void) {

        let metrics: Metric[] = [];
        this.db.createReadStream()
            .on('data', function (data) {
                let key : string[] = data.key.split(":"); 
                if(key[1]===name){
                    metrics.push(new Metric(data.key, data.value))
                }
            })
            .on('error', function (err) {
                console.log('Oh my!', err)
            })
            .on('close', function () {})
            .on('end', function () {
                console.log('Stream ended')
                callback(null, metrics);
            })
    }

    public deleteOneMetricFrom(name: string, timestamp: number, callback: (error: Error | null, result: any | null) => void) {

        let metrics: Metric[] = [];
        this.db.createReadStream()
            .on('data', function (data) {
                let key : string[] = data.key.split(":"); 
                if(key[1]===name && key[2]===timestamp.toString()){
                    metrics.push(new Metric(data.key, data.value))
                }
                    
            })
            .on('error', function (err) {
                console.log('Oh my!', err)
            })
            .on('close', function () {})
            .on('end', function () {
                console.log('Stream ended')
                callback(null, metrics);
            })
    }

    public delete(metrics: Metric[]){
        metrics.forEach((m: Metric) => {
            console.log("Deleting " + m.timestamp)
            this.db.del(m.timestamp)
        })
    }
}

