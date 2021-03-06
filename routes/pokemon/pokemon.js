const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var MongoDBUrl = "mongodb://csc309f:csc309fall@ds117316.mlab.com:17316/csc309db";
var pokeCollection = "sweet-and-spicy-grilled-pineapple-pokemon-COLLECTION";

//maps of pokemon and ids from pokeapi... to speed up searching  
var pokemonlistNameToId = fs.readFileSync('./routes/pokemon/pokemonlistname.json');
var pokemonlistIdToName = fs.readFileSync('./routes/pokemon/pokemonlistid.json');
var pokeapiNameToId = JSON.parse(pokemonlistNameToId);
var pokeapiIdToName = JSON.parse(pokemonlistIdToName);

// Routes relative to '/api/pokemon'


router.get('/', function(req, res) {
    console.log("bad get request")
    res.json({message: "request too large to handle, please request a single pokemon using the following format: /api/pokemon/[pokemon name]"});

});

/* gets data of pokemon :pokemonId */
router.get('/pokename/:pokemonId', function(req, res) {
    var username = req.query.user;
    var pokemon = req.params.pokemonId.toLowerCase().replace(/ /g, "-");
    var searchLocal = req.query.search;
    if(pokemon && pokemon !== ""){
        //search for the pokemon
        var pokesearch = searchLocalPokeDB(pokemon);
        pokesearch.then(data => {
            if(data.length > 0){
                console.log("found pokemon with name: " + pokemon);
                for(index = 0; index < data.length; index++){
                    if(data[index].status == "public"){
			if(searchLocal == 2 && data[index].user !== username){
				console.log(data[index].user + " trying to get pokemon to manage, but does not match" + username);
                        	res.status(409).json(data[index]);
				return;
			}
                        // send this pokemon to the user
                        console.log("pokemon is public, sending to user");
                        res.status(200).json(data[index]);
			return;
                    }
                    else if(data[index].status == "private" && data[index].user == username){
                        //send this pokemon to the user
                        console.log("pokemon is private, user matches to user")
                        res.status(200).json(data[index]);
                        return;
                    }
                }
                //can't send
                console.log("pokemon is private, user  does not match");
                res.status(409).send("this pokemon was made private by the user, could not retrieve data");
                return;
            }
            if(searchLocal > 0){
                res.status(409).send("you can only access your own creations");
            }
            // check the api db
            console.log("checking pokeapi");
            var pokemonurl = searchOrigPokemon(pokemon);
                if(pokemonurl !== null){
		    console.log("pokemon at: " + pokemonurl)
                    getPokemonFromPokeApi(pokemonurl).then(data => {
                        res.status(200).json(data);
                    })
                    .catch(err =>{
                        res.status(500).send("could not retireve pokemon data from database, please try again later");        
                    })
                }
                else{
                    res.status(400).send("this pokemon does not exist");    
                }

        }).catch(err => {
            res.status(500).send("could not connect to database, please try again later");
        })
    }
    else{
        res.status(400).send("pokemon not provided");
    };

});

/* gets random pokemon name */
router.get('/random', function(req, res) {
    console.log("getting a random pokemon");
    var pokeApiId = getRandomInt(1, 802).toString(); // pokemon id are in range (1, 802)
    var pokemonName = pokeapiIdToName[pokeApiId];
    if(pokemonName){
        res.status(200).send(pokemonName);
	return;
    }
    res.status(500).send("problem getting random pokemon name");
})

/* get all pokemon created by :user */
router.get('/user/:user', function(req, res) {
    var user = req.params.user;
    lookupUserPokemon(user)
    .then (data => {
        if (data.length >= 1) {
            console.log("ok");
            console.log(data);
            res.status(200).json({data:data});
        } else {
            res.status(204).send("user has not created any pokemon");
        }
    })
    .catch(err => {
        res.status(500).send("problem getting user's pokemon");
    })
})

