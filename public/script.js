//var MongoClient = require('mongodb').MongoClient;
var MongoDBUrl = "mongodb://csc309f:csc309fall@ds117316.mlab.com:17316/csc309db";
var pokeCollection = "sweet-and-spicy-grilled-pineapple-pokemon-COLLECTION";

/* Create side navigation bar and main content box
 */
function createViewOutline() {
    $(".content").remove();

    $(".main").append(
        $('<div/>', {'class': 'row content'}).append(
            $('<div/>', {'class': 'col-sm-3 nav-box', text:"Navigation"}),
            $('<div/>', {'class': 'col-sm-9 inner-content', 'align': 'center'})
        )
    )
    $(".nav-box").append(
        $('<ul/>', {'class': 'nav'}).append(
            $('<li/>', {'class': 'nav-item', 'id': 'single-poke', text: "Single Pokemon data"}),
            $('<li/>', {'class': 'nav-item', 'id': 'compare-poke', text: "Pokemon comparison"}),
            $('<li/>', {'class': 'nav-item', 'id': 'create-poke', text: "Create a Pokemon"})
        )
    )
    $("#single-poke").on("click", createSinglePokeView);
    $("#compare-poke").on("click", createPokeCompareView);
    $("#create-poke").on("click", createCreatePokeView);
}


/* Create all elements required for the Single Pokemon stats view
 */
function createSinglePokeView() {
    console.log("Creating single pokemon stats view");

    $(".inner-content").html("");
    $(".inner-content").append(
        $('<div/>', {'class': 'input-bar'}).append(
            $('<button/>', {'class': 'random-button', text: "Random"}),
            $('<input/>', {'type': 'text', 'id': 'single-input', 'placeholder': "Input Pokemon", 'maxlength': "11", 'size': "15"}),
            $('<button/>', {'class': 'submit-button', 'id': 'single-submit', text: "Submit"})
        ),
        $('<div/>', {'class': 'display-stats'})
    );

    $(".random-button").on("click", {field: "single-input"}, getRandomPokemon);
    $("#single-submit").on("click", singlePokemon);
}


/* Create all elements required for the Pokemon compare view
 */
function createPokeCompareView() {
    console.log("Creating pokemon comparison view");

    $(".inner-content").html("");
    $(".inner-content").append(
        $('<div/>', {'class': 'container'}).append(
            $('<div/>', {'class': 'row'}).append(
                $('<div/>', {'class': 'col-sm-5 pokemon-col'}),
                $('<div/>', {'class': 'col-sm-2 between-cols'}),
                $('<div/>', {'class': 'col-sm-5 pokemon-col'})
            )
        )
    )

    $(".pokemon-col").each(function(i, elem) {
        $(elem).append(
            $('<div/>', {'class': 'input-bar'}).append(
                $('<button/>', {'class': 'random-button', text: "Random"}).on("click", {field: "input-"+i}, getRandomPokemon),
                $('<input/>', {'type': 'text', 'id': "input-"+i,'placeholder': "Pokemon " + (i+1), 'maxlength': "11", 'size': "15"})
            ),
            $('<div/>', {'class': 'pokemon-compare-display', 'id': "comp-disp-"+i})
        )
    })
    $(".between-cols").append(
        $('<button/>', {'class': 'submit-button compare-submit', text: "Submit"})
    )
    
    $(".compare-submit").on("click", doublePokemon);
}


/* Get a random Pokemon if from range (min, max)
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


/* Get Pokemon data by the random id from the API
 */
function getPokemonById(id, getPokemonName){
    pokemonName = $.ajax({
        type: 'GET',
        url: "https://pokeapi.co/api/v2/pokemon/" + id.toString() + "/",
        success: function(pokemonData){
             getPokemonName(pokemonData);
        },
        error: function() {
            alert('Error occured');
        }
    })
}


/* Get a random Pokemon name from the API
 */
