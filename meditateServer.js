var express = require('express');
var parser = require('body-parser');
var path = require("path");
var mongo = require('mongodb').MongoClient;
var OID = require('mongodb').ObjectID;

var app = express();
var server = require('http').createServer(app);

var crypto = require('crypto');

require('dotenv').config();

// Encrypt a string
function encrypt(str) {
  var cipher = crypto.createCipher('aes-256-ctr', 'N58Q2ae9');
  var encrypedStr = cipher.update(str, 'utf8', 'hex');
  encrypedStr += cipher.final('hex');
  return encrypedStr;
}

var port = process.env.PORT || 8080;
var db = 'meditation';
var url = (process.env.MONGODB_URI || 'mongodb://localhost:27017/') + db;
console.log("url: ", url, "\n\n\n")

var userLogin = '';

app.set('port', port);

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(express.static(path.join(__dirname, "client", "dist")));

app.post('/api/account', function(req, res) {
	// The user entry to be made
	var newUser = {
		firstname: req.body.accountFirstName,
		lastname: req.body.accountLastName,
		username: req.body.accountUsername,
		password: encrypt(req.body.accountPassword),
		email: req.body.accountEmail,
		zipcode: req.body.accountZip,
		defaultMeditationTime: 600,
	}

	// Insert the account
	mongo.connect(url, function(err, db) {
		if (err) throw err;

		db.collection('users').findOne({
			username: req.body.accountUsername,
		}, function(err, item) {
			if (err) throw err;

			if (item !== null) {
				res.setHeader('Content-Type', 'application/json');
				res.end(
					JSON.stringify({
						accountCreated: false,
						accountMsg: "Username is already taken",
					})
				);

				db.close();
			} else {
				db.collection('users').insert(newUser, function(err, docs) {
					if (err) throw err;

					res.setHeader('Content-Type', 'application/json');
					res.end(
						JSON.stringify({
							accountCreated: true,
							accountMsg: '',
						})
					);

					db.close();
				});
			}
		});
	});
})

// Check that the login credentials are correct, 
// that the username exists and that the password is correct
app.post('/api/login', function(req, res) {
	mongo.connect(url, function(err, db) {		
		if (err) throw err;
		
		// Look for username
		db.collection('users').findOne({
			username: req.body.loginUsername,
		}, function(err, item) {
			if (err) throw err;
			var loginAccepted = false;
			var loginMsg = "";
			
			// If the username is not found or the login password doesn't match the user's password
			if (!item || encrypt(req.body.loginPassword) !== item.password) {
				loginMsg = "Invalid Credentials";
			} else {
				loginAccepted = true;
				loginMsg = "The entry is correct!";
				
				userLogin = req.body.loginUsername;
			}

			res.setHeader('Content-Type', 'application/json');
			res.end(
				JSON.stringify({
					loginAccepted: loginAccepted,
					loginMsg: loginMsg,
					loginSession: userLogin,
					userMeditationTime: item.defaultMeditationTime,
				})
			);
			
			db.close();
		});
	});
});

// Go to the home page, or redirect to the login if a user isn't logged in
app.post('/api/checkUserSession', function(req, res) {
	let canMeditate = false;
	if (userLogin && req.body.userSession === userLogin)
		canMeditate = true;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({ canMeditate, userSession: userLogin }));
});

// Log out of the site
app.post('/api/killUserSession', function(req, res) {
	userLogin = '';

	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({
		canMeditate: false,
	}));
});

app.post('/api/setMeditationTime', function(req, res) {
	mongo.connect(url, function(err, db) {
		db.collection('users').findOne({
			username: req.body.username,
		}, function(err, item) {
			if (err) throw err;

			if (item) {
				db.collection('users').update(
					{ username: req.body.username },
					{ $set: {
						defaultMeditationTime: req.body.userMeditationTime,
					}},
					function(err) {
						if (err) throw err;

						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({
							defaultMeditationTime: req.body.userMeditationTime,
						}));

						db.close();
					}
				);
			}
		});
	});
});

app.post('/api/meditationEntry', function(req, res) {
	var meditationEntry = {
		username: req.body.user,
		meditateDateTime: req.body.meditateDateTime,
		meditateDuration: req.body.meditateDuration,
		journalEntry: req.body.journalEntry
	}

	// Insert the meditation entry to the database
	mongo.connect(url, function(err, db) {
		if (err) throw err;
		
		db.collection('meditationrecord').insert(meditationEntry, function(err, docs) {
			if (err) throw err;
						
			res.setHeader('Content-Type', 'application/json');
			res.end(
				JSON.stringify({
					meditationEntryMsg: 'Meditation Entry Made!',
				})
			);
	
			db.close();
		});
	});
});

