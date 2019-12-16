"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var metrics_1 = require("./metrics");
var bodyparser = require("body-parser");
var app = express();
var port = process.env.PORT || '8080';
// Configure Express to use EJS
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
// Configure Express to serve static files in the public folder
app.use(express.static(path.join(__dirname, '../public')));
app.get('/', function (req, res) {
    return res.status(200).render('default.ejs');
});
app.get('/hello/:name', function (req, res) {
    return res.status(200).render('hello.ejs', { name: req.params.name });
});
// Metrics Instance
var dbMet = new metrics_1.MetricsHandler('./db/metrics');
// Metrics Post
app.post('/metrics/:name', function (req, res) {
    console.log("posting");
    dbMet.save(req.params.name, req.body, function (err) {
        if (err)
            throw err;
        res.status(200).send("Data has been saved.");
    });
});
// Metrics Get
app.get('/metrics/', function (req, res) {
    console.log("Get all metrics from db");
    dbMet.loadAllMetrics(function (err, result) {
        if (err)
            throw err;
        res.status(200).send(result);
    });
});
// Metrics Get All Metrics From ID
app.get('/metrics/:name', function (req, res) {
    console.log("getting all from " + req.params.name);
    dbMet.loadAllMetricsFrom(req.params.name, function (err, result) {
        if (err)
            throw err;
        res.status(200).send(result);
    });
});
// Metrics Get The Metric From ID with Timestamp
app.get('/metrics/:name/:timestamp', function (req, res) {
    console.log("getting " + req.params.name + " " + req.params.timestamp);
    dbMet.loadOneMetricFrom(req.params.name, req.params.timestamp, function (err, result) {
        if (err)
            throw err;
        res.status(200).send(result);
    });
});
// Metrics Delete
app.delete('/metrics/', function (req, res) {
    console.log("deleting all");
    dbMet.deleteAllMetrics(function (err, result) {
        if (err)
            throw err;
        dbMet.delete(result);
        res.status(200).send("Data has been deleted.\n");
    });
});
// Metrics Delete All Metrics From ID
app.delete('/metrics/:name', function (req, res) {
    console.log("deleting all from " + req.params.name);
    dbMet.deleteAllMetricsFrom(req.params.name, function (err, result) {
        if (err)
            throw err;
        dbMet.delete(result);
        res.status(200).send("Data has been deleted.\n");
    });
});
// Metrics Delete The Metric From ID with Timestamp
app.delete('/metrics/:name/:timestamp', function (req, res) {
    console.log("deleting " + req.params.name + " " + req.params.timestamp);
    dbMet.deleteOneMetricFrom(req.params.name, req.params.timestamp, function (err, result) {
        if (err)
            throw err;
        dbMet.delete(result);
        res.status(200).send("Data has been deleted.\n");
    });
});
// Use port 8080 for our project
app.listen(port, function () {
    console.log("server is listening on port " + port);
});
