const express = require('express');
const router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var MongoDBUrl = "mongodb://csc309f:csc309fall@ds117316.mlab.com:17316/csc309db";
var messageCollection = "sweet-and-spicy-grilled-pineapple-messages-COLLECTION";


// Routes relative to /api/messages

// Retrieve messages that are unread or less than 2 minutes old
router.get('/', function(req, res) {

    res.json({message: "nothing to see here"});

});

// Post new message
router.post('/', function(req, res) {
	var message = req.body.data;
	var time = new Date();
	time.setTime(Date.now());
	var status = "unread"; // TODO might need different status for each user

	// Add message to the DB
	putMessage(message, status) 
	.then(data => {
		// Send response
		res.json({id: data, text: message, createdAt: time.toUTCString()});
	})
	.catch(err => {
		res.send("Failed POST-ing new message.");
	});
});

router.delete('/[0-9]+', function(req, res) {

    res.json({message: "sorry you can't delete yet"});

});


module.exports = router;

// Add a message to the database
function putMessage(message, stat) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(MongoDBUrl, function(err,res){
		    if (err) {
		    	console.log(err);
		    	reject(err);
		    }
		    db = res;
		               
		    db.collection(messageCollection).insertOne({text: message, status: stat, time: Date.now()}, function(err, res){
		    	if (err) {
		    		console.log(err);
		    		reject(err);
		    	}
		    	id = res.insertedId;

		    	resolve(id);
		    });
		});
	});
}

// For debugging: display everything in the messages DB
function findAll() {
	MongoClient.connect(MongoDBUrl, function(err,res) {
		if (err) console.log(err);
		db = res;
		db.collection(messageCollection).find({},{_id:1, text:1, status:1, time:1}).toArray(function(err, results){
	    	console.log(results);
	    });
	});
}
