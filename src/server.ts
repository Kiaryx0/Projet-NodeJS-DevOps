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
import { watchFile } from 'fs';

// Express init
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
app.use(session({ secret: 'secret_code', saveUninitialized: true, resave: true }));
var sess; // global session

// Configure Express to serve static files in the public folder
app.use(express.static(path.join(__dirname, '../public')));


// Metrics Instance
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics');
const dbUser: UserHandler = new UserHandler('./db/users');

// Default Page
app.get('/', (req: any, res: any) => {
    return res.status(200).render('default.ejs');
})

// Home Page
app.get('/home', (req: any, res: any) => {
    dbMet.loadAllFrom("louis", (err: Error | null, result: any) => {
        if (err) throw err
        return res.status(200).render('home.ejs', { dataset: result });
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
    dbMet.loadAllFrom("louis", (err: Error | null, result: any) => {
        if (err) throw err
        dataset = result;
        if (date !== null) {
            dbMet.loadOneFrom("louis", date, (err: Error | null, result: any) => {
                if (err) throw err
                search = result;
                return res.status(200).render('home.ejs', { metric: search, dataset: dataset });
            })
        } else {
            return res.status(200).render('home.ejs', {  dataset: dataset });
        }
    })
})

// Insert Function
app.post('/home/insert', (req: any, res: any) => {
    let str = req.body.date + " " + req.body.time + " UTC";
    let date = new Date(str).getTime();
    let value = req.body.value
    if (date !== null && value !== null) {
        dbMet.save("louis", date, value, (err: Error | null) => {
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
        dbMet.deleteOneFrom("louis", date, (err: Error | null, result: any | null) => {
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
        dbMet.deleteAllFrom("louis", (err: Error | null, result: any | null) => {
            if (err) throw err
            dbMet.delete(result);
            return res.status(200).redirect("/home");
        })
    }
})


app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});