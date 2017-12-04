# Pokemon Web Page

## Features
### RESTful Pokemon API
-

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
