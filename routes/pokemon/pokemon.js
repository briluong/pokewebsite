const express = require('express');
const router = express.Router();
const request = require('request')

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var MongoDBUrl = "mongodb://csc309f:csc309fall@ds117316.mlab.com:17316/csc309db";
var pokeCollection = "sweet-and-spicy-grilled-pineapple-pokemon-COLLECTION";
// Routes relative to '/api/pokemon'

router.get('/', function(req, res) {
    console.log("bad get request")
    res.json({message: "request too large to handle, please request a single pokemon using the following format: /api/pokemon/[pokemon name]"});

});

router.get('/pokename/:pokemonId', function(req, res) {
    var username = req.query.username;
    console.log(req.query);
    var pokemon = req.params.pokemonId;
    var searchLocal = req.query.search;
    if(pokemon && pokemon !== ""){
        // do the search thing
        var pokesearch = searchLocalPokeDB(pokemon);
        pokesearch.then(data => {
            console.log("retrieved " + data + " from localdb");
            console.log(data);
            console.log(data.length);
            if(data.length > 0){
                console.log("found pokemon with name: " + pokemon);
                for(index = 0; index < data.length; index++){
                    if(data[index].status == "public"){
                        // send this pokemon to the user
                        console.log("pokemon is public, sending to user : " + data[index]);
                        res.status(200).json(data[index]);
                    }
                    else if(data[index].status == "private" && data[index].user == username){
                        //send this pokemon to the user
                        console.log("pokemon is private, user matches to user : ")
                        console.log(data[index]);
                        res.status(200).json(data[index]);
                    }
                }
                //can't send
                console.log("pokemon is private, user  does not match : " + data[index]);
                console.log(data[index]);
                res.status(409).send("this pokemon was made private by the user, could not retrieve data");
            }
            if(searchLocal == 1){
                res.status(409).send("you can only access your own creations");
            }
            // check the api db
            console.log("checking pokeapi");
            var pokeapidb = searchOrigPokemon(pokemon);
            pokeapidb.then(url => {
                console.log("pokemon at: " + url)
                if(url !== null){
                    getPokemonFromPokeApi(url).then(data => {
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

        }).catch(err => {
            res.status(500).send("could not connect to database, please try again later");
        })
    }
    else{
        res.status(400).send("pokemon not provided");
    };

});

router.get('/:user', function(req, res) {
    // get all a user's pokemon
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

router.get('/random', function(req, res) {
    console.log("getting a random pokemon");
    var url = "https://pokeapi.co/api/v2/pokemon/" + getRandomInt(1, 802); // pokemon id are in range (1, 802) 
    console.log(url);
    var pokemon = getPokemonFromPokeApi(url);
    pokemon.then(data => {
        console.log("retrieved random pokemon: " + data);
        //var jsonPoke = JSON.parse(data);
        var pokeName = data.name;
        console.log(pokeName);
        res.status(200).send(pokeName);
    })
    .catch(err => {
        res.status(500).send("problem getting random pokemon name");  
    })

})

//create new pokemon //NEED TO FIND WAY TO GET USERNAME
router.post('/', function(req, res) {
	var pokemon = req.body;
	var pokeName = req.body.pokename;
	var user = req.body.user;
	console.log("post request: ") 
    console.log(pokemon);
	// make sure pokemon with that name doesn't already exist
	var pokemon = createPokemonCheck(pokeName, user);
	pokemon.then(exists => {
            if(exists !== null){
                res.status(409).json({message: "pokemon with this name already exists", data: pokemon});
            }
            else{
                //store all info into a pokemon object and submit the pokemon
                var type = {"slot": 1, "type" : {'name': req.body.type1}};
                var types = [type];
                if(req.body.type2 !== ""){
                    console.log("poke type2");
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
                    'status': req.body.status // public, private
                }
                //submit to db
                submitNewPokemonToDB(pokemodel).then(data =>{
                    if(data == "ok"){
                        console.log("successfully inserted <" + pokeName + "> into database");
                        res.status(200).json(pokemodel); // need to trigger successful submittion function  
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

//pokemonId is the pokemon's name
router.put('/:pokemonId', function(req, res) {
    var user = req.query.user;
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
            updatePokemonInPokeDB(pokename).then(data => {
                if(data.length !== 1){
                    console.log("did not updaate one pokemon properly");
                    res.status(500).send("an error occured when accessing the db");        
                }
                else{
                    console.log("update successful");
                    res.status(200).send(data[0]);
                }                
            }).catch(err => {
                console.log("problem with update");
                res.status(500).send("an error occured when accessing the db");        
            })
        }
    }).catch(err => {
        console.log("problem finding pokemon in localdb");
        res.status(500).send("an error occured");    
    })
    
});

//pokemonId is the pokemon's name
router.delete('/:pokemonId', function(req, res) {
    var user = req.query.user;
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

/* get all pokemon created by user */
function lookupUserPokemon(username) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(MongoDBUrl, function(err,res){
            if (err) {
                console.log(err);
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


/*retrieves pokemon at url and returns a promise with the pokemon data*/
function getPokemonFromPokeApi(url){
    return new Promise((resolve, reject) => {
        request.get(url, function (err, res, body) {
            if(err) {
                console.log(err);
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
    /*conecting to the database*/
    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              console.log(err);
              reject(err);
              db.close();
              return; 
            } 
            console.log("prepping Database for submition");
            db = res
            // need this to be returned
            db.collection(pokeCollection).insertOne(pokemon, function(err, res){
            //continue
                if(err){
                  console.log(err);
                  reject(err); 
                }
                var jsonRes = JSON.parse(res);
                if(jsonRes.ok == 1){
                    console.log("inserted " + pokemon.name + " into database")
                    resolve("ok");   
                }
                else{
                    console.log("response not ok: " + res)
                    reject(res);
                }
                db.close();
                return
            });                    
        });
    }) 
}

/*ensures there are no overlaps in the db, returns pokemon with pokename*/
function createPokemonCheck(pokeName, user){
    return new Promise((resolve, reject) => {
        if (pokeName == ""){
            console.log('Pokemon name input was blank');
            reject("Pokemon name input was blank");
        }

        pokeWithPokeName = null;

        var localPokes = searchLocalPokeDB(pokeName);
        // this is not null or empty
        localPokes
        .then(data => {
            console.log("retrieved <" + pokeName + "> from local db");
            console.log(data);
            console.log(data.length);
            //data should be an array or is null
            if(data.length > 0){
                console.log("pokemon with name <" + pokeName + "> already exists");
                resolve(data[0]);
                return;
            }
            // then check other promise/ pokeapi
            var pokeUrl = searchOrigPokemon(pokeName);
            pokeUrl
            .then(url => {
                console.log("Function 1: Pokemon list")
                console.log(url)
                if(url !== null){
        		    request.get(url, function (err, res, body) {
                        if(err) {
                            console.log(err);
                            reject(err);
                        } 
                        else {
                            var data = JSON.parse(body)
                            console.log("retrieving pokemon from pokeapi")
                            resolve(data);
                            return; 
                        }
                    })
                }
                else{
                    // no pokemon with that name exists
                    resolve(null);
                }
            })
            .catch(err => {
                console.log(err)
            })

        })
        .catch(err => {
            reject(err)
        })

    })
    
}

/* gets you all of the pokemon with pokename in the local db*/
function searchLocalPokeDB(pokeName){
    /*conecting to the database*/
    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              console.log(err);
              reject(err); 
            } 
            console.log("Database created");
            db = res
            // need this to be returned
            db.collection(pokeCollection).find({name: pokeName}, { _id:0, name:1, height:1, weight:1, types:1, stats:1, sprites:1, user:1, status:1}).toArray(function(err, results){
                console.log(results);
                resolve(results);
                db.close();
            })     
        });
    }) 
}

/*searches the orig pokeapi for pokemon with name pokeName and returns a promise with url if exists or null if it doesn't*/
function searchOrigPokemon(pokeName){
    console.log("searching pokeapi")
    if (pokeName == ""){
        console.log("input was blank");
        return;
    } 
    pokemonInfoURL = new Promise((resolve, reject) => {
    
        /* checking pokemon pages for that pokemon checking by number of sets*/
        page = "https://pokeapi.co/api/v2/pokemon/?limit=50&offset=0";
    	request.get(page, function (err, res, body) {
    	    if(err) {
        		console.log("an error occured while retrieving the pokemon data, request could not be completed, ");
        		reject(err);
    	    }
    	    else {
        		var data = JSON.parse(body)
        		console.log("starting recursive search")
        		resolve(recursivePokeAPISearch(data, pokeName, 0));
        		return;
    	    }
    	})

    })
    return pokemonInfoURL;
}

/*recursively handling http get request for pokemon searches*/
function recursivePokeAPISearch(result, pokeName, offset){
    console.log("recursive searching " + offset)
    var pokeFound = false;
    var pokeinfo = new Promise((resolve, reject) => {
        for(var pkmon of result.results){
            if(pkmon.name == pokeName && !pokeFound){
                pokeFound = true;
                console.log("found pokemon")
                resolve(pkmon.url); 
            }
        }
        if(!pokeFound && offset < 950){
            pkOffset = offset + 50;
            page = "https://pokeapi.co/api/v2/pokemon/?limit=50&offset=" + pkOffset;

    	    request.get(page, function (err, res, body) {
	       	if(err) {
		        console.log("an error occured while retrieving the pokemon data, request could not be completed");
		        reject(error);
		    }
		    else {
                var data = JSON.parse(body);
                console.log("resolving promise with recusive call promise")
                resolve(recursivePokeAPISearch(data, pokeName, pkOffset)) 
            }
	    })
        }else{
            if(offset >= 950){
                console.log("pokemon <" + pokeName + "> could not be found in pokeAPI");
                resolve(null);
            }
        }
    })
    console.log("finishing recursive search")
    return pokeinfo;    
}


/* Get a random Pokemon if from range (min, max)
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/*delete pokemon with this name from the db*/
function deleteFromPokeDB(pokeName){
/*conecting to the database*/
    console.log("deleting pokemon <" + pokeName+ "> from db");
    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              console.log(err);
              reject(err); 
            } 
            console.log("connected to pokemon database");
            db = res
            // need this to be returned
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

/*delete pokemon with this name from the db*/
function updatePokemonInPokeDB(pokemon){
/*conecting to the database*/

    var pokename = pokemon.pokename;
    console.log("updating pokemon <" + pokename + "> from db");
    var type = {"slot": 1, "type" : {'name': pokemon.type1}};
    var types = [type];
    if(pokemon.type2 !== ""){
        var type2 = {"slot": 2, "type" : {'name': pokemon.type2}}
        types.push(type2);
    }
    console.log("types: ");
    console.log(types);

    var stats = [];
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/6/", "name": "speed"}, "base_stat": pokemon.speed});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/5/", "name": "special-defense"}, "base_stat": pokemon.spcdefense});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/4/", "name": "special-attack"}, "base_stat": pokemon.spcattack});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/3/", "name": "defense"}, "base_stat": pokemon.defense});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/2/", "name": "attack"}, "base_stat": pokemon.attack});
    stats.push({"stat": {"url": "https://pokeapi.co/api/v2/stat/1/", "name": "hp"}, "base_stat": pokemon.hp});
    console.log(stats);

    var sprites = null;
    if(pokemon.sprites !== null){
        sprites = {'front_default': pokemon.pokeimage};
    }
    console.log(sprites);
    //var updateQuery = {"height": pokemon.height, "weight": pokemon.weight, "types": types, "stats": stats};

    // if(sprites !== null){
    //     updateQuery["sprites"] = sprites;
    // // }
    // console.log(updateQuery);
    return new Promise((resolve, reject) =>{
        MongoClient.connect(MongoDBUrl, function(err,res){
            if(err){
              console.log(err);
              reject(err); 
            } 
            console.log("connected to pokemon database");
            db = res
            // need this to be returned
            //cut this out later
            db.collection(pokeCollection).find({name: pokename}, { _id:0, name:1, height:1, weight:1, types:1, stats:1, sprites:1, user:1, status:1}).toArray(function(err, results){
                        console.log(results);
            })

            db.collection(pokeCollection).update({name: pokename}, {$set: {"height": pokemon.height, "weight": pokemon.weight, "types": types, "stats": stats, "status": pokemon.status}}, function(err, results) {
                if(err){
                    console.log(err);
                    reject(err);
                    db.close();
                    return;  
                }
                if(sprites !== null){
                    db.collection(pokeCollection).update({name: pokename}, {$set: {"sprites": sprites}}, function(err, results) {
                        if(err){
                            console.log(err);
                            reject(err);  
                        }
                        console.log("successfully updated sprites");
                        db.close();
                        return;
                    }) 
                }
                console.log("successfully modified");
                db.collection(pokeCollection).find({name: pokename}, { _id:0, name:1, height:1, weight:1, types:1, stats:1, sprites:1, user:1, status:1}).toArray(function(err, results){
                    console.log(results);
                    resolve(results);
                    db.close();
                    return;
                })
            });
        });
    })   
}

module.exports = router;