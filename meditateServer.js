const express = require('express');
const parser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sessions = require('express-session');
const mongoSessionStore = require('connect-mongo');

const mongo = require('mongodb').MongoClient;
const OID = require('mongodb').ObjectID;

const app = express();
const server = require('http').createServer(app);

const crypto = require('crypto');

require('dotenv').config();

// Encrypt a string
function encrypt(str) {
  const cipher = crypto.createCipher('aes-256-ctr', 'N58Q2ae9');
  return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

const port = process.env.PORT || 8080;

// Database configuration
const username = process.env.DB_USER || '';
const password = process.env.DB_PASS || '';
const cluster = process.env.DB_CLUSTER || '';
const database = process.env.DB_NAME || 'meditation';

const mongoDBUrl = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true`;

app.set('port', port);
app.enable('trust proxy'); 

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(cors());

// Session management
app.use(sessions({
    cookie: {
		secure: true,
		maxAge: 4 * 60 * 24, // Four hours
	},
    resave: true,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
	store: mongoSessionStore.create({
		mongoUrl: mongoDBUrl,
		dbName: database,
	}),
}));

app.use(express.static(path.join(__dirname, "client", "dist")));

app.post('/api/account', function(req, res) {
	// The user entry to be made
	const newUser = {
		firstname: req.body.accountFirstName,
		lastname: req.body.accountLastName,
		username: req.body.accountUsername,
		password: encrypt(req.body.accountPassword),
		email: req.body.accountEmail,
		defaultMeditationTime: 600,
	}

	// Server-side validation of password length
	if (newUser.password.length < 8) {
		res.setHeader('Content-Type', 'application/json');
		res.end(
			JSON.stringify({
				accountCreated: false,
				accountMsg: "Password must be at least 8 characters",
			})
		);
	} else {
		// Attempt to insert the account
		mongo.connect(mongoDBUrl, function(err, client) {
			const db = client.db(database);	
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
	
					client.close();
				} else {
					db.collection('users').insertOne(newUser, function(err, docs) {
						if (err) throw err;
	
						res.setHeader('Content-Type', 'application/json');
						res.end(
							JSON.stringify({
								accountCreated: true,
								accountMsg: '',
							})
						);
	
						client.close();
					});
				}
			});
		});
	}
})

// Check that the login credentials are correct, 
// that the username exists and that the password is correct
app.post('/api/login', function(req, res) {
	mongo.connect(mongoDBUrl, function(err, client) {
		const db = client.db(database);		
		if (err) throw err;
		
		// Look for username
		db.collection('users').findOne({
			username: req.body.loginUsername,
		}, function(err, item) {
			if (err) throw err;
			
			// If the username is not found or the login password doesn't match the user's password
			if (!item || encrypt(req.body.loginPassword) !== item.password) {
				res.setHeader('Content-Type', 'application/json');
				res.end(
					JSON.stringify({
						loginAccepted: false,
						loginMsg: "Invalid Credentials",
						loginSession: null,
						userMeditationTime: null,
					})
				);
			} else {
				req.session.loggedIn = true;
				req.session.username = req.body.loginUsername;
				
				res.setHeader('Content-Type', 'application/json');
				res.end(
					JSON.stringify({
						loginAccepted: true,
						loginMsg: "The entry is correct!",
						userMeditationTime: item.defaultMeditationTime,
					})
				);
			}
			
			client.close();
		});
	});
});

// Log out and kill session
app.post('/api/userLogout',(req, res) => {
    req.session.destroy();
	res.end();
});

app.post('/api/setMeditationTime', function(req, res) {
	mongo.connect(mongoDBUrl, function(err, client) {
		const db = client.db(database);	
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

						client.close();
					}
				);
			}
		});
	});
});

app.post('/api/meditationEntry', function(req, res) {
	const meditationEntry = {
		username: req.body.user,
		meditateDateTime: req.body.meditateDateTime,
		meditateDuration: req.body.meditateDuration,
		journalEntry: req.body.journalEntry
	}

	// Insert the meditation entry to the database
	mongo.connect(mongoDBUrl, function(err, client) {
		const db = client.db(database);	
		if (err) throw err;
		
		db.collection('meditationrecord').insertOne(meditationEntry, function(err, docs) {
			if (err) throw err;
						
			res.setHeader('Content-Type', 'application/json');
			res.end(
				JSON.stringify({
					meditationEntryMsg: 'Meditation Entry Made!',
				})
			);
	
			client.close();
		});
	});
});

app.get('/api/accountInfoLoad', function(req, res) {
	mongo.connect(mongoDBUrl, function(err, client) {
		const db = client.db(database);	
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
				})
			);
			
			client.close();
		});
	});
});

app.post('/api/accountModify', function(req, res) {
	// Modify the account if the user clicked Modify and not Cancel
	mongo.connect(mongoDBUrl, function(err, client) {
		const db = client.db(database);	
		if (err) throw err;
	
		db.collection('users').update(
			{ username: req.body.username },
			{ $set:
				{
					email: req.body.accountEmail,
					firstname: req.body.accountFirstName,
					lastname: req.body.accountLastName,
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

				client.close();
			}
		);
	});
});

app.post('/api/accountLoginModify', function(req, res) {
	mongo.connect(mongoDBUrl, function(err, client) {
		const db = client.db(database);	
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

				client.close();
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

						client.close();
					}
				);
			}
		});
	});
});

app.get('/api/progress', function(req, res) {
	// if (req.session.username) {
	mongo.connect(mongoDBUrl, function(err, client) {
		const db = client.db(database);	
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

			client.close();
		});
	});
	// } else {
	// 	res.setHeader('Content-Type', 'application/json');
	// 	res.end(
	// 		JSON.stringify({
	// 			recordsFound: false,
	// 		})
	// 	);
	// }
});

// Modify the journal entry in the collection, using the id to find it
app.post('/api/modifyJournalEntry', function(req, res) {	
	const jeid = new OID(req.body.journalID);

	// Update the record
	mongo.connect(mongoDBUrl, function(err, client) {
		const db = client.db(database);	
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

				client.close();
			}
		);
	});
});

// Delete a journal entry
app.post('/api/deleteJournalEntry', function(req, res) {
	const jdid = new OID(req.body.journalID);

	// Delete the record
	mongo.connect(mongoDBUrl, function(err, client) {
		const db = client.db(database);	
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
			
			client.close();
		});
	});
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Listen for an incoming connection
server.listen(port, function() {
	console.log("Server is running...\n");
});
