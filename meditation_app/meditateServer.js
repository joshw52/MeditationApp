var express = require('express');
var path = require('path');
var parser = require('body-parser');
var mongo = require('mongodb').MongoClient;
var OID = require('mongodb').ObjectID;
var session = require('client-sessions');

var app = express();
/* https://www.npmjs.com/package/socket.io */
var server = require('http').createServer(app);
var io = require('socket.io')(server);

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

// EJS is the view engine
app.set('view engine', 'ejs');

// Go to the home page, or redirect to the login if a user isn't logged in
app.get('/home', function(req, res) {
	if (req.session.user)
		res.render('index');
	else
		res.render('login', { lerr: false, accountCreated: false });
});

// Get the records for a user for a month/year
function getDates(user, month, year, callback) {
	// Put the month and year in the proper format
	var monthYear = String(year) + "-";
	if (month < 10) monthYear += "0";
	monthYear += String(Number(month)+1);

	// Find the records for that month/year
	mongo.connect(url, function(err, db) {
		db.collection('meditationrecord').find({
			username: {
				$eq: user
			},
			date: new RegExp(monthYear)
		}).toArray(function(err, docs) {
			// Get the calendar
			var dates = printCalendar(month, year, docs);
			callback(dates);
			db.close();
		});
	});
}

// Construct the calendar to be displayed for a particular month/year,
// showing the meditation time, a link to modify the journal entry,
// and a button to delete the entry
function printCalendar(month, year, dates) {
	var cal = "<table id='progressCalendar'><thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr><tbody>";

	// Get the number of days in the month
	var numDays = new Date(year, month, 0);
	var firstDay = new Date(year, month-1);
	var start = 0 - firstDay.getDay();
	var end = numDays.getDate() + (7 - numDays.getDay());

	// For each day of the month, if there's an entry, put it in
	var count = 0;
	for (var d = start+1; d < end; d++) {
		if (count === 0) cal += "<tr>";
		cal += "<td>";

		// Put the day of the month in 
		if (d > 0 && d <= numDays.getDate())
			cal += "<div id='monthDay'>" + String(d) + "</div><br><div id='dayRecord'>";

		// Put the meditation entries in
		for (logs in dates) {
			var loggedDay = String(dates[logs].date).split("-")[2];
			if (Number(loggedDay) === d) {
				cal += "<div id='logResult'>" + String(dates[logs].time);
				cal += "&nbsp<form method='POST' action='journal' class='journalMods'>";
				cal += "<input type='hidden' value='" + dates[logs]._id + "' name='jid'>";
				cal += "<input type='hidden' value='" + dates[logs].entry + "' name='jentry'>";
				cal += "<button type='submit' id='editJournal'><i class='fa fa-book' aria-hidden='true'></i></button></form>";
				cal += "&nbsp<form method='POST' action='deleteJournalEntry' class='journalMods' onsubmit='return confirm(\"Confirm that you wish to delete this meditation entry\")'>";
				cal += "<input type='hidden' value='" + dates[logs]._id + "' name='jdid'>";
				cal += "<button type='submit' id='deleteJournal'><i class='fa fa-times-circle' aria-hidden='true'></i></button></form></div>";
			}
		}

		cal += "</div></td>";

		count++;
		if (count > 6) {
			count = 0;
			cal += "</tr>";
		}
	}
	
	cal += "</tbody></table>";

	// Return the constructed calendar
	return cal;
}

// Get the progress page, or redirecting to the login page
// if a user isn't logged in
app.get('/progress', function(req, res) {
	if (req.session.user)
		res.render('progress', { progCal: "" });
	else
		res.render('login', { lerr: false, accountCreated: false });
});

// Display the calendar of progress for a month/year
app.post('/progress', function(req, res) {	
	getDates(req.session.user, req.body.progressMonth, req.body.progressYear, function(dates) {
		res.render('progress', { progCal: dates });
	});	
});

// If a journal is to be modified, put in the id and entry
app.post('/journal', function(req, res) {
	res.render('journal', {
		jid: req.body.jid,
		jentry: req.body.jentry
	});
});

// Modify the journal entry in the collection, using the id to find it
app.post('/journalModification', function(req, res) {	
	var jeid = new OID(req.body.mjid);
	
	// Update the record
	mongo.connect(url, function(err, db) {
		db.collection('meditationrecord').update(
			{ _id: jeid },
			{ $set:
				{ entry: req.body.mjentry }
			},
			function() {
				db.close();
			}
		);
	});
	
	res.render('progress', { progCal: "Meditation Entry Modified!" });
});

