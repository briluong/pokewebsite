const express = require('express');
const router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var MongoDBUrl = "mongodb://csc309f:csc309fall@ds117316.mlab.com:17316/csc309db";
var messageCollection = "sweet-and-spicy-grilled-pineapple-messages-COLLECTION";

var messageAge = 3; // messages older than this number of messages are not considered "new" unless they are unread


/* Routes relative to /api/messages */

// Retrieve all messages
router.get('/', function(req, res) {
	getAll()
	.then(data => {
		res.json({messages: data});
	})
	.catch(err => {
		res.send("Failed to GET messages.\n");
	});
});

// Retrieve all messages that should be displayed on the page
router.get('/show', function(req, res) {

	var now = Date.now();
	// Get all "new" messages
	// We'll define "new" as having a status of "unread" or < messageAge minutes old
	getNewMessages(now, messageAge)
	.then(data => {
		// Mark all new messages as "read"
		markAsRead(now, messageAge)
		.then(updated => {
			// Send the response (all new messages)
			res.json({messages: data});
		})
		.catch(err => {
			res.send("Failed to GET new messages\n");
		})
	})
	.catch(err => {
		res.send("Failed to GET new messages\n");
	})

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
		res.send("Failed POST-ing new message.\n");
	});
});

router.delete('/:ID', function(req, res) {

	var id = req.params.ID;
	deleteMessage(id)
	.then(data => {
		res.send("Deleted message " + id + "\n");
	})
	.catch(err => {
		res.send("Failed to delete message " + id + "\n");
	});
});


module.exports = router;

// Get all messages in the collection
function getAll() {
	return new Promise((resolve, reject) => {
		MongoClient.connect(MongoDBUrl, function(err,res) {
			if (err) {
				console.log(err);
				reject(err);
			}
			db = res;
			db.collection(messageCollection).find({},{status:0, time:0}).toArray(function(err, results) {
		    	resolve(results);
		    });
		});
	});
}

// Get all messages that are unread or less than age minutes old
function getNewMessages(now, age) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(MongoDBUrl, function(err,res) {
			if (err) {
				console.log(err);
				reject(err);
			}
			db = res;

			var dateDiff = now - age*60*1000;
			db.collection(messageCollection).find({ $or: [
						{status:/unread/}, 
						{time: {$gt: dateDiff}}
					]}, 
					{_id:0, text:1, time:1}).toArray(function(err, results) {
				resolve(results);
			});
		});
	});
}

// Set status of each new message to "read"
function markAsRead(now, age) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(MongoDBUrl, function(err,res) {
			if (err) {
				console.log(err);
				reject(err);
			}
			db = res;

			var dateDiff = now - age*60*1000;
			db.collection(messageCollection).updateMany({ $or: [
						{status:/unread/}, 
						{time: {$gt: dateDiff}}
					]}, 
					{$set: {status: "read"}});
			resolve(true);
		});
	});
}

// Add a message to the collection
function putMessage(message, stat) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(MongoDBUrl, function(err,res){
		    if (err) {
		    	console.log(err);
		    	reject(err);
		    }
		    db = res;
		               
		    db.collection(messageCollection).insertOne(
		    		{text: message, status: stat, time: Date.now()}, function(err, res){
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

// Delete a message from the collection
function deleteMessage(mID) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(MongoDBUrl, function(err,res) {
			if (err) {
				console.log(err);
				reject(err);
			}
			db = res;

			db.collection(messageCollection).deleteOne({"_id": ObjectId(mID)}, function(err, res) {
				if (err) {
					console.log(err);
					reject(err);
				}
				resolve(mID);
			});
		});
	});
}

// For debugging: display everything in the messages DB
function printAll() {
	MongoClient.connect(MongoDBUrl, function(err,res) {
		if (err) console.log(err);
		db = res;
		db.collection(messageCollection).find({},{_id:1, text:1, status:1, time:1}).toArray(function(err, results){
	    	console.log(results);
	    });
	});
}
