const express = require('express');
const router = express.Router();
const request = require('request')

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var MongoDBUrl = "mongodb://csc309f:csc309fall@ds117316.mlab.com:17316/csc309db";
var pokeCollection = "sweet-and-spicy-grilled-pineapple-pokemon-COLLECTION";
// Routes relative to '/api/pokemon'

router.get('/', function(req, res) {
	console.log("req: " + req);
	console.log("res: " + res);
    res.json({message: "nothing to see here either"});

});

//create new pokemon //NEED TO FIND WAY TO GET USERNAME
router.post('/', function(req, res) {
	var pokemon = req.body;
	var pokeName = req.body.pokename;
	var user = getUser("user");
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
    res.json({message: "can't update pokemon yet"});
});

//pokemonId is the pokemon's name
router.delete('/:pokemonId', function(req, res) {
    res.json({message: "can't delete pokemon yet"});
});


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
            console.log("retrieved <" + pokeName + "> form local db");
            console.log(data);
            //data should be an array or is null
            if(data.length > 0){
                for(index = 0; index < data.length; index++){
                    if(data[index].status == "public"){
                        console.log("<" + pokeName + "> is already taken");
                        resolve(data[index]);
                        return;
                    }
                    else if(data[index].user == user){
                        console.log("user already made pokemon with name <" + pokeName + ">");
                        resolve(data[index]);
                        return;
                    }
                }

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
		console.log("an error occured while retrieving the pokemon data, request could not be completed");
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


function getUser(res){
    return res;
}


module.exports = router;
