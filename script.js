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
    );
    $(".nav-box").append(
        $('<ul/>', {'class': 'nav'}).append(
            $('<li/>', {'class': 'nav-item', 'id': 'single-poke', text: "Single Pokemon data"}),
            $('<li/>', {'class': 'nav-item', 'id': 'compare-poke', text: "Pokemon comparison"}),
            $('<li/>', {'class': 'nav-item', 'id': 'edit-delete-poke', text: "Manage Pokemons"}),
            $('<li/>', {'class': 'nav-item', 'id': 'log-out', text: "Log Out"})
        )
    )
    $("#single-poke").on("click", createSinglePokeView);
    $("#compare-poke").on("click", createPokeCompareView);
    $("#edit-delete-poke").on("click", createManagePokeView);
    $("#log-out").on("click", userLogOut);
}


/* Create all elements required for the Single Pokemon stats view
 */
function createSinglePokeView() {
    console.log("Creating single pokemon stats view");

    $(".inner-content").html("");
    $(".inner-content").append(
        $('<div/>', {'class': 'input-bar'}).append(
            $('<button/>', {'class': 'random-button', text: "Random"}).on("click", {field: "single-input"}, getRandomPokemon),
            $('<input/>', {'type': 'text', 'id': 'single-input', 'placeholder': "Input Pokemon", 'maxlength': "11", 'size': "15"}),
            $('<button/>', {'class': 'submit-button', 'id': 'single-submit', text: "Submit"}).on("click", singlePokemon)
        ),
        $('<div/>', {'class': 'display-stats'})
    );
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
        $('<button/>', {'class': 'submit-button', text: "Submit"}).on("click", doublePokemon)
    )
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
            alert('Error occured: rejected by API.');
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


/* Check that input is valid by querying API and display Pokemon stats
 */

function displayPokemonStats(input) {
    pokemon = $(input).val().toLowerCase().replace(/ /g, "-");
    /* TODO query API and if data is valid, display stats in $(.display-stats) */
    /* checking pokemon pages for that pokemon checking by number of sets*/
    page = "https://pokeapi.co/api/v2/pokemon/?limit=50&offset=0";
    $.ajax({type:'GET', url: page, success: function(result){
        recursiveAjaxSearch(result, pokemon, 0, input);
    },
    error: function(request, status, error){
        alert('Error occured: rejected by API.');
    }
    })
}


var dl_load = false;
var rl_load = false;
var load_complete = dl_load && dr_load;
var offset0 = 0;
var offset1 = 0;

