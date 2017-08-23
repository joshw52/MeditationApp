var express = require('express');
var path = require('path');
var parser = require('body-parser');
var mongo = require('mongodb').MongoClient;

var app = express();
var port = 8080;
var db = 'meditation';
var url = 'mongodb://localhost:27017/' + db;

app.set('port', port);

app.use(express.static(path.join(__dirname + '/public')));

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname+'/login.html'));
});

app.get('/home', function(req, res) {
	res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/timer', function(req, res) {
	res.sendFile(path.join(__dirname+'/timer.html'));
});

app.get('/progress', function(req, res) {
	res.sendFile(path.join(__dirname+'/progress.html'));
});

app.get('/logout', function(req, res) {
	res.sendFile(path.join(__dirname+'/logout.html'));
});

app.get('/account', function(req, res) {
	res.sendFile(path.join(__dirname+'/account.html'));
});

app.post('/meditationEntry', function(req, res) {
    
});

app.post('/accountCreation', function(req, res) {
	var isErr = false;
	
	// Validate first and last name
	if (String(req.body.firstname).length > 0 && String(req.body.lastname).length > 0) {
	
	} else {
		isErr = true;
	}
	
	// Make sure passwords match
	if (String(req.body.password) !== String(req.body.confirmPass)) {
		isErr = true;
	}
	
	// Make sure username isn't taken
	mongo.connect(url, function(err, db) {
		db.collection('users').find({
			username: req.body.username
		}).toArray(function(err, docs) {
			if (docs) isErr = true;
		});
	});
	
	// Make sure zip code is 5 digits
	if (Number(req.body.zipcode) && String(req.body.zipcode).length === 5) {
	
	} else {
		isErr = true;
	}
	

	if (isErr === false) {
		// Put the fields into an object
		var user = {
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			username: req.body.username,
			password: req.body.password,
			zipcode: req.body.zipcode
		}
	
		mongo.connect(url, function(err, db) {
			db.collection('users').insert(user, function(err, docs) {
				db.close();
			});
		});
	
	    res.sendFile(path.join(__dirname+'/login.html'));
	} else {
		console.log("There was an error in your query");
	}
})

app.listen(8080);