/* create new pokemon */
router.post('/', function(req, res) {
	var pokemon = req.body;
	var pokeName = req.body.pokename.toLowerCase().replace(/ /g, "-");
	var user = req.body.user;
	// make sure pokemon with that name doesn't already exist
	var pokemon = createPokemonCheck(pokeName, user);
	pokemon.then(exists => {
            if(exists){
		console.log("pokemon with this name already exists");
                res.status(409).send("pokemon with this name already exists");
            }
            else{
                //store all info into a pokemon object and submit the pokemon
                var type = {"slot": 1, "type" : {'name': req.body.type1}};
                var types = [type];
                if(req.body.type2 !== ""){
                    var type2 = {"slot": 2, "type" : {'name': req.body.type2}}
                    types.push(type2);
                }

                var pokeImg = req.body.pokeimage;
                if(pokeImg == ""){
                    pokeImg = "https://cdn77.sadanduseless.com/wp-content/uploads/2014/03/derp8.jpg";
                }

                var pokemodel = {
                    'name': pokeName,
                    'height': req.body.height,
                    'weight': req.body.weight,
                    'types': types,
                    'stats': [{"stat": {"url": "https://pokeapi.co/api/v2/stat/6/", "name": "speed"}, "base_stat": req.body.speed},
                              {"stat": {"url": "https://pokeapi.co/api/v2/stat/5/", "name": "special-defense"}, "base_stat": req.body.spcdefense},
                              {"stat": {"url": "https://pokeapi.co/api/v2/stat/4/", "name": "special-attack"}, "base_stat": req.body.spcattack},
                              {"stat": {"url": "https://pokeapi.co/api/v2/stat/3/", "name": "defense"}, "base_stat": req.body.defense},
                              {"stat": {"url": "https://pokeapi.co/api/v2/stat/2/", "name": "attack"}, "base_stat": req.body.attack},
                              {"stat": {"url": "https://pokeapi.co/api/v2/stat/1/", "name": "hp"}, "base_stat": req.body.hp}],
                    'sprites': {'front_default': pokeImg},
                    'user': user,
                    'status': req.body.status
                }
                //submit to db
                submitNewPokemonToDB(pokemodel).then(data =>{
                    if(data == "ok"){
                        console.log("successfully inserted <" + pokeName + "> into database");
                        res.status(200).json(pokemodel);  
                    }
                    
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("failed to POST pokemon due to: " + err);
                })
            }    
        }).catch(err => {
            console.log(err);
            res.status(500).send("failed to POST pokemon due to: " + err);
        })
});

/* updates data of pokemon :pokemonId if belongs to user */
router.put('/:pokemonId', function(req, res) {
    var user = req.query.user;
    console.log(user);
    var updatedPokeData = req.body;
    var pokes = searchLocalPokeDB(req.params.pokemonId);
    pokes.then(data =>{
        //double check user
        var pokemon = data[0];
        if(pokemon.user !== user){
            console.log("user <" + user + "> not authorized to edit pokemon <" + pokename + ">");
            res.status(409).send("unauthorized for edit pokemon in db");    
        }
        else{
            console.log("going to update db")
            updatePokemonInPokeDB(updatedPokeData).then(data => {
                if(data.length !== 1){
                    console.log("did not updaate one pokemon properly");
                    res.status(500).send("an error occured when accessing the db");
                    return;        
                }
                else{
                    console.log("update successful");
                    res.status(200).send(data[0]);
                    return;
                }                
            }).catch(err => {
                console.log("problem with update");
                res.status(500).send("an error occured when accessing the db");        
            })
            return;
        }
    }).catch(err => {
        console.log("problem finding pokemon in localdb");
        res.status(500).send("an error occured");    
    })
    
});


/* deletes data of pokemon :pokemonId if belongs to user */
router.delete('/:pokemonId', function(req, res) {
    var user = req.query.username;
    var pokename = req.params.pokemonId;
    var pokes = searchLocalPokeDB(pokename);
    pokes.then(data =>{
        //double check user
        var pokemon = data[0];
        if(pokemon.user !== user){
            console.log("user <" + user + "> not authorized to delete pokemon <" + pokename + ">");
            res.status(409).send("unauthorized for remove pokemon from db");    
        }
        else{
            deleteFromPokeDB(pokename).then(data => {
                if(data == "ok"){
                    console.log("deletion successful");
                    res.status(200).send("worked")
                }
            }).catch(err => {
                console.log("an error occurred when trying to delete <" + pokename + "> from db");
                res.status(500).send("an error occured when accessing the db");        
            })
        }
    }).catch(err => {
        console.log("an error occurred when trying access the db for <" + pokename + ">");
        res.status(500).send("an error occured");    
    })
});

module.exports = router;

/* get all pokemon created by user */
function lookupUserPokemon(username) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(MongoDBUrl, function(err,res){
            if (err) {
                reject(err);
            }
            db = res;
            db.collection(pokeCollection).find({user: username}, {_id:0, name:1, status:1}).toArray(function(err, results) {
                resolve(results);
                db.close();
            })
        })
    })
}


/* retrieves pokemon at url and returns a promise with the pokemon data */
function getPokemonFromPokeApi(url){
    return new Promise((resolve, reject) => {
        request.get(url, function (err, res, body) {
            if(err) {
                reject(err);
            }
            else {
                var data = JSON.parse(body)
                console.log("retrieving pokemon from pokeapi")
                resolve(data); 
            }
        })
    })
}

/* puts pokemon into db*/
function submitNewPokemonToDB(pokemon){
    console.log("submitting pokemon: " + pokemon);
    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              reject(err);
              db.close();
              return; 
            } 
            console.log("prepping Database for submition");
            db = res
            db.collection(pokeCollection).insertOne(pokemon, function(err, res){
                if(err){
                  reject(err); 
                }
                var jsonRes = JSON.parse(res);
                if(jsonRes.ok == 1){
                    console.log("inserted " + pokemon.name + " into database")
                    resolve("ok");   
                }
                else{
                    reject(res);
                }
                db.close();
                return
            });                    
        });
    }) 
}

