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
            $('<li/>', {'class': 'nav-item', 'id': 'edit-delete-poke', text: "Manage Pokemon"}),
        )
    )
    $("#single-poke").on("click", createSinglePokeView);
    $("#compare-poke").on("click", createPokeCompareView);
    $("#edit-delete-poke").on("click", createManagePokeView);
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
    console.log("OFFSET: ", offset) ////
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
        console.log("DOUBLE POKEMON COMPLETE TRUE"); ////
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
    console.log("START TO DISPLAY DOUBLE POKEMON") ////
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
    console.log("COMPARING") ////
    
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
            $('<table/>', {'id': 'history-table'})
                .append($('<tr/>'))
                    .append($('<th/>').html("ID").css("background-color", "#baefec"))
                    .append($('<th/>').html("Name").css("background-color", "#baefec"))
                    .append($('<th/>').html("Status").css("background-color", "#baefec"))
                    .append($('<th/>').html("Edit").css("background-color", "#baefec"))
                    .append($('<th/>').html("Delete").css("background-color", "#baefec"))
                .append($('<tr/>'))
                    .append($('<td/>').html(attributePP("place holder")))
                    .append($('<td/>').html(attributePP("place holder2")))
                    .append($('<td/>').html(attributePP("place holder3")))
                    .append($('<td/>').html(attributePP("place holder4")))
                    .append($('<td/>').html(attributePP("place holder5")))
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
                    $('<div/>', {'class': 'col-sm-5 edit-pokemon-col', 'padding': 'bottom'}).hide().append(
                        $('<table/>', {'id': 'edit-table'}).append(
                            
                            $('<tr/>', {'id': 'private-status'})
                            .append($('<th/>', {'colspan' : 2})
                                    .append($('<input/>', {'type': 'radio', 'name': 'status', 'value': "public", 'checked': "checked"}), "public",
                                            $('<br/>'),
                                            $('<input/>', {'type': 'radio', 'name': 'status', 'value': "private", 'text': 'private'}), "private"))
                            ,
                            $('<tr/>', {'id': 'input-height'})
                            .append($('<th/>', {'id': 'input0'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-0', 'placeholder': "Input Height", 'maxlength': "11", 'size': "15"})))
                            ,
                            $('<tr/>', {'id': 'input-weight'})
                            .append($('<th/>', {'id': 'input1'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-1', 'placeholder': "Input Weight", 'maxlength': "11", 'size': "15"})))
                            ,
                            $('<tr/>', {'id': 'input-types'})
                            .append($('<th/>', {'id': 'input2'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-2', 'placeholder': "Input Types", 'maxlength': "11", 'size': "15"})))
                            ,
                            $('<tr/>', {'id': 'input-base-stats'})
                            .append($('<th/>', {'id': 'input2'}).html("Base Stats:"))
                            ,
                            $('<tr/>', {'id': 'input-speed'})
                            .append($('<th/>', {'id': 'input3'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-3', 'placeholder': "Input Speed", 'maxlength': "11", 'size': "15"})))
                            ,
                            $('<tr/>', {'id': 'input-special-defense'})
                            .append($('<th/>', {'id': 'input4'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-4', 'placeholder': "Input Special defense", 'maxlength': "11", 'size': "15"})))
                            ,
                            $('<tr/>', {'id': 'input-special-attack'})
                            .append($('<th/>', {'id': 'input5'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-5', 'placeholder': "Input Special attack", 'maxlength': "11", 'size': "15"})))
                            ,
                            $('<tr/>', {'id': 'input-defense'})
                            .append($('<th/>', {'id': 'input6'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-6', 'placeholder': "Input Defense", 'maxlength': "11", 'size': "15"})))
                            ,
                            $('<tr/>', {'id': 'input-attack'})
                            .append($('<th/>', {'id': 'input7'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-7', 'placeholder': "Input Attack", 'maxlength': "11", 'size': "15"})))
                            ,
                            $('<tr/>', {'id': 'input-value'})
                            .append($('<th/>', {'id': 'input8'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-8', 'placeholder': "Input Value", 'maxlength': "11", 'size': "15"})))
                            ,
                            $('<tr/>', {'id': 'input-hp'})
                            .append($('<th/>', {'id': 'input9'})
                                .append($('<input/>', {'type': 'text', 'id': 'single-input-9', 'placeholder': "Input Hp", 'maxlength': "11", 'size': "15"})))
                        )
                    )
                ),
                $('<button/>', {'class': 'confirm-edit-button', text: "Confirm Edit"}).on('load').on('click', renewPokemon).hide(),
                $('<p/>', {'id': 'edit-confirm-text'}).html("Changes are recorded !").hide()
            )
        )
    );
}


function deleteSinglePokemon(){
    displayPokemonStats(input="#single-input-delete");    
    $('#delete-text-curr').show()
    $(".confirm-delete-button").show()
    $('#delete-confirm-text').hide()
}


function editSinglePokemon(){
    displayPokemonStats(input="#single-input-edit");        
    $('#edit-text-curr').show();
    $(".edit-pokemon-col").show();
    $(".confirm-edit-button").show();
    $('#edit-confirm-text').hide();
}


function deletePokemon(){
    // TODO: delete from database. [change status to del.]
    $('#delete-text-curr').hide();
    $(".display-stats-delete").hide();
    $(".confirm-delete-button").hide();
    $('#delete-confirm-text').show();
}


function renewPokemon(){
    // TODO: add update to database.
    $('#edit-text-curr').hide();
    $(".edit-pokemon-col").hide();
    // To load the updated pokemon from db.
    $(".display-stats-edit").empty();
    showUpdatePokemon();
    
    $(".confirm-edit-button").hide();
    $('#edit-confirm-text').show();
}


function showUpdatePokemon(){
    displayPokemonStats(input="#single-input-edit");
    $('#edit-text-editted').show();
}


function loadHistory(){
    console.log("looking up history")
    // TODO: load history from database.
}


$(document).ready(function(){
    //Clicking header reloads page
    $(".header").on("click", function(){location.reload()})

    //Navigation bar
    $(".main-nav-item").on("click", createViewOutline);
    $("#single-poke").on("click", createSinglePokeView);
    $("#compare-poke").on("click", createPokeCompareView);
    $("#edit-delete-poke").on("click", createManagePokeView);
});

