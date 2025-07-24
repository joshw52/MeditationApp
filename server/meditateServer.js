import express from 'express';
import parser from 'body-parser';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import http from 'http';
import dotenv from 'dotenv'
import sessions from 'express-session';
import mongoSessionStore from 'connect-mongo';
import { MongoClient, ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';

const mongo = MongoClient;
const OID = ObjectId;

const app = express();

const server = http.createServer(app);

dotenv.config();

function encrypt(str) {
  return crypto.createHmac('sha256', process.env.HMAC_SECRET).update(str).digest('hex');
}

const port = process.env.PORT || 8080;

const username = process.env.DB_USER || '';
const password = process.env.DB_PASS || '';
const cluster = process.env.DB_CLUSTER || '';
const database = process.env.DB_NAME || 'meditation';

const mongoDBUrl = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority&tls=true`;

const client = new MongoClient(mongoDBUrl);
await client.connect();
const db = client.db(database);

app.set('port', port);
app.enable('trust proxy'); 

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.use(cors());

app.use(sessions({
    cookie: {
		httpOnly: true,
		maxAge: 4 * 60 * 24 * 1000,
		secure: process.env.NODE_ENV === 'production',
	},
    resave: true,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
	store: mongoSessionStore.create({
		dbName: database,
		mongoUrl: mongoDBUrl,
	}),
}));

app.get('/api/isAuthenticated', function(req, res) {
	const isAuthenticated = req.sessionID && req.session.username;
	res.json({ isAuthenticated: !!isAuthenticated });
});

app.post('/api/account', async function(req, res) {
	// The user entry to be made
	const newUser = {
		username: req.body.accountUsername,
		password: encrypt(req.body.accountPassword),
		email: req.body.accountEmail,
		defaultMeditationTime: 600,
	}

	// Server-side validation of non-empty fields
	if (!newUser.username || !newUser.password || !newUser.email) {
		res.json({
			accountCreated: false,
			accountMsg: "All fields must be filled out!",
		});
	// Server-side validation of password length
	} else if (newUser.password.length < 8) {
		res.json({
			accountCreated: false,
			accountMsg: "Password must be at least 8 characters",
		});
	} else {
		// Attempt to insert the account
		try {
			const item = await db.collection('users').findOne({
				username: req.body.accountUsername,
			});

			if (item !== null) {
				res.json({
					accountCreated: false,
					accountMsg: "Username is already taken",
				});
			} else {
				const item = db.collection('users').insertOne(newUser);

				if (item) {
					res.json({
						accountCreated: true,
						accountMsg: '',
					});
				}
			}
		} catch (err) {
			console.error(err);
			res.status(500).end();
		}
	}
})

// Check that the login credentials are correct, 
// that the username exists and that the password is correct
app.post('/api/login', async (req, res) => {
	try {
		// Check that username and password aren't empty
		if (!req.body.loginUsername || !req.body.loginPassword) {
			res.json({ loginAccepted: false });
		}
		
		// Look for username
		const item = await db.collection('users').findOne({
			username: req.body.loginUsername,
		});

		// If the username is not found or the login password doesn't match the user's password
		if (!item || encrypt(req.body.loginPassword) !== item.password) {
			res.json({ loginAccepted: false });
		} else {
			req.session.username = req.body.loginUsername;
			res.json({ loginAccepted: true });
		}
	} catch (err) {
		console.error(err);
		res.status(500).end();
	}
});

// Log out and kill session
app.post('/api/userLogout',(req, res) => {
	if (req.session) req.session.destroy();
	res.end();
});

app.get('/api/meditationTime', function(req, res) {
	if (req.session.username) {
		mongo.connect(mongoDBUrl, function(err, client) {
			const db = client.db(database);	
			db.collection('users').findOne({
				username: req.session.username,
			}, function(err, item) {
				if (err) throw err;

				if (item) {
					res.json({
						defaultMeditationTime: item.defaultMeditationTime,
					});
				}
			});
		});
	}
});

app.post('/api/meditationTime', function(req, res) {
	if (req.session.username) {
		mongo.connect(mongoDBUrl, function(err, client) {
			const db = client.db(database);	
			db.collection('users').findOne({
				username: req.session.username,
			}, function(err, item) {
				if (err) throw err;

				if (item) {
					db.collection('users').findOneAndUpdate(
						{ _id: item._id },
						{ $set: {
							defaultMeditationTime: req.body.defaultMeditationTime,
						}},
						function(err, updatedItem) {
							if (err) throw err;

							res.json({
								defaultMeditationTime: updatedItem.value.defaultMeditationTime,
							});
						}
					);
				}
			});
		});
	}
});

app.post('/api/meditationEntry', function(req, res) {
	if (req.session.username) {
		const meditationEntry = {
			username: req.session.username,
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

				res.json({
					meditationEntryMsg: 'Meditation Entry Made!',
				});
			});
		});
	}
});

app.get('/api/accountInfoLoad', function(req, res) {
	if (req.session.username) {
		mongo.connect(mongoDBUrl, function(err, client) {
			const db = client.db(database);	
			if (err) throw err;
			db.collection('users').findOne({
				username: req.session.username
			}, function(err, user) {
				if (err) throw err;

				res.json({ email: user.email });
			});
		});
	}
});

app.post('/api/accountModify', function(req, res) {
	if (req.session.username) {
		// Modify the account if the user clicked Modify and not Cancel
		mongo.connect(mongoDBUrl, function(err, client) {
			const db = client.db(database);	
			if (err) throw err;
		
			db.collection('users').update(
				{ username: req.session.username },
				{ $set: { email: req.body.accountEmail }},
				function(err) {
					if (err) throw err;

					res.json({
						accountModified: true,
						accountMsg: 'Account Modified!',
					});
				}
			);
		});
	}
});

app.post('/api/accountLoginModify', function(req, res) {
	if (req.session.username) {
		mongo.connect(mongoDBUrl, function(err, client) {
			const db = client.db(database);	
			if (err) throw err;
			
			db.collection('users').findOne({
				username: req.session.username
			}, function(err, item) {
				if (err) throw err;
				
				if (item.password !== encrypt(req.body.accountOldPassword)) {
					res.json({
						pwordChangeMsg: 'Old Password Incorrect!',
					});
				}
				else {
					db.collection('users').update(
						{ username: req.session.username },
						{ $set:
							{
								password: encrypt(req.body.accountPassword)
							}
						}, function(err) {
							if (err) throw err;

							res.json({
								pwordChangeMsg: 'Password Changed!',
							});
						}
					);
				}
			});
		});
	}
});

app.get('/api/progress', function(req, res) {
	if (req.session.username) {
		mongo.connect(mongoDBUrl, function(err, client) {
			const db = client.db(database);	
			if (err) throw err;
			
			db.collection('meditationrecord').find({
				$and: [
					{
						username: {
							$eq: req.session.username
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

				res.json({
					meditationRecords,
					recordsFound: true,
				});
			});
		});
	}
});

// Modify the journal entry in the collection, using the id to find it
app.post('/api/modifyJournalEntry', function(req, res) {
	if (req.session.username) {
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

					res.json({
						journalModified: true,
					});
				}
			);
		});
	}
});

// Delete a journal entry
app.post('/api/deleteJournalEntry', function(req, res) {
	if (req.session.username) {
		const jdid = new OID(req.body.journalID);

		// Delete the record
		mongo.connect(mongoDBUrl, function(err, client) {
			const db = client.db(database);	
			if (err) throw err;
			
			db.collection('meditationrecord').remove({
				_id: jdid
			}, function(err) {
				if (err) throw err;

				res.json({
					journalDeleted: true,
				});
			});
		});
	}
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.resolve(__dirname, "./client/dist")));

// Listen for an incoming connection
server.listen(port, function() {
	console.log("Server is running...\n");
});