/*recursively handling ajax request for pokemon searches*/
function recursiveAjaxSearch(result, pokemon, offset, input){
    var pokeFound = false;
    pokemon = $(input).val();
    if (pokemon == ""){
        alert('Some of your input is blank, please insert pokemon.');
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
                    else if (input == "#single-input-delete") {
                        $(".display-stats-delete").empty();
                        display_field = $(".display-stats-delete");
                        i = 3;
                        }
                    else if (input == "#single-input-edit") {
                        $(".display-stats-edit").empty();
                        display_field = $(".display-stats-edit");
                        i = 4;
                        }
                    else if (input == "#input-0") {
                        // clear current field
                        if (offset == 0){offset0 = 0};
                        console.log("OFFSET0: ", offset0);
                        $("#comp-disp-0").empty();
                        display_field = $("#comp-disp-0");
                        dl_load = true;
                        load_complete = dl_load && dr_load;
                        console.log("Complete after load pokemon1:"+load_complete);
                        i = 1; 
                    }
                    else if (input == "#input-1") {
                        if (offset == 0){offset1 = 0};
                        console.log("OFFSET1: ", offset1);
                        $("#comp-disp-1").empty();
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
        if (((input != "#input-0" || "#input-1") && (!pokeFound) && (offset < 950)) ||
            (input == "#input-0" && (!pokeFound) && offset0 < 950) || 
            (input == "#input-1" && (!pokeFound) && offset1 < 950)) {
            if (input != "#input-0" || "#input-1") {pkOffset = offset + 50}
            else if (input == "#input-0") {pkOffset = offset0 + 50; offset0 = offset0 + 50}
            else if (input == "#input-1") {pkOffset = offset1 + 50; offset1 = offset1 + 50}
            
            page = "https://pokeapi.co/api/v2/pokemon/?limit=50&offset=" + pkOffset;
            $.ajax({type:'GET', url: page, success: function(result){
                recursiveAjaxSearch(result, pokemon, pkOffset, input)
            }, error: function(request, status, error){
                couldNotAccessAPIError(request, status, error)
            }
            })
        } else if (((input != "#input-0" || "#input-1") && (!pokeFound) && (offset >= 950)) ||
                   (input == "#input-0" && (!pokeFound) && offset0 >= 950) || 
                   (input == "#input-1" && (!pokeFound) && offset1 >= 950)) {
                alert("could not find pokemon <" + pokemon + "> please try another");
        }
    }
}


/*initiates pokemon comparision once data has loaded */
function handle_load(l_c){
    if (load_complete == true){
        comparePokemon("#comp-disp-0", "#comp-disp-1");
    };
}


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
function doublePokemon(){
    dl_load = false;
    dr_load = false;
    load_complete = false;
    $("#comp-disp-0").html("");
    $("#comp-disp-1").html("");
    if ($("#input-0").val()!=$("#input-1").val()){
        offset0 = 0;
        offset1 = 0;
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
    /* Query API and if both names are valid, 
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
    
    dictl = dict.length
    
    for (var i = 0; i < dictl; i++) {
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
        .append($('<img/>', {'src': pokemonInfo.sprites.front_default}))
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

    display_field.append(
    $('<table/>', {'id':'stats'+i})
        .append($('<tr/>')
            .append($('<th/>').html("Name:"))
            .append($('<td/>', {'id': 'name'+i}).html(attributePP(pokemonInfo.name)))
        )
        .append($('<tr/>')
            .append($('<th/>').html("Height:"))
            .append($('<td/>', {'id': 'height'+i}).html(pokemonInfo.height))
        )
        .append($('<tr/>')
            .append($('<th/>').html("Weight:"))
            .append($('<td/>', {'id': 'weight'+i}).html(pokemonInfo.weight))
        )
        .append($('<tr/>')
            .append($('<th/>').html("Types: "))
            .append($('<td/>')
                .append($('<ul/>', {'id':'poketypes'+i})
                        .append(pokemonInfo.types.map(ptype => $("<li>", {'id': 'types'+i}).text(attributePP(ptype.type.name))))
                )
            )
        )
        .append($('<tr/>')
            .append($('<th/>', {'colspan' : 2}).html("Base Stats: "))
        )
        .append(pokemonInfo.stats.map(pstat => $("<tr/>", {'class': 'pokestat', 'id': pstat.stat.name.toString()+i})
            .append($('<th/>').html(attributePP(pstat.stat.name)))
            .append($('<td/>', {'id': pstat.stat.name}).html(pstat.base_stat))
            )
        )
    )
    if (i == 4) {activeEditForm()};
}


/* Pretty print an attribute by replacing dashes with spaces and capitalizing the first letter */
function attributePP(string) {
    var newstr = string.replace(/-/g, " ");
    return newstr.charAt(0).toUpperCase() + newstr.slice(1);
}


/* Create all elements required for the manage Pokemon edit and delete view.
 */
function createManagePokeView() {
    console.log("Creating manage pokemon view");

    $(".inner-content").html("");
    $(".inner-content").append(
        $('<div/>', {'class': 'history-container'}).append(
            $('<sub-heading/>', {'class': 'sub-head', text: "Manage History"}),
            $('<table/>', {'class': 'history-table'})
                .append($('<tr/>'))
                    .append($('<th/>').html("ID").css("background-color", "#baefec"))
                    .append($('<th/>').html("Name").css("background-color", "#baefec"))
                    .append($('<th/>').html("Status").css("background-color", "#baefec"))
                    .append($('<th/>').html("Delete").css("background-color", "#baefec"))
                    .append($('<table/>'), {'id': 'history-sub-table'})
        ),
        loadHistory(),
            
        $('<div/>', {'class': 'delete-container'}).append(
            $('<sub-heading/>', {'class': 'sub-head', text: "Delete Pokemon"}),
            $('<div/>', {'class': 'input-bar'}).append(
                $('<button/>', {'class': 'random-button-delete', text: "Random"}).on("click", {field: "single-input-delete"}, getRandomPokemon),
                $('<input/>', {'type': 'text', 'id': 'single-input-delete', 'placeholder': "Input Pokemon", 'maxlength': "11", 'size': "15"}),
                $('<button/>', {'class': 'submit-button-delete', 'id': 'single-submit-delete', text: "Submit"}).on("click", deleteSinglePokemon)
            ),
            $('<div/>', {'class': 'confirm-delete'}).append(
                $('<p/>', {'id': 'delete-text-curr'}).html("Current version:").hide(),
                $('<div/>', {'class': 'display-stats-delete'}),
                $('<button/>', {'class': 'confirm-delete-button', text: "Confirm Delete"}).on('load').on('click', deletePokemon).hide(),
                $('<p/>', {'id': 'delete-confirm-text'}).html("Deleted !").hide()
            )
        ),
            
        $('<div/>', {'class': 'edit-container'}).append(
            $('<sub-heading/>', {'class': 'sub-head', text: "Edit Pokemon"}).on("click", {field: "single-input-delete"}, getRandomPokemon),
            $('<div/>', {'class': 'input-bar'}).append(
                $('<button/>', {'class': 'random-button-edit', text: "Random"}).on("click", {field: "single-input-edit"}, getRandomPokemon),
                $('<input/>', {'type': 'text', 'id': 'single-input-edit', 'placeholder': "Input Pokemon", 'maxlength': "11", 'size': "15"}),
                $('<button/>', {'class': 'submit-button-edit', 'id': 'single-submit-edit', text: "Submit"}).on("click", editSinglePokemon)
            ), 
            $('<div/>', {'class': 'confirm-edit'}).append(
                $('<p/>', {'id': 'edit-text-curr'}).html("Current version:").hide(),
                $('<p/>', {'id': 'edit-text-editted'}).html("Editted version:").hide(),
                
                $('<div/>', {'class': 'row', 'id': 'editing-space'}).append(
                    $('<div/>', {'class': 'col-sm-5 display-pokemon-col'}).append(
                        $('<div/>', {'class': 'display-stats-edit'})
                    ),
                    $('<div/>', {'class': 'col-sm-2 between-cols-2'}),
                    $('<div/>', {'class': 'col-sm-5 edit-pokemon-col', 'padding': 'margin-bottom'})
                ),
                $('<p/>', {'id': 'edit-confirm-text'}).html("Changes are recorded !").hide()
            )
        )
    );
}


function activeEditForm(){
    console.log("Show edit pokemon form")
    
    $(".edit-pokemon-col").html("")
    $(".edit-pokemon-col").append(
        $('<div/>', {'class': 'create-poke-image'}).append(
            $('<img/>', {'id': 'create-poke-pic', 'height': 96, 'width': 96}),
            $('<button/>', {'id': 'preview-button', 'text': "Preview"}).on("click", previewImage)
        ),
        
        $('<form/>', {'name': 'edit-poke-page', 'id': 'edit-poke-form', "onsubmit":"return renewPokemon()"}).append(
            $('<input/>', {'type': 'text', 'name': 'pokeimage', 'placeholder': "image url", 'size': "15"}),

            $('<table/>', {'id': 'edit-table'}).append(
                $('<tr/>', {'id': 'input-name'})
                .append($('<th/>', {'id': 'input0'})
                    .append($('<input/>', {'type': 'text', 'name': 'name', 'id': 'single-input-0', 'value': $('#name4').text(), 'disabled': 'true', 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-height'})
                .append($('<th/>', {'id': 'input1'})
                    .append($('<input/>', {'type': 'text', 'name': 'height', 'id': 'single-input-1', 'value': $('#height4').text(), 'placeholder': "Input Height", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-weight'})
                .append($('<th/>', {'id': 'input2'})
                    .append($('<input/>', {'type': 'text', 'name': 'weight', 'id': 'single-input-2', 'value': $('#weight4').text(), 'placeholder': "Input Weight", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-types'})
                .append($('<th/>', {'id': 'input3'})
                    .append(
                        $('<p>').html("Please type in to confirm the types, at most 2 types for each pokemon."),
                        $('<input/>', {'type': 'text', 'name': 'type1', 'id': 'single-input-3-1', 'placeholder': 'Normal', 'size': "15"}),
                        $('<input/>', {'type': 'text', 'name': 'type2', 'id': 'single-input-3-2', 'value': $('#types4').text(), 'size': "15"})
                    )
                )
                ,
                $('<tr/>', {'id': 'input-base-stats'})
                .append($('<th/>').html("Base Stats:"))
                ,
                $('<tr/>', {'id': 'input-speed'})
                .append($('<th/>', {'id': 'input4'})
                    .append($('<input/>', {'type': 'text', 'id': 'single-input-4', 'value': $('#speed').text(), 'placeholder': "Input Speed", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-special-defense'})
                .append($('<th/>', {'id': 'input5'})
                    .append($('<input/>', {'type': 'text', 'id': 'single-input-5', 'value': $('#special-defense').text(), 'placeholder': "Input Special defense", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-special-attack'})
                .append($('<th/>', {'id': 'input6'})
                    .append($('<input/>', {'type': 'text', 'id': 'single-input-6', 'value': $('#special-attack').text(), 'placeholder': "Input Special attack", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-defense'})
                .append($('<th/>', {'id': 'input7'})
                    .append($('<input/>', {'type': 'text', 'id': 'single-input-7', 'value': $('#defense').text(), 'placeholder': "Input Defense", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-attack'})
                .append($('<th/>', {'id': 'input8'})
                    .append($('<input/>', {'type': 'text', 'id': 'single-input-8', 'value': $('#attack').text(), 'placeholder': "Input Attack", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-hp'})
                .append($('<th/>', {'id': 'input10'})
                    .append($('<input/>', {'type': 'text', 'id': 'single-input-10', 'value': $('#hp').text(), 'placeholder': "Input Hp", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'private-status'})
                .append($('<th/>', {'id': 'input12', 'colspan' : 2})
                        .append($('<input/>', {'type': 'radio', 'name': 'status', 'value': "public", 'checked': "checked"}), "public",
                                $('<br/>'),
                                $('<input/>', {'type': 'radio', 'name': 'status', 'value': "private", 'text': 'private'}), "private"))
            )
        ),
        $('<button/>', {'class': 'submit-button', 'id': 'confirm-edit-button', text: "Confirm Edit"}).on("click", renewPokemon) 
    )
}


/* delete pokemon */
function deleteSinglePokemon(){
    displayPokemonStats(input="#single-input-delete");    
    $('#delete-text-curr').show()
    $(".confirm-delete-button").show()
    $('#delete-confirm-text').hide()
}

function deletePokemon(){
    // delete from database.
    pokename = $("#single-input-delete").val().toLowerCase().replace(/ /g, "-");
    
    console.log("submit delete");
    deleteFromDB(pokename);
    $('#delete-text-curr').hide();
    $(".display-stats-delete").empty();
    $(".confirm-delete-button").hide();
    $('#delete-confirm-text').show();
}


function deleteFromDB(pokeName){
    var pokemon = {'pokename': pokeName};
    $.ajax({
    type: 'DELETE',
    url: "http://localhost:8080/api/pokemon/",
    data: pokemon,
    success: function(data){
         successfulPokemonSubmission(data);
    },
    error: function(xhr) {
        if(xhr.status == 409){
        console.log("pokemon found in db or pokeapi");
            alert("this name is already in use, please pick another");
        }
        else{
        console.log(xhr.status + " error has occured");
            alert("An error has occurred, please try again later");         
        }
    }
    })
}


function editSinglePokemon(){
    displayPokemonStats(input="#single-input-edit");        
    $('#edit-text-curr').show();
    $('#edit-text-editted').hide();
    $(".edit-pokemon-col").show();
    $(".confirm-edit-button").show();
    $('#edit-confirm-text').hide();
}


function renewPokemon(){
    // Add update to database.
    console.log("submit update");
    updateToDB();    
    $('#edit-text-editted').hide();
    $('#edit-text-curr').hide();
    $(".edit-pokemon-col").hide();
    // To load the updated pokemon from db.
    $(".display-stats-edit").empty();
    showUpdatePokemon();
    
    $(".confirm-edit-button").hide();
    $('#edit-confirm-text').show();
}


function updateToDB(){
    pokename = $('#name4').text();
    
    submitPokemonCreationForm();
    deleteFromDB(pokename);
}


function showUpdatePokemon(){
    displayPokemonStats(input="#single-input-edit");
    $('#edit-text-editted').show();
}


function loadHistory(){
    console.log("looking up user history")
    var userHistory;

    if (typeof(window.Storage) !== "undefined") {
        // Retrieve.
        var currUserName = window.localStorage.getItem("user");
        // load from database.
        
        pokemonInfoURL = new Promise((resolve, reject) => {
    
        /* checking pokemon pages for that pokemon checking by number of sets*/
        page = "https://pokeapi.co/api/v2/pokemon/?limit=50&offset=0"; //TODO
        $.ajax({type:'GET', url: page, success: function(result){
                console.log("starting recursive search")
                resolve(recursivePokeDBSearch(result, currUserName, 0)); //TODO
            },
            error: function(request, status, error){
                couldNotAccessAPIError(request, status, error);
            }
        })
    }) 
    } else {
        console.log("Error: No web storage support.");
    }       
    
    if (typeof(userHistory) !== "undefined") {
        rhl = userHistory.length;
        for (var i = 0; i < rhl; i++) {
            $('#history-sub-table').append($('<tr/>'))
                .append($('<td/>').html(userHistory[i][0]))
                .append($('<td/>').html(userHistory[i][1])) 
                .append($('<td/>').html(userHistory[i][2])) 
                .append($('<td/>').append($('<button/>', {'class': 'delete-poke', text: "Delete"}))).on("click", deleteFromDB(userHistory[i][0]))
        }
    } else if (typeof(userHistory) == "undefined") {
        $('.history-container').html("");
        $('.history-table').html("");
        $('.history-table').append($('<tr/>'))
                .append($('<td/>', {'placeholder': "empty", 'text':"something"})).html("something")
                .append($('<td/>', {'placeholder': "empty"}))
                .append($('<td/>', {'placeholder': "empty"})) 
                .append($('<td/>', {'placeholder': "empty"}))
        console.log("HOW IS THIS NOT WORKING");
    }

}


function recursivePokeDBSearch(){
    //TODO
}


//// //// log-in-out possible helper
function userLogOut(){
    console.log("logging out");
    if (typeof(window.Storage) !== "undefined") {
        // Remove.
        localStorage.removeItem("email");
        localStorage.removeItem("lastname");
        localStorage.removeItem("user");
    } else {
        console.log("Error: No web storage support.");
    }
    // Log out.
}


function userLogIn(){
    console.log("logging in"); ////
    if (typeof(window.Storage) !== "undefined") {
        // Store.
        window.localStorage.setItem("email", "1111@mail.com");
        window.localStorage.setItem("password", "user1111");
        window.localStorage.setItem("user", "catgod"); ////
        // var userEmail = window.localStorage.getItem("email");
        // var userPassword= window.localStorage.getItem("password");
        // localStorage.removeItem("name");
        // localStorage.removeItem("lastname");
    } else {
        console.log("Error: No web storage support.");
    } ////   
    // Log in.
}
//// ////




function submitPokemonCreationForm(){
    if(isValidPokemonCreationForm()){
        var pokemon = getPokeModel();
        $.ajax({
        type: 'POST',
        url: "http://localhost:8080/api/pokemon/",
        data: pokemon,
        success: function(data){
             successfulPokemonSubmission(data);
        },
        error: function(xhr) {
            if(xhr.status == 409){
            console.log("pokemon found in db or pokeapi");
                alert("this name is already in use, please pick another");
            }
            else{
            console.log(xhr.status + " error has occured");
                alert("An error has occurred, please try again later");         
            }
        }
        })
    }
    return false;
}

function getPokeModel(){
    var pokeImg = $("input[name=pokeimage]").val();
    if(pokeImg==""){
        pokeImg = "https://cdn77.sadanduseless.com/wp-content/uploads/2014/03/derp8.jpg";       
    }
    var pokemon = {'pokename': $("input[name=pokename]").val(),
                    'height': $("input[name=height]").val(),
                    'weight': $("input[name=weight]").val(),
                    'type1': $("input[name=type1]").val(),
                    'type2': $("input[name=type2]").val(),
                    'speed': $("input[name=speed]").val(),
                    'spcdefense': $("input[name=spcdefense]").val(),
                    'spcattack': $("input[name=spcattack]").val(),
                    'defense': $("input[name=defense]").val(),
                    'attack': $("input[name=attack]").val(),
                    'hp': $("input[name=hp]").val(),
                    'pokeimage': pokeImg,
                    'status': $('input[name=status]:checked').val()
                }
    return pokemon;
}


/*validates the pokemon creation page */
function isValidPokemonCreationForm(){
    console.log("validating pokemon creation form")
    var formFilled= true;
    $("#create-poke-form input[type=text]").each(function(){
        console.log($(this).val())
        if($(this).val()==""){
            console.log($(this).attr("id"))
            if($(this).attr("name")!=="type2" && $(this).attr("name")!=="pokeimage"){
                formFilled= false;
                return false;
            }
        }
    });
    if(!formFilled){
    alert("page is missing input, please fill in all the fields provided");
    }
    return formFilled;
}

function previewImage() {
    console.log("preview image");
    url = $("input[name=pokeimage]").val();
    console.log(url);
    if(url==""){
        url = "https://cdn77.sadanduseless.com/wp-content/uploads/2014/03/derp8.jpg";       
    }
    $('#create-poke-pic').attr('src', url);
    return;
}



//// ////

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
    console.log("searching pokeapi");
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


//// ////




$(document).ready(function(){
    //Clicking header reloads page
    $(".header").on("click", function(){location.reload()})

    //Navigation bar
    $(".main-nav-item").on("click", createViewOutline);
    $("#single-poke").on("click", createSinglePokeView);
    $("#compare-poke").on("click", createPokeCompareView);
    $("#edit-delete-poke").on("click", createManagePokeView);
    $("#log-out").on("click", userLogOut);
    
    userLogIn(); ////
});



