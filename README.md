## Projet-NodeJS-DevOps

This repository contains the source code of the NodeJS and DevOps Project. 
The code was written by Louis Deveze &amp; Maxime Tran.

### Content

#####This Project contains the following features

- Populate a LevelDB database with two users and a few metrics for each one.
- Authenticate using Login / Signin / Logout
- Interact with the metrics contained in the database. CRUD operations
- Graph visual of the metrics of a logged user
- Security : Logged user can't see metrics of other users

### Step to Test the project

- Clone the repository on your desktop
- Open the project folder on Visual Studio Code
- Create a new Terminal
- Run the command : **npm install**
- Run the command : **npm run populate**
- Run the command : **npm test**
- Run the command : **npm start**
- Open your web Browser and connect to [http://localhost:8080](http://localhost:8080)


### Libraries

#####This Project uses the following library to run :
- [Express](http://expressjs.com/) : minimalist web framework for Node.js
- [Bootstrap 4](https://getbootstrap.com/) : CSS and Javascript toolkit for web devloppers
- [JQuery](https://jquery.com/) : Javascript Library
- [EJS](https://ejs.co/) : Embedded Javascript Templating
- [LevelDB](https://github.com/google/leveldb) : Fast, Lightweight, prototyping database