function getRandomPokemon(event) {
    randomPokemonId = getRandomInt(1, 802); // pokemon id are in ragne (1, 802)
    pokemon = getPokemonById(randomPokemonId, function(pokemonData){
        pokemonName = pokemonData.name // get name from pokemon data
        console.log("found random pokemon " + pokemonName);
        $("#"+event.data.field).val(pokemonName); // display pokemon name
        });
    }


/* Check that input is formFilledby querying API and display Pokemon stats
 */

function displayPokemonStats(input) {
    pokemon = $(input).val().toLowerCase().replace(/ /g, "-");

    pokemonInfo = null;
    /* TODO query API and if data is valid, display stats in $(.display-stats) */
    /* checking pokemon pages for that pokemon checking by number of sets*/
    page = "https://pokeapi.co/api/v2/pokemon/?limit=50&offset=0";
    $.ajax({type:'GET', url: page, success: function(result){
        recursiveAjaxSearch(result, input, 0, input);
    },
    error: function(request, status, error){
        couldNotAccessAPIError(request, status, error);
    }
    })
}


var dl_load = false;
var rl_load = false;
var load_complete = dl_load && dr_load;

/*recursively handling ajax request for pokemon searches*/
function recursiveAjaxSearch(result, input, offset, input){
    var pokeFound = false;
    pokemon = $(input).val();
        if (pokemon == ""){
        alert('You input is blank, please input.');
        return;
    } else {
        for(let pkmon of result.results){
            if(pkmon.name == pokemon){
                pokeFound = true;
                console.log("looking up " + pokemon);
                $.ajax({type:'GET', url: pkmon.url, success: function(result){
                    if (input == "#single-input") {
                        $(".display-stats").empty();
                        display_field = $(".display-stats");
                        i = 0;
                        }
                    else if (input == "#input-0") {
                        // clear current field
                        $("#comp-disp-0").html("");
                        display_field = $("#comp-disp-0");
                        dl_load = true;
                        load_complete = dl_load && dr_load;
                        console.log("Complete after load pokemon1:"+load_complete);
                        i = 1; 
                    }
                    else if (input == "#input-1") {
                        $("#comp-disp-1").html("");
                        display_field = $("#comp-disp-1");
                        dr_load = true;
                        load_complete = dl_load && dr_load;
                        console.log("Complete after load pokemon2:"+load_complete);
                        i = 2;
                    }
                    renderPokemonStats(result, display_field, i.toString());
                    handle_load(load_complete);
                    return;
                },
                error: function(request, status, error){
                    couldNotAccessAPIError(request, status, error)
                }
                })
            }
        }
        if(!pokeFound && offset < 950){
            pkOffset = offset + 50;
            page = "https://pokeapi.co/api/v2/pokemon/?limit=50&offset=" + pkOffset;
            $.ajax({type:'GET', url: page, success: function(result){
                recursiveAjaxSearch(result, pokemon, pkOffset, input)
            }, error: function(request, status, error){
                couldNotAccessAPIError(request, status, error)
            }
            })
        }else{
            if(offset >= 950){
                alert("could not find pokemon <" + pokemon + "> please try another");
            }
        }
    }
}


/*initiates pokemon comparision once data has loaded */
function handle_load(l_c){
    if (load_complete){
        console.log("load stats complete"); 
        comparePokemon("#comp-disp-0", "#comp-disp-1");
    };}


/*alert user if the there was an issue accessing the API*/
function couldNotAccessAPIError(request, status, error) {
    alert("an error occured while retrieving the pokemon data, request could not be completed");
    return;
}

/*display stats of a single pokemon*/
function singlePokemon(){
    displayPokemonStats(input="#single-input");
}

/*display stats of two pokemon*/
function doublePokemon(input_field){
    dl_load = false;
    dr_load = false;
    $("#comp-disp-0").html("");
    $("#comp-disp-1").html("");
    if ($("#input-0").val()!=$("#input-1").val()){
        displayPokemonStats(input="#input-0");  
        displayPokemonStats(input="#input-1");
    } else {
        alert('Please insert two different pokemons.');
    }
    return;
}


