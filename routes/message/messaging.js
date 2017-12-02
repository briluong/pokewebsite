const express = require('express');
const router = express.Router();

// Routes relative to /api/messages

router.get('/', function(req, res) {

    res.json({message: "nothing to see here"});

});

router.post('/', function(req, res) {

    res.json({message: "sorry you can't post yet"});

});

router.delete('/[0-9]+', function(req, res) {

    res.json({message: "sorry you can't delete yet"});

});

router.get('/\d+', function(req, res) {

    res.json({message: "no message here"});

});

module.exports = router;
