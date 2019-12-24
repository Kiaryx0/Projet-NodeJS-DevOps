# Projet-NodeJS-DevOps

The code was written by Louis Deveze &amp; Maxime Tran &amp; Sebastien Ye.

### Travis Build : ![Travis Build](https://travis-ci.com/LouisDeveze/Projet-NodeJS-DevOps.svg?branch=master) 

## Content

### This Project contains the following features

* Populate a LevelDB database with two users and a few metrics for each one.
* Authenticate using Login / Signin / Logout
* Interact with the metrics contained in the database. CRUD operations
* Graph visual of the metrics of a logged user
* Security : Logged user can't see metrics of other users

## Step to Test the project

* Clone the repository on your desktop
* Open the project folder on Visual Studio Code
* Create a new Terminal
<div class="panel panel-warning">
**Warning**
If you are using a Windows OS, you have to run this command first : 
```
npm install --global --production windows-build-tools
```
</div>
* Run the command : **npm install**
* Run the command : **npm run populate**
* Run the command : **npm test**
* Run the command : **npm start**
* Open your web Browser and connect to [http://localhost:8080](http://localhost:8080)

## API Testing (POSTMAN) 

#### Users

* Get all users in database [http://localhost:8080/user/admin/allusers](http://localhost:8080/user/admin/allusers)
* Get a specific user in the database [http://localhost:8080/user/Louis](http://localhost:8080/user/Louis)
* Delete a specific user in the database [http://localhost:8080/user/Louis](http://localhost:8080/user/Louis)
* Post user in the database [http://localhost:8080/user](http://localhost:8080/user)
  with body : ['Louis', 'louis.deveze@edu.ece.fr', 'Framboise', false]

#### Metrics

* Delete all metrics from user Louis [http://localhost:8080/metric/deleteall/Louis]()
* Delete a specific metric from user Louis [http://localhost:8080/metric/delete/Louis/1383315300000](http://localhost:8080/metric/delete/Louis/1383315300000)
* Get all metrics from Louis in database [http://localhost:8080/metric/getall/Louis](http://localhost:8080/metric/getall/Louis)
* Get a specific metric from Louis [http://localhost:8080/metric/get/Louis/1383314400000](http://localhost:8080/metric/get/Louis/1383314400000)
* Post metrics for Louis [http://localhost:8080/metric/insert/Louis](http://localhost:8080/metric/insert/Louis])
  with body : [ 
                { "timestamp":"1384686660003", "value":63 },
                { "timestamp":"1384686660004", "value":15 }, 
                { "timestamp":"1384686660005", "value":98}
              ]

## Libraries

* [Express](http://expressjs.com/) : minimalist web framework for Node.js
* [Bootstrap 4](https://getbootstrap.com/) : CSS and Javascript toolkit for web devloppers
* [JQuery](https://jquery.com/) : Javascript Library
* [EJS](https://ejs.co/) : Embedded Javascript Templating
* [LevelDB](https://github.com/google/leveldb) : Fast, Lightweight, prototyping database

## Authors

* **Maxime TRAN**
* **Louis DEVEZE**
* **Sebastien Ye**
