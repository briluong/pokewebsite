const express = require('express');
const router = express.Router();

// Routes relative to '/api/pokemon'

router.get('/', function(req, res) {

    res.json({message: "nothing to see here either"});

});

router.post('/', function(req, res) {
    res.json({message: "can't create pokemon yet"});
});

router.put('/:pokemonId', function(req, res) {
    res.json({message: "can't update pokemon yet"});
});

router.delete('/:pokemonId', function(req, res) {
    res.json({message: "can't delete pokemon yet"});
});

module.exports = router;
