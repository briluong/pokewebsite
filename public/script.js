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
            $('<li/>', {'class': 'nav-item', 'id': 'edit-delete-poke', text: "Manage Pokemons"}),
            $('<li/>', {'class': 'nav-item', 'id': 'create-poke', text: "Create a Pokemon"}),
            $('<li/>', {'class': 'nav-item', 'id': 'logout', text: "Logout"})
        )
    )
    $("#single-poke").on("click", createSinglePokeView);
    $("#compare-poke").on("click", createPokeCompareView);
    $("#edit-delete-poke").on("click", createManagePokeView);
    $("#create-poke").on("click", createCreatePokeView);
    $("#logout").on("click", logOut);
}

/* Return to welcome page */
function logOut() {
    // unset username
    localStorage.removeItem("pokeUsername");
    window.location = "/index.html";
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

/* Get a random Pokemon name from the API
 */
function getRandomPokemon(event) {
    //
    $.ajax({
        type: 'GET',
        url: "/api/pokemon/random",
        success: function(pokemonData){
            pokemonName = pokemonData; // get name from pokemon data
            console.log("found random pokemon " + pokemonName);
            $("#"+event.data.field).val(pokemonName); // display pokemon name
        },
        error: function() {
            alert('Error occured');
        }
    })
}

var dl_load = false;
var rl_load = false;
var load_complete = dl_load && dr_load;
/*displays pokemon stats of pokemon*/
function displayPokemonStats(input, localPoke) {

    var pokemon = $(input).val().toLowerCase().replace(/ /g, "-");
    var query = "/api/pokemon/pokename/" + pokemon + "?user=" + localStorage.pokeUsername + "&search=" + localPoke;
    $.ajax({type:'GET', url: query, success: function(result){
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
        renderPokemonStats(result, display_field, i.toString())
        handle_load(load_complete);
        return;
    },
    error: function(request, status, error){
        console.log(error);

        if(error == "Conflict"){
            if(input == "#single-input-delete" || input == "#single-input-edit"){
                alert("this pokemon was not made using this account, only pokemon made by this account can be managed")
            }
            else{
                alert("this pokemon was made private by the user, could not retrieve data");
   
            }        }
        else if(error == "Bad Request"){
            alert("this pokemon does not exist, please try another");
        }
        else{
            alert("could not connect to database, please try again later");
        }
    }
    })
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
    displayPokemonStats(input="#single-input", 0);
}

/*display stats of two pokemon*/
function doublePokemon(input_field){
    dl_load = false;
    dr_load = false;
    $("#comp-disp-0").html("");
    $("#comp-disp-1").html("");
    if ($("#input-0").val()!=$("#input-1").val()){
        displayPokemonStats(input="#input-0", 0);  
        displayPokemonStats(input="#input-1", 0);
    } else {
        alert('Please insert two different pokemons.');
    }
    return;
}


/* Retrieve two Pokemons' data from the API and compare their stats
 */
function comparePokemon(p1, p2) {

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
                    .append(pokemonInfo.types.map(ptype => $("<li>").text(attributePP(ptype.type.name))))
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
        $('<form/>', {'name': 'create-poke-name-submission-page', 'id': 'create-poke-form', "onsubmit":"return submitPokemonCreationForm()"}).append(
            $('<input/>', {'type': 'text', 'name': 'pokeimage', 'placeholder': "image url", 'size': "15"}),
            $('<table/>', {'id':'stats'}).append(
                $('<tr/>', {'id': 'name'}).append(
                    $('<th/>').html("Name:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'name': 'pokename', 'placeholder': "Pokemon Name", 'maxlength': "11", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'height'}).append(
                    $('<th/>').html("Height:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'name': 'height', 'placeholder': "height in cm", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'weight'}).append(
                    $('<th/>').html("Weight:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'name': 'weight', 'placeholder': "weight in kg", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'types'}).append(
                    $('<th/>').html("Types:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'name': 'type1', 'placeholder': "normal", 'size': "15"}),
                        $('<input/>', {'type': 'text', 'name': 'type2', 'placeholder': "type2, optional", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'base-stats'}).append(
                    $('<th/>', {'colspan' : 2}).html("Base Stats: ")
                ),
                $('<tr/>', {'id': 'speed'}).append(
                    $('<th/>').html("Speed:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'name': 'speed', 'placeholder': "1", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'special-defense'}).append(
                    $('<th/>').html("Special-defense:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'name': 'spcdefense', 'placeholder': "1",'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'special-attack'}).append(
                    $('<th/>').html("Special attack:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'name': 'spcattack', 'placeholder': "1", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'defense'}).append(
                    $('<th/>').html("Defense:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'name': 'defense', 'placeholder': "1", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'attack'}).append(
                    $('<th/>').html("Attack:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text', 'name': 'attack', 'placeholder': "1", 'size': "15"})
                    )
                ),
                $('<tr/>', {'id': 'hp'}).append(
                    $('<th/>').html("Hp:"),
                    $('<td/>').append(
                        $('<input/>', {'type': 'text','name': 'hp', 'placeholder': "1", 'size': "15"})
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
}
/**/
function submitPokemonCreationForm(){
    if(isValidPokemonCreationForm()){
        var pokemon = getPokeModel();
        $.ajax({
        type: 'POST',
        url: "/api/pokemon/",
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
                    'status': $('input[name=status]:checked').val(),
                    'user': localStorage.pokeUsername
                }
    console.log(pokemon);
    console.log($("input[name=pokename]"));
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




function successfulPokemonSubmission(pokemon){
    $(".inner-content").html("");
    $(".inner-content").append(
        $('<div/>', {'class': 'display-stats'}).append(
            $('<p/>').html("Pokemon successfully added to the database!"),
            $('<button/>', {'id': 'create-another', text: "Create Another!"})
        )
    );
    renderPokemonStats(pokemon, $(".inner-content"), "1");
    $("#create-another").on("click", createCreatePokeView);
    return;
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
                    .append($('<th/>').html("Name").css("background-color", "#baefec"))
                    .append($('<th/>').html("Status").css("background-color", "#baefec"))
                    .append($('<table/>'), {'id': 'history-sub-table'})
        ),
        loadHistory(),
            
        $('<div/>', {'class': 'delete-container'}).append(
            $('<sub-heading/>', {'class': 'sub-head', text: "Delete Pokemon"}),
            $('<div/>', {'class': 'input-bar'}).append(
                //$('<button/>', {'class': 'random-button-delete', text: "Random"}).on("click", {field: "single-input-delete"}, getRandomPokemon),
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
            $('<sub-heading/>', {'class': 'sub-head', text: "Edit Pokemon"}),
            $('<div/>', {'class': 'input-bar'}).append(
            //    $('<button/>', {'class': 'random-button-edit', text: "Random"}).on("click", {field: "single-input-edit"}, getRandomPokemon),
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
                    .append($('<input/>', {'type': 'text', 'name': 'pokename', 'id': 'single-input-0', 'value': $('#name4').text(), 'disabled': 'true', 'maxlength': "11", 'size': "15"})))
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
                    .append($('<input/>', {'type': 'text', 'name': 'speed', 'id': 'single-input-4', 'value': $('#speed').text(), 'placeholder': "Input Speed", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-special-defense'})
                .append($('<th/>', {'id': 'input5'})
                    .append($('<input/>', {'type': 'text', 'name': 'spcdefense', 'id': 'single-input-5', 'value': $('#special-defense').text(), 'placeholder': "Input Special defense", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-special-attack'})
                .append($('<th/>', {'id': 'input6'})
                    .append($('<input/>', {'type': 'text','name': 'spcattack', 'id': 'single-input-6', 'value': $('#special-attack').text(), 'placeholder': "Input Special attack", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-defense'})
                .append($('<th/>', {'id': 'input7'})
                    .append($('<input/>', {'type': 'text', 'name': 'defense', 'id': 'single-input-7', 'value': $('#defense').text(), 'placeholder': "Input Defense", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-attack'})
                .append($('<th/>', {'id': 'input8'})
                    .append($('<input/>', {'type': 'text', 'name': 'attack', 'id': 'single-input-8', 'value': $('#attack').text(), 'placeholder': "Input Attack", 'maxlength': "11", 'size': "15"})))
                ,
                $('<tr/>', {'id': 'input-hp'})
                .append($('<th/>', {'id': 'input10'})
                    .append($('<input/>', {'type': 'text','name': 'hp', 'id': 'single-input-10', 'value': $('#hp').text(), 'placeholder': "Input Hp", 'maxlength': "11", 'size': "15"})))
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
    displayPokemonStats(input="#single-input-delete", 1);    
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

/*TO BE FIXED error stuff*/
function deleteFromDB(pokeName){
    var query = "/api/pokemon/" + pokeName + "?username=" + localStorage.pokeUsername;
    $.ajax({
    type: 'DELETE',
    url: query,
    success: function(data){
         successfulPokemonDeletion(data);
    },
    error: function(xhr) {
        if(xhr.status == 409){
        console.log("cannot delete this pokemon");
            alert("unauthorized to delete this pokemon");
        }
        else{
        console.log(xhr.status + " error has occured");
            alert("could not delete pokemon, error occured");         
        }
    }
    })
}


function editSinglePokemon(){
    displayPokemonStats(input="#single-input-edit", 1);        
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
    //showUpdatePokemon();
    
    $(".confirm-edit-button").hide();
    $('#edit-confirm-text').show();
}

/*FINISH THIS error stuff*/
function submitPokemonUpdateForm(pokename){
    console.log("SUBMITTING FORM")
    if(isValidPokemonCreationForm()){
        var pokemon = getPokeModel();
        var query = "/api/pokemon/" + pokemon.pokename.toLowerCase().replace(/ /g, "-") + "?user=" + localStorage.pokeUsername;
        $.ajax({
        type: 'PUT',
        url: query,
        data: pokemon,
        success: function(data){
            console.log(data);
            successfulPokemonUpdate(data);
        },
        error: function(xhr) {
            if(xhr.status == 409){
            console.log("could not update pokemon in db");
                alert("unauthorized to edit this pokemon");
            }
            else{
            console.log(xhr.status + " error has occured");
                alert("could not update pokemon, error has occured");         
            }
        }
        })
    }
    return false;
}

function successfulPokemonUpdate(pokemon){
    $(".inner-content").html("");
    $(".inner-content").append(
        $('<div/>', {'class': 'display-stats'}).append(
            $('<p/>').html("Pokemon successfully updated in database!"),
            $('<button/>', {'id': 'manage-pokemon', text: "Manage pokemon"})
        )
    );
    renderPokemonStats(pokemon, $(".inner-content"), "1");
    $("#manage-pokemon").on("click", createManagePokeView);
    return;
}

function successfulPokemonDeletion(pokemon){
    $(".inner-content").html("");
    $(".inner-content").append(
        $('<div/>', {'class': 'display-stats'}).append(
            $('<p/>').html("Pokemon successfully deleted from the database!"),
            $('<button/>', {'id': 'manage-pokemon', text: "Manage pokemon"})
        )
    );
    //renderPokemonStats(pokemon, $(".inner-content"), "1");
    $("#manage-pokemon").on("click", createManagePokeView);
    return;
}


function updateToDB(){
    pokename = $('#name4').text();
    submitPokemonUpdateForm(pokename);
}


function showUpdatePokemon(){
    displayPokemonStats(input="#single-input-edit", 1);
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
        page = "/api/pokemon/" + localStorage.pokeUsername;
        $.ajax({type:'GET', url: page, success: function(result){
                console.log(result)
                if (result && result.data.length >= 1) {
                    userHistory = result.data;
                    rhl = userHistory.length;
                    for (var i = 0; i < rhl; i++) {
                        console.log(i)
                        console.log(userHistory[i])
                        $('.history-table').append($('<tr/>'))
                            .append($('<td/>').html(userHistory[i].name))
                            .append($('<td/>').html(userHistory[i].status)) 
                    }
                } else {
                    $('.history-table').append($('<tr/>'))
                            .append($('<td/>', {'placeholder': "empty", 'text':"You have not created any Pokemon"}))
                            .append($('<td/>', {'placeholder': "empty"}))
                }
            },
            error: function(request, status, error){
                couldNotAccessAPIError(request, status, error);
            }
        })
    }) 
    } else {
        console.log("Error: No web storage support.");
    }       

}













$(document).ready(function(){
    //Clicking header reloads page
    $(".header").on("click", function(){location.reload()})

    //Navigation bar
    $(".main-nav-item").on("click", createViewOutline);
    $("#single-poke").on("click", createSinglePokeView);
    $("#compare-poke").on("click", createPokeCompareView);
    $("#edit-delete-poke").on("click", createManagePokeView);
    $("#create-poke").on("click", createCreatePokeView);
    $("#logout").on("click", logOut);

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
