var express = require('express');
var path = require('path');
var parser = require('body-parser');
var mongo = require('mongodb').MongoClient;
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

app.set('view engine', 'ejs');

app.get('/home', function(req, res) {
	if (req.session.user)
		res.render('index');
	else
		res.render('login', { lerr: false });
});

function getDates(user, month, year, callback) {
	var monthYear = String(year) + "-";
	if (month < 10) monthYear += "0";
	monthYear += String(Number(month)+1);

	mongo.connect(url, function(err, db) {
		db.collection('meditationrecord').find({
			username: {
				$eq: user
			},
			date: new RegExp(monthYear)
		}).toArray(function(err, docs) {
			var dates = printCalendar(month, year, docs);
			callback(dates);
			db.close();
		});
	});
}

function printCalendar(month, year, dates) {
	var cal = "<table id='progressCalendar'><thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>";

	// Get the number of days in the month
	var numDays = new Date(year, month, 0);
	var firstDay = new Date(year, month-1);
	var start = 0 - firstDay.getDay();
	var end = numDays.getDate() + (7 - numDays.getDay());

	var count = 0;
	for (var d = start+1; d < end; d++) {
		if (count === 0) cal += "<tr>";
		cal += "<td>";

		if (d > 0 && d <= numDays.getDate())
			cal += "<div id='monthDay'>" + String(d) + "</div><br><div id='dayRecord'>";

		for (logs in dates) {
			var loggedDay = String(dates[logs].date).split("-")[2];
			if (Number(loggedDay) === d) {
				cal += "<div id='logResult'>" + String(dates[logs].time) + " &nbsp<a href=''><i class='fa fa-book' aria-hidden='true'></i></a></div><br>";
			}
		}

		cal += "</div></td>";

		count++;
		if (count > 6) {
			count = 0;
			cal += "</tr>";
		}
	}

	return cal;
}

app.get('/progress', function(req, res) {
	if (req.session.user)
		res.render('progress', { progCal: "" });
	else
		res.render('login', { lerr: false });
});

app.post('/progress', function(req, res) {	
	getDates(req.session.user, req.body.progressMonth, req.body.progressYear, function(dates) {
		res.render('progress', { progCal: dates });
	});	
});

app.get('/logout', function(req, res) {
	req.session.reset();
	res.render('login', { lerr: false });
});

/* Timer code */

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

/* Set up the account */

io.on('connection', function(sock) {
	console.log('Client connected...');
	
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
	
	sock.on('loginCheck', function(login) {
		console.log(login);
		
		mongo.connect(url, function(err, db) {
		
		
			// Look for username
			db.collection('users').findOne({
				username: login.loginUname,
			}, function(err, item) {
				console.log(item);
				
				// If the username is not found or the login password doesn't match the user's password
				if (!item) {
					console.log("The username is not valid\n");
					sock.emit('loginCheckResponse', { loginAccepted: false });
				} else {
					if (login.loginPword !== item.password) {
						console.log("The password is not correct\n");
						sock.emit('loginCheckResponse', { loginAccepted: false });
					} else {
						console.log("The entry is correct!\n");
						sock.emit('loginCheckResponse', { loginAccepted: true });
					}
				}
				db.close();
			});
		
		
		});
	});
});

app.get('/account', function(req, res) {
	res.render('account');
});

app.post('/account', function(req, res) {
	console.log("User added\n");

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
})

/* Log in */

app.get('/', function(req, res) {
	res.render('login', { lerr: false });
});

app.post('/', function(req, res) {
	req.session.user = req.body.loginUname;
	res.redirect('/home');
});

// Listen for an incoming connection
server.listen(8080, function() {
	console.log("Server is listening...\n");
});