/* Retrieve two Pokemons' data from the API and compare their stats
 */
function comparePokemon(p1, p2) {
    /* TODO query API and if both names are valid, 
     *      display pokemon1's stats in $("#comp-disp-0") 
     *      display pokemon2's stats in $("#comp-disp-1") 
     */
    // COMPARISON starts here    
    // attributes (base stats) to compare: speed, special defense, special attack, defense, attack and Hp.
    // respect id names: "speed"+i, "special-defense"+i, "special-attack"+i, "defense"+i, "attack"+i, and "hp"+i.
    
    var dict = [];
    
    //"speed"
    sp1 = parseInt($("#speed1 > td").text());
    sp2 = parseInt($("#speed2 > td").text());
    dict[0] = new Array(sp1, sp2, $("#speed1"), $("#speed2"));
                                    
    //"special-defense"
    sd1 = parseInt($("#special-defense1 > td").text());
    sd2 = parseInt($("#special-defense2 > td").text());
    dict[1] = new Array(sd1, sd2, $("#special-defense1"), $("#special-defense2"));
    
    //"special-attack"+i
    sa1 = parseInt($("#special-attack1 > td").text());
    sa2 = parseInt($("#special-attack2 > td").text());
    dict[2] = new Array(sa1, sa2, $("#special-attack1"), $("#special-attack2"));
    
    //"defense"
    df1 = parseInt($("#defense1 > td").text());
    df2 = parseInt($("#defense2 > td").text());
    dict[3] = new Array(df1, df2, $("#defense1"), $("#defense2"));
    
    //"attack"
    ak1 = parseInt($("#attack1 > td").text());
    ak2 = parseInt($("#attack2 > td").text());
    dict[4] = new Array(ak1, ak2, $("#attack1"), $("#attack2"));
    
    //"hp"
    hp1 = parseInt($("#hp1 > td").text());
    hp2 = parseInt($("#hp2 > td").text());
    dict[5] = new Array(hp1, hp2, $("#hp1"), $("#hp2"));
    
    for (var i = 0; i < dict.length; i++) {
        if (dict[i][0] < dict[i][1]) {
            dict[i][3].css("background-color", "turquoise");
        } 
        if (dict[i][0] == dict[i][1]) {
            dict[i][2].css("background-color", "turquoise");
            dict[i][3].css("background-color", "turquoise");
        }
        if (dict[i][0] > dict[i][1]) {
            dict[i][2].css("background-color", "turquoise");
        }
    }

    // display comparsion result
    $(p1);
    $(p2);
    console.log("highlight comparison complete");
}