/* ensures there are no overlaps in the db, returns true if pokemon exists, false if does not */
function createPokemonCheck(pokeName, user){
    return new Promise((resolve, reject) => {
        if (pokeName == ""){
            reject("Pokemon name input was blank");
        }

        pokeWithPokeName = null;

        var localPokes = searchLocalPokeDB(pokeName);
        // this is not null or empty
        localPokes
        .then(data => {
            console.log("retrieved <" + pokeName + "> from local db");
            //data is an array 
            if(data.length > 0){
                console.log("pokemon with name <" + pokeName + "> already exists");
                resolve(true);
                return;
            }
            // then check other pokeapi
            var pokeUrl = searchOrigPokemon(pokeName);
	    if(pokeUrl !== null){
	    	resolve(true);
		return;
	    }
	    resolve(false);

        })
        .catch(err => {
            reject(err)
        })

    })
    
}

/* gets you all of the pokemon with pokename in the local db */
function searchLocalPokeDB(pokeName){
    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              console.log(err);
              reject(err); 
            }
            db = res;
            db.collection(pokeCollection).find({name: pokeName}, { _id:0, name:1, height:1, weight:1, types:1, stats:1, sprites:1, user:1, status:1}).toArray(function(err, results){
                resolve(results);
                db.close();
            })     
        });
    }) 
}

/* checks if pokename exists in the original pokeapi; returns the url to the pokemon data if it does, null otherwise */
function searchOrigPokemon(pokename){
	var id = pokeapiNameToId[pokename];
	if(id){
		var url = "https://pokeapi.co/api/v2/pokemon/" + id;
		return url;	
	}
	console.log("pokemon <" + pokename + "> does not exist in pokeapi");
	return null;
	
}

/* get a random integer from range (min, max) */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/* delete pokemon with this name from the db */
function deleteFromPokeDB(pokeName){
    console.log("deleting pokemon <" + pokeName+ "> from db");
    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              console.log(err);
              reject(err); 
            } 
            console.log("connected to pokemon database");
            db = res
            db.collection(pokeCollection).deleteOne({name: pokeName}, function(err, res) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve("ok");
            });
            db.close();     
        });
    })   
}

/* update pokemon with this name in the db */
function updatePokemonInPokeDB(pokemon){

    var pokename = pokemon.pokename.toLowerCase().replace(/ /g, "-");
    console.log("updating pokemon <" + pokename + "> from db");
    var type = {"slot": 1, "type" : {'name': pokemon.type1}};
    var types = [type];
    if(pokemon.type2 !== ""){
        var type2 = {"slot": 2, "type" : {'name': pokemon.type2}}
        types.push(type2);
    }

    var stats = [];
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/6/", "name": "speed"}, "base_stat": pokemon.speed});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/5/", "name": "special-defense"}, "base_stat": pokemon.spcdefense});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/4/", "name": "special-attack"}, "base_stat": pokemon.spcattack});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/3/", "name": "defense"}, "base_stat": pokemon.defense});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/2/", "name": "attack"}, "base_stat": pokemon.attack});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/1/", "name": "hp"}, "base_stat": pokemon.hp});

    var sprites = null;
    if(pokemon.pokeimage !== ""){
        sprites = {'front_default': pokemon.pokeimage};
    }

    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              console.log(err);
              reject(err); 
            } 
            console.log("connected to pokemon database");
            db = res

            db.collection(pokeCollection).update({name: pokename}, {$set: {"height": pokemon.height, "weight": pokemon.weight, "types": types, "stats": stats, "status": pokemon.status}}, function(err, results) {
                if(err){
                    console.log(err);
                    reject(err);
                    db.close();
                    return;  
                }
                if(sprites !== null){
			console.log("updating sprites");
                	db.collection(pokeCollection).update({name: pokename}, {$set: {"sprites": sprites}}, function(err, results) {
                        	if(err){
                           	 console.log(err);
                           	 reject(err);  
                        	}
                        	console.log("successfully updated pokemon");
				db.collection(pokeCollection).find({name: pokename}, { _id:0, name:1, height:1, weight:1, types:1, stats:1, sprites:1, user:1, status:1}).toArray(function(err, results){
                   	 		console.log(results);
                   	 		resolve(results);
                   	 		db.close();
                  	  		return;
               			})
                        	return;
                    	}) 
                }else{
                	console.log("successfully modified, did not mod sprites");
                	db.collection(pokeCollection).find({name: pokename}, { _id:0, name:1, height:1, weight:1, types:1, stats:1, sprites:1, user:1, status:1}).toArray(function(err, results){
                   	 	console.log(results);
                   	 	resolve(results);
                   	 	db.close();
                  	  	return;
               		})
		}
            });
        });
    })   
}

