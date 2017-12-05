const express = require('express');
const router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var MongoDBUrl = "mongodb://csc309f:csc309fall@ds117316.mlab.com:17316/csc309db";
var userCollection = "sweet-and-spicy-grilled-pineapple-user-COLLECTION";

// routes relative to /api/user

/*  new user requesting to sign up */
router.post('/signup', function(req, res) {
    // check to make sure username is unique then
    // add them to the DB
    var username = req.body.username;
    var password = req.body.password;
     
    if(username && password && username !== "" && password !== ""){
        //check if username is in use
        signUp(username, password)
        .then(result => {
            if (result == 1) {
                res.status(200).send("User created");
            } else if (result == -1) {
                res.status(409).send("Username already taken");
            }
        })
        .catch(err =>{
            res.status(500).send("Internal error. Please try again.");
        })
    }
    else{
        res.status(409).send("Missing input, input required [username], [password]");
    }
})

/* user requesting to login */
router.post('/login', function(req, res) {
    // check their credentials are valid
    var username = req.body.username;
    var password = req.body.password;

    if (username && password && username !== "" && password !== "") {
        verifyUser(username, password)
        .then(result => {
            res.status(200).send("User found");
        })
        .catch(err => {
            res.status(409).send("Please check your username and password and try again.");
        })
    } else {
        res.status(409).send("Missing input, input required [username], [password]");
    }
})


module.exports = router;

/* sign up the user */
function signUp(username, password){
    //check if user name is already in use, if not add them to DB
    return new Promise((resolve, reject) => {      
        getUserFromDB(username)
        .then(results => {
            if (results.length > 0) {
                console.log("username <" + username + "> already in use");
                resolve(-1);
            }
            else if (results.length == 0){
                addUserToDB(username, password)
                .then(res => {
                    if (res == 1) {
                        console.log("New user signed up");
                        resolve(1);
                    }
                })
                .catch(err => {
                    reject(err);
                })
            }
        })
        .catch(err => {
            reject(err);
        })    
    })
}

/* See if username, password pair exist in the DB */
function verifyUser(username, password) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(MongoDBUrl, function(err,res) {
            if (err) {
                console.log(err);
                reject(err);
            }
            db = res;
            db.collection(userCollection).find({username: username, password: password}).toArray(function(err, results) {
                if (results.length == 1) { 
                // we expect one unique match
                    db.close();
                    resolve(1);
                } else {
                    db.close();
                    reject(-1);
                }
            })
        })
    })
}

/* gets user with username from db */
function getUserFromDB(username){
    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              console.log(err);
              reject(err); 
            } 
            console.log("user database connected");
            db = res
            // Return matching user
            db.collection(userCollection).find({username: username}, { _id:0, username:1, password:1}).toArray(function(err, results){
                console.log("got user with username: " + username + results);
                resolve(results);
                db.close();
            })
        });
    }) 
}

/* adds user and password to db */
function addUserToDB(username, password){
    // add a new user
    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              console.log(err);
              reject(err); 
            } 
            db = res
            db.collection(userCollection).insertOne({"username": username, "password": password}, function(err, res){
                if(err){
                  console.log(err);
                  reject(err); 
                }
                var jsonRes = JSON.parse(res);
                if(jsonRes.ok == 1){
                    resolve(1);   
                }
                else{
                    reject(res);
                }
                db.close();
                return
            })
        });
    }) 
}