/*render the stats of a pokemon*/
function renderPokemonStats(pokemonInfo, display_field, i) {
    console.log("display stats");
    console.log(pokemonInfo);

    /*for safe measure, remove everything in the display stats section first*/

    /*display the stats*/
    display_field
    .append($('<figure/>')
        .append($('<img/>', {'src': pokemonInfo.sprites.front_default, 'height': 96, 'width': 96}))
        .append($('<figcaption/>').html("Front"))
    )
    if (pokemonInfo.sprites.back_default){
        display_field
        .append($('<figure/>')
            .append($('<img/>', {'src': pokemonInfo.sprites.back_default}))
            .append($('<figcaption/>').html("Back"))
        )
    }
    if(pokemonInfo.sprites.front_female){
        display_field
        .append($('<figure/>')
            .append($('<img/>', {'src': pokemonInfo.sprites.front_female}))
            .append($('<figcaption/>').html("Female front")))
        .append($('<figure/>')
            .append($('<img/>', {'src': pokemonInfo.sprites.back_female}))
            .append($('<figcaption/>').html("Female back")))
    }

    display_field
    .append($('<table/>', {'id':'stats'+i})
        .append($('<tr/>', {'id': 'name'+i})
            .append($('<th/>').html("Name:"))
            .append($('<td/>').html(attributePP(pokemonInfo.name)))
        )
        .append($('<tr/>', {'id': 'height'+i})
            .append($('<th/>').html("Height:"))
            .append($('<td/>').html(pokemonInfo.height))
        )
        .append($('<tr/>', {'id': 'weight'+i})
            .append($('<th/>').html("Weight:"))
            .append($('<td/>').html(pokemonInfo.weight))
        )
        .append($('<tr/>', {'id': 'poketypes'+i})
            .append($('<th/>').html("Types: "))
            .append($('<td/>')
                .append($('<ul/>', {'id':'poketypes'+i})
                    .append(pokemonInfo.types.map(ptype => $("<li>").text(attributePP(ptype.type.name))))
                )
            )
        )
        .append($('<tr/>')
            .append($('<th/>', {'colspan' : 2}).html("Base Stats: "))
        )
        .append(pokemonInfo.stats.map(pstat => $("<tr/>", {'class': 'pokestat', 'id': pstat.stat.name.toString()+i})
            .append($('<th/>').html(attributePP(pstat.stat.name)))
            .append($('<td/>').html(pstat.base_stat))
            )   
        )
    )
}



/* Create Create Pokemon view
 */