app.get('/api/accountInfoLoad', function(req, res) {
	mongo.connect(url, function(err, db) {
		if (err) throw err;
		db.collection('users').findOne({
			username: req.query.username
		}, function(err, user) {
			if (err) throw err;
			
			res.setHeader('Content-Type', 'application/json');
			res.end(
				JSON.stringify({
					firstname: user.firstname,
					lastname: user.lastname,
					email: user.email,
					zipcode: user.zipcode
				})
			);
			
			db.close();
		});
	});
});

app.post('/api/accountModify', function(req, res) {
	// Modify the account if the user clicked Modify and not Cancel
	mongo.connect(url, function(err, db) {
		if (err) throw err;
	
		db.collection('users').update(
			{ username: req.body.username },
			{ $set:
				{
					email: req.body.accountEmail,
					firstname: req.body.accountFirstName,
					lastname: req.body.accountLastName,
					zipcode: req.body.accountZip
				}
			}, function(err) {
				if (err) throw err;

				res.setHeader('Content-Type', 'application/json');
				res.end(
					JSON.stringify({
						accountModified: true,
						accountMsg: 'Account Modified!',
					})
				);

				db.close();
			}
		);
	});
});

app.post('/api/accountLoginModify', function(req, res) {
	mongo.connect(url, function(err, db) {
		if (err) throw err;
		
		db.collection('users').findOne({
			username: req.body.username
		}, function(err, item) {
			if (err) throw err;
			
			if (item.password !== encrypt(req.body.accountOldPassword)) {
				res.setHeader('Content-Type', 'application/json');
				res.end(
					JSON.stringify({
						pwordChangeMsg: 'Old Password Incorrect!',
					})
				);

				db.close();
			}
			else {
				db.collection('users').update(
					{ username: req.body.username },
					{ $set:
						{
							password: encrypt(req.body.accountPassword)
						}
					}, function(err) {
						if (err) throw err;

						res.setHeader('Content-Type', 'application/json');
						res.end(
							JSON.stringify({
								pwordChangeMsg: 'Password Changed!',
							})
						);

						db.close();
					}
				);
			}
		});
	});
});

app.get('/api/progress', function(req, res) {
	if (userLogin) {
		mongo.connect(url, function(err, db) {
			if (err) throw err;
			
			db.collection('meditationrecord').find({
				$and: [
					{
						username: {
							$eq: req.query.user
						}
					},
					{
						meditateDateTime: {
							$lte: Number(req.query.endTimestamp),
						}
					},
					{
						meditateDateTime: {
							$gte: Number(req.query.startTimestamp),
						}
					}
				]
			}).toArray(function(err, meditationRecords) {
				if (err) throw err;
				
				res.setHeader('Content-Type', 'application/json');
				res.end(
					JSON.stringify({
						meditationRecords,
						recordsFound: true,
					})
				);

				db.close();
			});
		});
	} else {
		res.setHeader('Content-Type', 'application/json');
		res.end(
			JSON.stringify({
				recordsFound: false,
			})
		);
	}
});

// Modify the journal entry in the collection, using the id to find it
app.post('/api/modifyJournalEntry', function(req, res) {	
	var jeid = new OID(req.body.journalID);

	// Update the record
	mongo.connect(url, function(err, db) {
		if (err) throw err;
		
		db.collection('meditationrecord').update(
			{ _id: jeid },
			{ $set:
				{ journalEntry: req.body.journalEntry }
			},
			function(err, docs) {
				if (err) throw err;

				res.setHeader('Content-Type', 'application/json');
				res.end(
					JSON.stringify({
						journalModified: true,
					})
				);

				db.close();
			}
		);
	});
});

// Delete a journal entry
app.post('/api/deleteJournalEntry', function(req, res) {
	var jdid = new OID(req.body.journalID);
	
	// Delete the record
	mongo.connect(url, function(err, db) {
		if (err) throw err;
		
		db.collection('meditationrecord').remove({
			_id: jdid
		}, function(err) {
			if (err) throw err;

			res.setHeader('Content-Type', 'application/json');
			res.end(
				JSON.stringify({
					journalDeleted: true,
				})
			);
			
			db.close();
		});
	});
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Listen for an incoming connection
server.listen(port, function() {
	console.log("Server is listening...\n");
});
