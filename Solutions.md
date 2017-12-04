Group Member
Student 1: Ruiyao Li (1002374548)
Student 2: Ellen Uppington (1000642138)
Student 3: Brianna Luong (1000303049)
Student 4: Hassan Ali (1001144718)


# Pokemon Web Page

The purpose of our web application is to view and compare Pokemon stats and basic information, also allow users to create, manage and publish new Pokemon.
In the previous assignment, the user can randomly or manually select one or two Pokemon for displaying stats and images. The compare Pokemon stats view also highlights the stats which one Pokemon has an advantage in over the other, so the user can visually tell which Pokemon may come out better in a battle. The header directs to the main menu view from all other views.

In the final project, the following sources and methods are used to build the RESTful API:
- server-side: to handle session management, messaging, and extending the Pokemon API
- database: MongoDB
- public-facing API: https://pokeapi.co/
- session management: log-in and web storage.
- deployment: ngrok.

The original Pokemon API only supports the GET request.
The new API implemention allows users to perform the four basic operations, GET, PUT, POST and DELETE within their session. This is achieved by having user sessions. Database, log-in interface, and web storage are important components of the user's session.

The three collections stored in the MongoDB are
- message collection:
	- message = {id, message text, read status, creation time}
- user information collection:
	- user = {username, password}
- pokemon collection:
	- pokemon = {
       name, height, weight, types, 
stats: {speed, special-defense, special-attack, defense, attack, hp}, sprites, username, status: {private, public}
}

in which username is a unique identifier, to be used to locate the correct password and entire Pokemon modification records of the user.

The entire project consists of two pages:

The Welcome Page contains a sign-up and a log-in to identify individual users upon one’s log-in, 

The second page is a multiple view interface: 
It maintains the same single Pokemon display stats view and the compare Pokemon stats view from the previous assignment, and lists more functionality in the left-hand side navigation bar. The new views are Create Pokemon and Manage Pokemon views.
The header display on the top of every view supports quick assess to the navigation page that shows a listing of all the views.
It also includes a window on its right for receiving real-time messages from the external administrator. Each of those messages will display for three minutes and can be controlled by the administrator to delete and resend at any time, and to be seen by all users currently logged in to the application. 
The Create Pokemon view allows users to design and POST Pokemon that were not originally in the API database.
The Manage Pokemon view allows users to modify and PUT or DELETE any Pokemon that they have created. One can set a Pokemon to be “private” to oneself for further modification, or “public” to be available for any other user to view.
The last section of the navigation page is Log Out. Selecting the button in either the navigation view or any other views in the sidebar will withdraw the user from the current session and link user to the Welcome Page.


## Features
### RESTful Pokemon API
- The new API implemention allows users to perform the four basic operations, GET, PUT, POST and DELETE within their session over all public Pokemons and private Pokemons created by the current user.

### Messaging
- POST
	- Making a POST request to /api/messages will create a new message that will subsequently be shown to any users currently logged in
  - Please include the header "Content-Type: application/json"
  - ex: $ curl -XPOST -d '{"data" : "Hello CSC309!"}' -H "Content-Type: application/json" localhost:8080/api/messages
- GET
	- Making a GET request to /api/messages will retrieve the entire list of messages
	- ex: $ curl -XGET localhost:8080/api/messages
- DELETE
	- Making a DELETE request to /api/messages/<id> will delete the message with <id>
	- ex: $ curl -XDELETE localhost:8080/api/messages/5a24ba4a2718d70f14982b78
	- You can get a message's id by making a GET request, or alternatively a new message's id will be shown after a POST
