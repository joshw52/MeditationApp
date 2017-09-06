var timerOn = null;	// Indicates if timer is running or not
var timeMeditated = -1;	// Hold the time meditated
var incrementFraction = -1;	// The fraction that the image will be revealed in per second while the timer runs
var currentBrightness = 0;	// The current brightness of the namaste image
var gong = new Audio('https://soundbible.com/grab.php?id=1815&type=mp3');	// The gong sound to be played at the beginning and end

// Log in
function loginMeditation(event) {
	// Create a socket
	var socket = io();

	// Send the username/password to the server
	socket.emit('loginCheck', {
		loginUname: document.getElementById('loginUname').value,
		loginPword: document.getElementById('loginPword').value
	});
	
	// check if the server approved of the username/password combo
	socket.on('loginCheckResponse', function(response) {
		console.log("Login accepted: " + response.loginAccepted);

		// If the login was accepted, login to the site
		if (response.loginAccepted === true) {		
			var loginQuery = {
				loginUname: document.getElementById('loginUname').value,
				loginPword: document.getElementById('loginPword').value
			};

			// Send a POST request to the server
			var req = new XMLHttpRequest();
			req.open("POST", '/', true);
			req.setRequestHeader('Content-Type', 'application/json');
			req.send(JSON.stringify(loginQuery));
			
			// Now the form can be submitted
			document.getElementById('loginForm').submit();
		}
		// If the login was not accepted, display an error
		else {
			document.getElementById('loginErr').innerHTML = "<br><span style='color: #FF5555;'>Username/password credentials are incorrect!</span>";
		}
	});
	
	// The form will not submit unless the login was accepted
	event.preventDefault();
}

// Send the meditation time and journal entry to the server
function sendMeditateTimeJournal() {
	var insertQuery = {
		meditationTime: document.getElementById('meditationTime').value,
		journalEntry: document.getElementById('journalEntry').value
	};
				
	// Send a POST request with the time and journal entry
	var req = new XMLHttpRequest();
	req.open("POST", '/timer', true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(insertQuery));
}

// Will send the chosen month/year to the server to retrieve the
// progress for that time period
function displayProgress() {
	var displayQuery = {
		progressMonth: document.getElementById('progressMonth').value,
		progressYear: document.getElementById('progressYear').value
	};
	
	// POST request for month/year progress
	var req = new XMLHttpRequest();
	req.open("POST", '/progress', true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(displayQuery));
}

// Create an account
function createAccount(event) {	
	var isErr = false;	// Indicates if there was an error in the form

	// Validate first name (can't be empty)
	if (document.getElementById('firstname').value === "") {
		document.getElementById('fnameErr').innerHTML = "<span style='color: #FF5555;'>First name is empty!</span>";
		isErr = true;
	} else {
		document.getElementById('fnameErr').innerHTML = "";
	}

	// Validate last name (can't be empty)	
	if (document.getElementById('lastname').value === "") {
		document.getElementById('lnameErr').innerHTML = "<span style='color: #FF5555;'>Last name is empty!</span>";
		isErr = true;
	} else {
		document.getElementById('lnameErr').innerHTML = "";
	}

	// Validate username (can't be empty)
	if (document.getElementById('username').value === "") {
		document.getElementById('unameErr').innerHTML = "<span style='color: #FF5555;'>Username can NOT be empty!</span>";
		isErr = true;
	} else {
		document.getElementById('unameErr').innerHTML = "";
	}
	
	// Validate the passwords (make sure at least 8 characters)
	if (String(document.getElementById('password').value).length < 8) {
		document.getElementById('passErr').innerHTML = "<span style='color: #FF5555;'>Password must be at least 8 characters long!</span>";
		isErr = true;
	} else {
		document.getElementById('passErr').innerHTML = "";
	}
	if (String(document.getElementById('confirmPass').value).length < 8) {
		document.getElementById('cpassErr').innerHTML = "<span style='color: #FF5555;'>Password must be at least 8 characters long!</span>";
		isErr = true;
	} else {
		document.getElementById('cpassErr').innerHTML = "";
	}
	
	// Make sure the passwords match
	if (document.getElementById('password').value !== document.getElementById('confirmPass').value) {
		document.getElementById('passErr').innerHTML = "<span style='color: #FF5555;'>Passwords must match!</span>";
		document.getElementById('cpassErr').innerHTML = "<span style='color: #FF5555;'>Passwords must match!</span>";
		isErr = true;
	} else if (String(document.getElementById('password').value).length > 7 && String(document.getElementById('confirmPass').value).length > 7) {
		document.getElementById('passErr').innerHTML = "";
		document.getElementById('cpassErr').innerHTML = "";
	}
	
	// Make sure zip code is 5 digits
	if (String(document.getElementById('zipcode').value).length !== 5) {
		document.getElementById('zipErr').innerHTML = "<span style='color: #FF5555;'>Zip code should be 5 digits!</span>";
		isErr = true;
	} else {
		document.getElementById('zipErr').innerHTML = "";
	}

	// The form wil not submit if there were errors
	if (isErr === true) {
		return false;
	}
	// Check if the username was chosen already first, and if not,
	// then submit the account form
	else {		
		// Create a socket
		var socket = io();

		// Send the username to the server to see if it's been chosen
		socket.emit('unameCheck', {
			username: document.getElementById('username').value
		});
		
		// The server will indicate if the username has already been picked
		socket.on('unameCheckResponse', function(response) {			
			// If the username has not already been picked
			if (response.unameFree === true) {
				var accountQuery = {
					firstname: document.getElementById('firstname').value,
					lastname: document.getElementById('lastname').value,
					username: document.getElementById('username').value,
					password: document.getElementById('password').value,
					cpassword: document.getElementById('confirmPass').value,
					zipcode: document.getElementById('zipcode').value
				}

				// Ajax/vanilla JS insert request
				var req = new XMLHttpRequest();
				req.open("POST", '/account', true);
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(JSON.stringify(accountQuery));
				
				// Now the account form can be submitted
				document.getElementById('accountCreation').submit();
			}
			// If the username is being used, display error
			else {
				document.getElementById('unameErr').innerHTML = "<span style='color: #FF5555;'>Username is taken!</span>";
			}
		});
	};
	
	// Make sure the form doesn't submit
	event.preventDefault();
}

