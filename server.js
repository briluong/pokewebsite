// Setup
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const morgan = require('morgan');

const app = express();

// Middleware to be able to read POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// Generate logs
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

const port = 8080;

// Routing
app.use('/api/user', require('./routes/user/user.js'));
app.use('/api/pokemon', require('./routes/pokemon/pokemon.js'));
app.use('/api/messages', require('./routes/message/messaging.js'));


// Render home page
app.get('/', (req, res) => {
    res.render('./public/index.html');
});


app.listen(port);
console.log("Server listening on port", port);
