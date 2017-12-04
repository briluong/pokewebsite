function createSignUpView() {
	$(".nav-box").html("Sign Up");
	$(".nav-box").append(
		$('<div/>'),
		$('<div/>', {'class': 'signup'}).append(
			$('<br/>'),
			$('<input/>', {'type': 'text', 'id': 'un-input', 'placeholder': "Username", 'maxlength': "15"}),
			$('</br>'),
			$('<input/>', {'type': 'password', 'id': 'pass-input', 'placeholder': "Password", 'maxlength': "15"}),
			$('<br/>'),
			$('<br/>'),
			$('<button/>', {'class': 'back-button', text: "Back"}),
			"  ",
			$('<button/>', {'class': 'submit-button', 'id': 'signup-submit', text: "Submit"})
		)
	);
	$(".back-button").on("click", function(){location.reload()});
	$("#signup-submit").on("click", signUp);
}

function createLoginView() {
	$(".nav-box").html("Login");
	$(".nav-box").append(
		$('<div/>'),
		$('<div/>', {'class': 'login'}).append(
			$('<br/>'),
			$('<input/>', {'type': 'text', 'id': 'un-input', 'placeholder': "Username", 'maxlength': "15"}),
			$('</br>'),
			$('<input/>', {'type': 'password', 'id': 'pass-input', 'placeholder': "Password", 'maxlength': "15"}),
			$('<br/>'),
			$('<br/>'),
			$('<button/>', {'class': 'back-button', text: "Back"}),
			"  ",
			$('<button/>', {'class': 'submit-button', 'id': 'login-submit', text: "Submit"})
		)
	);
	$(".back-button").on("click", function(){location.reload()});
	$("#login-submit").on("click", logIn);
}

function signUp() {
	// make POST request to server to create new user
	var username = $("#un-input").val();
	var password = $("#pass-input").val();
	
	var userdata = {'username': username,
				'password': password};

	$.ajax({
		type: 'POST',
		url: '/api/user/signup',
		data: userdata,
		success: function(res) {
			window.location = "/home.html"
			// set user's username in browser local storage
			localStorage.setItem("pokeUsername", username);
		},
		error: function(err) {
			if (err.status == 409) {
				alert(err.responseText);
			} else {
				alert("Error occurred, please try again");
			}
		}
	})
}

function logIn() {
	// log in user and redirect to main page
	var username = $("#un-input").val();
	var password = $("#pass-input").val();

	var userdata = {'username': username,
				'password': password};

	$.ajax({
		type: 'POST',
		url: '/api/user/login',
		data: userdata,
		success: function(res) {
			window.location = "/home.html"
			// set user's username in browser local storage
			localStorage.setItem("pokeUsername", username);
		},
		error: function(err) {
			if (err.status == 409) {
				alert(err.responseText);
			} else {
				alert("Error occurred, please try again");
			}
		}
	})
}

$(document).ready(function(){
	//Clicking header reloads page
    $(".header").on("click", function(){location.reload()})

	$("#sign-up").on("click", createSignUpView);
    $("#login").on("click", createLoginView);
})