// Increments or decrements the hour
function modifyHour(sign) {
	// Don't modify if the timer is running
	if (timerOn === null) {
		// Get the current hour
		var hour = document.getElementById("adjustHr").innerHTML;
		
		// Increment
		if (sign === 1) {
			document.getElementById("adjustHr").innerHTML = String(Number(hour) + 1);
		}
		// Decrement if greater than 0
		else if (sign === -1 && document.getElementById("adjustHr").innerHTML > 0)  {
			document.getElementById("adjustHr").innerHTML = String(Number(hour) - 1);
		}
	}
}

// Increments or decrements the minute
function modifyMinute(sign) {
	// Don't modify if the timer is running
	if (timerOn === null) {
		// Get the current minute
		var minute = document.getElementById("adjustMin").innerHTML;
		
		// Increment
		if (sign === 1) {
			if (minute === "59") {
				modifyHour(1);
				document.getElementById("adjustMin").innerHTML = "0";				
			} else {
				document.getElementById("adjustMin").innerHTML = String(Number(minute) + 1);
			}
		}
		// Decrement if greater than 0
		else if (sign === -1) {
			if (minute > 0) {
				document.getElementById("adjustMin").innerHTML = String(Number(minute) - 1);
			} else if (sign === -1 && minute == 0 && document.getElementById("adjustHr").innerHTML !== "0") {
				modifyHour(-1);
				document.getElementById("adjustMin").innerHTML = "59";
			}	
		}
	}
}

// Increments or decrements the second
function modifySecond(sign) {
	// Don't modify if the timer is running
	if (timerOn === null) {
		// Get the current second
		var second = document.getElementById("adjustSec").innerHTML;
		
		// Increment
		if (sign === 1) {
			if (second < 59) {
				second = String(Number(second) + 1);
			} else if (second === "59") {
				modifyMinute(1);
				second = "0";
			}
		}
		// Decrement if greater than 00
		else if (sign === -1) {
			if (second > 0) {
				second = String(Number(second) - 1);
			} else if (second === "00") {
				if (document.getElementById("adjustMin").innerHTML > 0) {
					modifyMinute(-1);
					second = "59";
				} else if (document.getElementById("adjustMin").innerHTML == 0 && document.getElementById("adjustHr").innerHTML > 0) {
					//modifyHour(-1);
					modifyMinute(-1);
					second = "59";
				}
			}
		}
		
		// Make sure numbers less than 10 display a leading zero
		if (second < 10 && String(second) !== "00") {
			second = "0" + String(second);
		}
			
		document.getElementById("adjustSec").innerHTML = String(second);
	}
}

// This will end the session and prompt for a journal entry
function endTimer() {
	// Play the gong to indicate the meditation period is over
	gong.play();
	
	// Put the time meditated into the form field
	document.getElementById('meditationTime').value = timeMeditated;
	
	// Stop timer
	stopTimer();
	timeMeditated = -1;
	incrementFraction = -1;
	currentBrightness = 0;

	gong.onended = function() {				
		// Prompt the user to move to the journal entry or skip and submit
		var journalEntry = confirm("Click OK to make a journal entry");
	
		if (journalEntry) {
			// Hide the timer and display the journal entry
			document.getElementById('meditationTimer').style.display = "none";
			document.getElementById('meditationJournal').style.display = "";
		} else {
			document.getElementById("meditationEntry").submit();
		}
	};
}

