/* Some credits to okta.com and our teacher from Adaltas Sergei Kudinov*/

import express = require('express');
import session = require('express-session');
import path = require('path');
import { MetricsHandler } from './metrics';
import encoding from 'encoding-down';
import leveldown from 'leveldown';
import levelup from 'levelup';
import bodyparser = require('body-parser');
import { UserHandler, User } from './users';

// Usage of the POST - GET - DELETE methods

// Run PostMan with the following commands
// POST : http://localhost:8080/metrics/maxime
// -> Body : 	[{ "timestamp":"1384686660000", "value":12 },{ "timestamp":"1384686660001", "value":42 },{ "timestamp":"1384686660002", "value":13 }]
// POST : http://localhost:8080/metrics/louis
// -> Body :    [{ "timestamp":"1384686660003", "value":63 }, { "timestamp":"1384686660004", "value":15 }, { "timestamp":"1384686660005", "value":98}]
// GET (all) : http://localhost:8080/metrics
// GET (all from louis) : http://localhost:8080/metrics/louis
// GET (one from louis with timestamp ) : http://localhost:8080/metrics/maxime/1384686660000
// DELETE (all) : http://localhost:8080/metrics
// DELETE (all from louis) : http://localhost:8080/metrics/louis
// DELETE (one from louis with timestamp ) : http://localhost:8080/metrics/maxime/1384686660000



const app = express();
const port: string = process.env.PORT || '8080';

// Configure DB
const db = levelup(encoding(
    leveldown("db"), 
    { valueEncoding: 'json' })
)



// Configure Express to use EJS
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())
// Session management
app.use(session({secret: 'secret_code',saveUninitialized: true,resave: true}));
var sess; // global session

// Configure Express to serve static files in the public folder
app.use(express.static(path.join(__dirname,'../public')));


// Metrics Instance
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics');
const dbUser: UserHandler = new UserHandler('./db/users');

// Default Page
app.get('/', (req: any, res: any) => {
    return res.status(200).render('default.ejs');
})

// Home Page
app.get('/home', (req: any, res: any) => {
    let str = req.query['date']+" "+ req.query['time']+ " UTC";
    let date = new Date(str).getTime();
    let value = req.query['value'];
    
    if(date != null && value != null){
        dbMet.loadOneMetricFrom(
            req.params.name,
            req.params.timestamp,
            (err: Error | null, result: any) => {
            if(err) throw err
            
            return res.status(200).render('home.ejs', {metric : "result"});
        })
    }else{
        return res.status(200).render('home.ejs');
    }
})

// Login Function
app.post('/login',(req: any ,res: any) => {
    
    sess = req.session;
    sess.email = req.body.email;
    res.end('done');
});

// Signin Function
app.post('/signin',(req,res) => {
    sess = req.session;
    sess.email = req.body.email;
    res.end('done');
});

// Metrics Post
app.post('/metrics/:name', (req:any, res:any) => {
    console.log("posting");
    dbMet.save(req.params.name, req.body, (err:Error | null) =>{
        if(err) throw err
            res.status(200).send()
    })
})

// Metrics Get
app.get('/metrics/', (req:any, res:any) => {
    console.log("getting all");
    dbMet.loadAllMetrics(
        (err: Error | null, result: any) => {
        if(err) throw err
        res.status(200).send(result)
    })
})

// Metrics Get All Metrics From ID
app.get('/metrics/:name', (req:any, res:any) => {
    console.log("getting all from " + req.params.name);
    dbMet.loadAllMetricsFrom(
        req.params.name,
        (err: Error | null, result: any) => {
        if(err) throw err
        res.status(200).send(result)
    })
})

// Metrics Get The Metric From ID with Timestamp
app.get('/metrics/:name/:timestamp', (req:any, res:any) => {
    console.log("getting " + req.params.name + " " + req.params.timestamp);
    dbMet.loadOneMetricFrom(
        req.params.name,
        req.params.timestamp,
        (err: Error | null, result: any) => {
        if(err) throw err
        res.status(200).send(result)
    })
})

// Metrics Get
app.delete('/metrics/', (req:any, res:any) => {
    console.log("deleting all");
    dbMet.deleteAllMetrics(
        (err: Error | null, result: any) => {
        if(err) throw err
        dbMet.delete(result)
        res.status(200).send(result)
    })
})

// Metrics Get All Metrics From ID
app.delete('/metrics/:name', (req:any, res:any) => {
    console.log("deleting all from " + req.params.name);
    dbMet.deleteAllMetricsFrom(
        req.params.name,
        (err: Error | null, result: any) => {
        if(err) throw err
        dbMet.delete(result)
        res.status(200).send(result)
    })
})

// Metrics Get The Metric From ID with Timestamp
app.delete('/metrics/:name/:timestamp', (req:any, res:any) => {
    console.log("deleting " + req.params.name + " " + req.params.timestamp);
    dbMet.deleteOneMetricFrom(
        req.params.name,
        req.params.timestamp,
        (err: Error | null, result: any) => {
        if(err) throw err
        dbMet.delete(result)
        res.status(200).send(result)
    })
    
})

app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});