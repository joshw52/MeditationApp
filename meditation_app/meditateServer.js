var express = require('express');
var path = require('path');
var parser = require('body-parser');

var app = express();

app.set('port', 8080);

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
    res.sendFile(path.join(__dirname+'/login.html'));
})

app.listen(8080);