// Start the timer
function startTimer() {
	// Log the total time the user is supposed to meditate in seconds
	if (timeMeditated === -1 && incrementFraction === -1) {
		timeMeditated = String(document.getElementById("adjustHr").innerHTML) + ":" + String(document.getElementById("adjustMin").innerHTML) + ":" + String(document.getElementById("adjustSec").innerHTML);
		incrementFraction = 100 / (Number(document.getElementById("adjustHr").innerHTML)*60*60 + Number(document.getElementById("adjustMin").innerHTML)*60 + Number(document.getElementById("adjustSec").innerHTML));
	}
	
	// Only start if the timer is not on & there are not values waiting to be modified
	if (timerOn === null && document.getElementById("hrInput").style.display === "none" && document.getElementById("minInput").style.display === "none" && document.getElementById("secInput").style.display === "none") {
		gong.play();
		
		document.getElementById('buddhaFill').style.opacity = 0.85;
		document.getElementById('buddhaFillImg').style.display = "initial";
		
		// Start the timer, counting down every second
		timerOn = setInterval(function() {
			var hrs = document.getElementById("adjustHr").innerHTML;
			var min = document.getElementById("adjustMin").innerHTML;
			var sec = document.getElementById("adjustSec").innerHTML;

			// If the timer is up
			if (hrs === "0" && min === "0" && sec === "00") {
				endTimer();
				
			} else {
				// Brighten the center image
				currentBrightness += incrementFraction;
				var brightVar = "invert(" + String(currentBrightness) + "%)";
				document.getElementById('buddhaFillImg').style.filter = brightVar;				
				
				// If seconds reach zero, decrement to 59
				if (sec === "00") {
					document.getElementById("adjustSec").innerHTML = "59";
					
					// Decrement minutes
					if (min > 0) {
						document.getElementById("adjustMin").innerHTML = String(min - 1);
					}
					
					else {
						// Adjust the hours
						if (hrs > 0) {
							document.getElementById("adjustHr").innerHTML  = String(hrs - 1);
							document.getElementById("adjustMin").innerHTML = "59";
						}
					}
				}
				// Else decrement by 1
				else {
					sec = Number(sec) - 1;
					
					if (sec < 10) {
						sec = "0" + String(sec);
					}
					
					document.getElementById("adjustSec").innerHTML = sec;
				}
			}
		}, 1000);
	}
}

// Stop the timer
function stopTimer() {
	clearInterval(timerOn);
	timerOn = null;
}

// Reset the timer
function resetTimer() {
	stopTimer();
	timeMeditated = -1;
	incrementFraction = -1;
	currentBrightness = 0;
	document.getElementById("adjustHr").innerHTML = "0";
	document.getElementById("adjustMin").innerHTML = "10";
	document.getElementById("adjustSec").innerHTML = "00";
	document.getElementById('buddhaFillImg').style.filter = "invert(0%)";
	document.getElementById('buddhaFill').style.opacity = 0.7;
	document.getElementById('buddhaFillImg').style.display = "none";
}

function replaceHrVal(textId, inputId) {
	if (textId === 'adjustHr' && Number(document.getElementById(inputId).value) >= 0) {
		document.getElementById(textId).innerHTML = Number(document.getElementById(inputId).value);				
		document.getElementById(inputId).style.display = 'none';
		document.getElementById(textId).style.display = '';
	}
}

// Allow the user to manually change the timer
function changeTimeVal(textId, inputId) {
	// Don't let the user modify the time if the timer is going
	if (!timerOn) {
		// Put the current value of the text in the input box
		document.getElementById(inputId).value = document.getElementById(textId).innerHTML;
	
		// Hide the text and show the input, focus on it
		document.getElementById(textId).style.display = 'none';
		document.getElementById(inputId).style.display = '';
		document.getElementById(inputId).focus();
	
		// When the user clicks enter, put the input value back into the text
		document.getElementById(inputId).onkeypress = function(e) {
			// Get the keyboard input
			var isEnter = e.which || e.keyCode;
		
			// If the user clicked enter, put the value in the input box back into the text area
			if (isEnter == '13') {
				// Replace the hour text as long as the text is 0 or greater
				if (textId === 'adjustHr') replaceHrVal(textId, inputId);
				
				// Enter the minute if within 0-59
				else if (textId === 'adjustMin' && Number(document.getElementById(inputId).value) >= 0 && Number(document.getElementById(inputId).value) <= 59) {
					document.getElementById(textId).innerHTML = Number(document.getElementById(inputId).value);
					document.getElementById(inputId).style.display = 'none';
					document.getElementById(textId).style.display = '';
				}
				// Enter the second if within 0-59, put trailing 0 in if less than 10
				else if (textId === 'adjustSec' && Number(document.getElementById(inputId).value) >= 0 && Number(document.getElementById(inputId).value) <= 59) {
					if (Number(document.getElementById(inputId).value) >= 10 && Number(document.getElementById(inputId).value) <= 59) {
						document.getElementById(textId).innerHTML = Number(document.getElementById(inputId).value);			
					} else if (Number(document.getElementById(inputId).value) >= 0 && Number(document.getElementById(inputId).value) < 10) {
						var secVal = "0" + String(Number(document.getElementById(inputId).value));
						document.getElementById(textId).innerHTML = secVal;			
					}
				
					document.getElementById(inputId).style.display = 'none';
					document.getElementById(textId).style.display = '';
				}
			}
		}
	}
}