function createCreatePokeView() {
    console.log("Creating create pokemon view");

    $(".inner-content").html("");
    $(".inner-content").append(
        $('<div/>', {'class': 'create-poke-image'}).append(
            $('<img/>', {'id': 'create-poke-pic', 'height': 96, 'width': 96}),
            $('<button/>', {'id': 'preview-button', 'text': "Preview"})
        ),
        $('<form/>', {'name': 'create-poke-name-submission-page', 'id': 'create-poke-form', "onsubmit":"return submitPokemonCreationForm()", "method":"post"}).append(
            // $('<div/>', {'class': 'create-poke-image'}).append(
            //     $('<img/>', {'id': 'create-poke-pic', 'height': 96, 'width': 96}),
            $('<input/>', {'type': 'text', 'id': 'create-poke-image', 'placeholder': "image url", 'size': "15"}),
            //     $('<button/>', {'id': 'preview-button', 'text': "Preview"})
            // ),
            $('<table/>', {'id':'stats'}).append(
                $('<tr/>', {'id': 'name'}).append(
                    $('<th/>').html("Name:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'id': 'create-poke-name', 'placeholder': "Pokemon Name", 'maxlength': "11", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'height'}).append(
                    $('<th/>').html("Height:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'id': 'create-poke-height', 'placeholder': "height in cm", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'weight'}).append(
                    $('<th/>').html("Weight:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'id': 'create-poke-weight', 'placeholder': "weight in kg", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'types'}).append(
                    $('<th/>').html("Types:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'id': 'create-poke-type1', 'placeholder': "normal", 'size': "15"}),
                        $('<input/>', {'type': 'text', 'id': 'create-poke-type2', 'placeholder': "type2, optional", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'base-stats'}).append(
                    $('<th/>', {'colspan' : 2}).html("Base Stats: ")
                ),
                $('<tr/>', {'id': 'speed'}).append(
                    $('<th/>').html("Speed:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'id': 'create-poke-speed', 'placeholder': "1", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'special-defense'}).append(
                    $('<th/>').html("Special-defense:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'id': 'create-poke-special-defense', 'placeholder': "1",'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'special-attack'}).append(
                    $('<th/>').html("Special attack:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'id': 'create-poke-special-attack', 'placeholder': "1", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'defense'}).append(
                    $('<th/>').html("Defense:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'id': 'create-poke-defense', 'placeholder': "1", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'attack'}).append(
                    $('<th/>').html("Attack:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'id': 'create-poke-attack', 'placeholder': "1", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'hp'}).append(
                    $('<th/>').html("Hp:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text','id': 'create-poke-hp', 'placeholder': "1", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'private-status'}).append(
                    $('<th/>', {'colspan' : 2}).append(
                        $('<input/>', {'type': 'radio', 'name': 'status', 'value': "public", 'checked': "checked"}),
                        "public",
                        $('<br/>'),
                        $('<input/>', {'type': 'radio', 'name': 'status', 'value': "private", 'text': 'private'}),
                        "private"
                    )
                )
            ),
            $('<button/>', {'class': 'submit-button', 'id': 'create-poke-name-submit', 'text':"Submit"})
       ) 
    );

    $("#preview-button").on("click", previewImage);
    //$("#create-poke-name-submit").on("click", submitPokemonCreationForm);
}

function previewImage() {
    console.log("preview image");
    url = $("#create-poke-image").val();
    console.log(url);
    if(url==""){
        url = "https://cdn77.sadanduseless.com/wp-content/uploads/2014/03/derp8.jpg";       
    }
    $('#create-poke-pic').attr('src', url);
    return;
}

/* Submits the pokemon to the db if is valid*/
function submitPokemonCreationForm() {
    console.log("submit pokemon")
    var user = getCookie("username");
    // check if pokemon name already in directory
    var pokeName = $("#create-poke-name").val().toLowerCase().replace(/ /g, "-");
    var status = $('input[name=status]:checked').val();
    if(!isValidPokemonCreation()){
        alert("page is missing input, please fill in all the fields provided");
        return false; 
        
    }
    else{
        console.log("page is valid");
        
        var pokemon = createPokemonCheck(pokeName, status);

        //if pokemon already exists prompt user to come up with a new name
        if(pokemon){
            alert("pokemon with this name already exists, please enter a new name");
            return false;
        }
        else{
            //store all info into a pokemon object and submit the pokemon
            var types = [$("#create-poke-type1").val()];
            if($("#create-poke-type2").val() !== ""){
                console.log("poke type2");
                types.push($("#create-poke-type2").val());
            }

            var pokeImg = $("#create-poke-image").val();
            if(pokeImg == ""){
                pokeImg = "https://cdn77.sadanduseless.com/wp-content/uploads/2014/03/derp8.jpg";
            }

            var pokemon = {
                'name': pokeName,
                'height': $("#create-poke-height").val(),
                'weight': $("#create-poke-weight").val(),
                'types': types,
                'speed': $("#create-poke-speed").val(),
                'special_defense': $("#create-poke-special-defense").val(),
                'special_attack': $("#create-poke-special-attack").val(),
                'defense': $("#create-poke-defense").val(),
                'attack': $("#create-poke-attack").val(),
                'hp': $("#create-poke-hp").val(),
                'sprites': {'front_default': pokeImg},
                'user': user,
                'status': status //del, public, private
            }
            //submit to db
            console.log(pokemon);
            return false;
        }
    }
}

/*validates the pokemon creation page */
function isValidPokemonCreation(){
    console.log("validating pokemon creation form")
    var formFilled= true;
    $("#create-poke-form input[type=text]").each(function(){
        console.log($(this).val())
        if($(this).val()==""){
            console.log($(this).attr("id"))
            if($(this).attr("id")!=="create-poke-type2" && $(this).attr("id")!=="create-poke-image"){
                formFilled= false;
                return false;
            }
        }
    });

    return valid;
    //return false
}

function createPokemonCheckPublic(pokeName){
    return new Promise((resolve, reject) => {
        if (pokeName == ""){
            console.log('input was blank');
            alert('input was blank');
            reject("input was blank");
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
                }

            }
            // then check other promise/ pokeapi
            var pokeUrl = searchOrigPokemon(pokeName);
            pokeUrl
            .then(data => {
                console.log("Function 1: Pokemon list")
                console.log(data)
                if(data !== null){
                    $.ajax({type:'GET', url: data, success: function(result){
                            console.log("retrieving pokemon from pokeapi")
                            resolve(result);
                            return;
                            //return recursivePokeAPISearch(result, pokeName, pkOffset);
                        }, error: function(request, status, error){
                            couldNotAccessAPIError(request, status, error);
                            reject(error);
                        }
                    })   
                }
                else{
                    // no pokemone with that name exists
                    resolve(null);
                }
            })
            .catch(err => {
                console.log(error)
            })

        })
        .catch(err => {
            reject(error)
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
            db.collection(pokeCollection).find({name: pokeName}, { _id:0, name:1, height:1, weight:1, types:1, speed:1, special_defense:1, special_attack:1, defense:1, attack:1, hp:1, sprites:1, user:1, status:1}).toArray(function(err, results){
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
        $.ajax({type:'GET', url: page, success: function(result){
                console.log("starting recursive search")
                resolve(recursivePokeAPISearch(result, pokeName, 0));
            },
            error: function(request, status, error){
                couldNotAccessAPIError(request, status, error);
            }
        })
    })
    return pokemonInfoURL;
}

/*recursively handling ajax request for pokemon searches*/
function recursivePokeAPISearch(result, pokeName, offset){
    //return new Promise((resolve, reject) => {
        console.log("recursive searching" + offset)
        var pokeFound = false;
        var pokeinfo = new Promise((resolve, reject) => {
            console.log("starting promise")
            for(let pkmon of result.results){
                console.log(pkmon.name)
                if(pkmon.name == pokeName && !pokeFound){
                    pokeFound = true;
                    console.log("found pokemon")
                    resolve(pkmon.url); 
                }
            }
            if(!pokeFound && offset < 950){
                pkOffset = offset + 50;
                page = "https://pokeapi.co/api/v2/pokemon/?limit=50&offset=" + pkOffset;
                console.log("doing another get request" + page)
                $.ajax({type:'GET', url: page, success: function(result){
                        console.log("resolving promise with recusive call promise")
                        resolve(recursivePokeAPISearch(result, pokeName, pkOffset))
                        //return recursivePokeAPISearch(result, pokeName, pkOffset);
                    }, error: function(request, status, error){
                        couldNotAccessAPIError(request, status, error);
                        reject(error);
                    }
                })
            }else{
                if(offset >= 950){
                    console.log("pokemon <" + pokeName + "> could not be found in pokeAPI")
                    resolve(null);
                }
            }
        })
        console.log("finishing recursive search")
        return pokeinfo;    
}





function getCookie(string){
    return "username";
};


/* Pretty print an attribute by replacing dashes with spaces and capitalizing the first letter */
function attributePP(string) {
    var newstr = string.replace(/-/g, " ");
    return newstr.charAt(0).toUpperCase() + newstr.slice(1);
}


$(document).ready(function(){
    //Clicking header reloads page
    $(".header").on("click", function(){location.reload()})

    //Navigation bar
    $(".main-nav-item").on("click", createViewOutline);
    $("#single-poke").on("click", createSinglePokeView);
    $("#compare-poke").on("click", createPokeCompareView);
    $("#create-poke").on("click", createCreatePokeView);

    //Check for status updates
    (function updater() {
        $.ajax({
            url: '/api/messages/show', 
            success: function(data) {
                $("#messages-list").html("");
                if (data.messages.length == 0) {
                    $("#messages-list").append($('<li/>', {text: "No new messages"}));
                }
                data.messages.forEach(function(elem, i) {
                    var time = new Date();
                    time.setTime(elem.time);
                    $("#messages-list").append(
                        $('<li/>', {text: time.toLocaleTimeString() + " " + elem.text})
                    );
                });
            },
            complete: function() {
                // Schedule the next request 10s after the current one is complete
                setTimeout(updater, 10000);
            }
        });
    })();
});
