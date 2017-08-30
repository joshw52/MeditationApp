var express = require('express');
var path = require('path');
var parser = require('body-parser');
var mongo = require('mongodb').MongoClient;
var session = require('client-sessions');

var app = express();
var port = 8080;
var db = 'meditation';
var url = 'mongodb://localhost:27017/' + db;

app.set('port', port);

app.use(express.static(path.join(__dirname + '/public')));

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

// https://stormpath.com/blog/everything-you-ever-wanted-to-know-about-node-dot-js-sessions
app.use(session({
	cookieName: 'session',
	secret: 'thisisthesecretkey',
	duration: (1000 * 60 * 60),
	activeDuration: (1000 * 60 * 30)
}));

app.set('view engine', 'ejs');

app.get('/home', function(req, res) {
	if (req.session.user)
		res.render('index');
	else
		res.render('login', { lerr: false });
});

app.get('/progress', function(req, res) {
	if (req.session.user)
		res.render('progress');
	else
		res.render('login', { lerr: false });
});

app.get('/logout', function(req, res) {
	req.session.reset();
	res.render('login', { lerr: false });
});

app.get('/account', function(req, res) {
	res.render('account', { unerr: false });
});

app.get('/timer', function(req, res) {
	if (req.session.user)
		res.render('timer');
	else
		res.render('login', { lerr: false });
});

app.post('/timer', function(req, res) {
	var dt = new Date();
	var m = dt.getMonth() + 1;
	if (m < 10) m = "0" + String(m);
	var d = dt.getDate();
	if (d < 10) d = "0" + String(d);
	
	var entryDate = dt.getFullYear() + "-" + m + "-" + d;
		
	var mlog = {
		username: req.session.user,
		date: entryDate,
		time: req.body.meditationTime,
		entry: req.body.journalEntry
	}
	
	mongo.connect(url, function(err, db) {
		db.collection('meditationrecord').insert(mlog, function(err, docs) {
			if (err) console.log(err);
			else console.log("Entry made\n");
			
			db.close();
		});
	});
	
	res.redirect('/home');
});

app.post('/account', function(req, res) {
	
	// Make sure username isn't taken
	mongo.connect(url, function(err, db) {
		
		db.collection('users').findOne({
			username: req.body.username
		}, function(err, item) {
			if (item === null) {
				console.log("Item not found\n");

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
				
				res.render('login', { lerr: false });
			} else {
				console.log("Item found\n");
				res.render('account', { unerr: true });
			}		
			db.close();
		});
	});
})

app.get('/', function(req, res) {
	res.render('login', { lerr: false });
});

app.post('/', function(req, res) {	
	mongo.connect(url, function(err, db) {
		// Look for username
		db.collection('users').findOne({
			username: req.body.loginUname,
		}, function(err, item) {
			if (err) {
				console.log("Error");
				return res.send({lerr: false});
			}

			// If the username is not found or the login password doesn't match the user's password
			if (!item) {
				console.log("The username is not valid\n");
				res.render('login', { lerr: true });
			} else {
				if (req.body.loginPword !== item.password) {
					console.log("The password is not correct\n");
					res.render('login', { lerr: true });
				} else {
					console.log("The entry is correct!\n");
					req.session.user = req.body.loginUname;
					res.redirect('/home');
				}
			}
			db.close();
		});
	});
});

app.listen(8080);