// Delete a journal entry
app.post('/deleteJournalEntry', function(req, res) {
	var jdid = new OID(req.body.jdid);
	
	// Delete the record
	mongo.connect(url, function(err, db) {
		db.collection('meditationrecord').remove({
			_id: jdid
		}, function() {
			db.close();
		});
	});
	
	res.render('progress', { progCal: "Meditation Entry Deleted!" });
});

/* Logout */

// Log out of the site
app.get('/logout', function(req, res) {
	req.session.reset();
	res.render('login', { lerr: false, accountCreated: false });
});

/* Timer code */

// Get the timer page, redirect to login if no user is logged in
app.get('/timer', function(req, res) {
	if (req.session.user)
		res.render('timer');
	else
		res.render('login', { lerr: false, accountCreated: false });
});

// Show the meditation timer
app.post('/timer', function(req, res) {
	// Put the date in the proper format
	var dt = new Date();
	var m = dt.getMonth() + 1;
	if (m < 10) m = "0" + String(m);
	var d = dt.getDate();
	if (d < 10) d = "0" + String(d);
	
	var entryDate = dt.getFullYear() + "-" + m + "-" + d;
	
	// The meditation log for a user
	var mlog = {
		username: req.session.user,
		date: entryDate,
		time: req.body.meditationTime,
		entry: req.body.journalEntry
	}
	
	// Insert the meditation log to the database
	mongo.connect(url, function(err, db) {
		db.collection('meditationrecord').insert(mlog, function(err, docs) {
			if (err) console.log(err);
			else console.log("Entry made\n");
			
			db.close();
		});
	});
	
	// Move to the progress page
	res.render('progress', { progCal: "Meditation Entry Made!" });
});

/* Set up the account */

// Sockets for checking the username for the account creation
// as well as the username/password for the login
io.on('connection', function(sock) {
	console.log('Client connected...');
	
	// Check to see if the username is available, sending a
	// signal back to the client if it is or isn't
	sock.on('unameCheck', function(uname) {		
		mongo.connect(url, function(err, db) {
			db.collection('users').findOne({
				username: uname.username
			}, function(err, item) {
				if (item === null) {
					console.log("Username available\n");
					sock.emit('unameCheckResponse', { unameFree: true });
				} else {
					console.log("Username not available\n");
					sock.emit('unameCheckResponse', { unameFree: false });
				}		
				db.close();
			});
		});
	});
	
	// Check that the login credentials are correct, 
	// that the username exists and that the password is correct
	sock.on('loginCheck', function(login) {
		mongo.connect(url, function(err, db) {		
			// Look for username
			db.collection('users').findOne({
				username: login.loginUname,
			}, function(err, item) {
				
				// If the username is not found or the login password doesn't match the user's password
				if (!item) {
					console.log("The username is not valid\n");
					sock.emit('loginCheckResponse', { loginAccepted: false });
				} 
				else {
					if (login.loginPword !== item.password) {
						console.log("The password is not correct\n");
						sock.emit('loginCheckResponse', { loginAccepted: false });
					} 
					// Indicate if the credentials are correct
					else {
						console.log("The entry is correct!\n");
						sock.emit('loginCheckResponse', { loginAccepted: true });
					}
				}
				db.close();
			});
		});
	});
});

// Render the account creation page
app.get('/account', function(req, res) {
	res.render('account');
});

// Add an account to the users collection
app.post('/account', function(req, res) {
	console.log("User added\n");

	// The user entry to be made
	var user = {
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		username: req.body.username,
		password: req.body.password,
		zipcode: req.body.zipcode
	}

	// Insert the account
	mongo.connect(url, function(err, db) {
		db.collection('users').insert(user, function(err, docs) {
			db.close();
		});
	});
	
	// Move to the login page
	res.render('login', { lerr: false, accountCreated: true });
})

/* Log in */

// Move to the login page
app.get('/', function(req, res) {
	res.render('login', { lerr: false, accountCreated: false });
});

// The logged in user will move to the home page
app.post('/home', function(req, res) {
	req.session.user = req.body.loginUname;
	res.redirect('/home');
});

// Listen for an incoming connection
server.listen(8080, function() {
	console.log("Server is listening...\n");
});