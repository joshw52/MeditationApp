var timerOn = null;	// Indicates if timer is running or not
var timeMeditated = -1;	// Hold the time meditated
var incrementFraction = -1;	// The fraction that the image will be revealed in per second while the timer runs
var currentBrightness = 0;	// The current brightness of the namaste image
var gong = new Audio('https://soundbible.com/grab.php?id=1815&type=mp3');	// The gong sound to be played at the beginning and end

// Modify your the account
function modifyAccount(modify) {
	var socket = io();
	
	// If any fields are blank or the zip code isn't 5 digits, display an error and don't modify
	if ((document.getElementById('firstname').value === "" || document.getElementById('lastname').value === "" || 
		document.getElementById('email').value === "" || String(document.getElementById('zipcode').value).length < 5 || 
		String(document.getElementById('zipcode').value).length > 5) && modify === "Modify") {
		document.getElementById('modifiedMsg').innerHTML = "<span style='color: #FF5555;'>Fields cannot be blank, and zip code must be 5 digits</span>";
	}
	// Otherwise modify or cancel
	else {
		socket.emit('accountModification', {
			username: document.getElementById('username').innerHTML,
			firstname: document.getElementById('firstname').value,
			lastname: document.getElementById('lastname').value,
			email: document.getElementById('email').value,
			zipcode: document.getElementById('zipcode').value,
			accountMod: modify
		});
	}
	
	// If the account was modified, indicate so, or else grab the unmodified values for the fields
	socket.on('accountModified', function(response) {		
		if (response.modified) {
			document.getElementById('modifiedMsg').innerHTML = "Account Modified!";
		} else {
			document.getElementById('username').innerHTML = response.username;
			document.getElementById('firstname').value = response.firstname;
			document.getElementById('lastname').value = response.lastname;
			document.getElementById('email').value = response.email;
			document.getElementById('zipcode').value = response.zipcode;
			document.getElementById('modifiedMsg').innerHTML = "";
		}
	});
}

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
		// If the login was accepted, login to the site
		if (response.loginAccepted === true) {
			// Now the form can be submitted
			document.getElementById('loginForm').submit();
		}
		// If the login was not accepted, display an error
		else {
			document.getElementById('loginErr').innerHTML = "<br><span style='color: #FF5555;'>Username/password credentials are incorrect!</span><br><br>";
			document.getElementById('accountCreation').style.display = "none";
		}
		
		socket.close();
	});
	
	// The form will not submit unless the login was accepted
	event.preventDefault();
}

function setDefaultTime() {
	// Create a socket
	var socket = io();

	// Send the username/password to the server
	socket.emit('setDefaultTime', {
		defaultHrs: document.getElementById('adjustHr').innerHTML,
		defaultMinutes: document.getElementById('adjustMin').innerHTML,
		defaultSeconds: document.getElementById('adjustSec').innerHTML		
	});
}

// Will send the chosen month/year to the server to retrieve the
// progress for that time period
function displayProgress() {
	var socket = io();
	
	socket.emit('requestMonthProgress', {
		progressMonth: document.getElementById('progressMonth').value,
		progressYear: document.getElementById('progressYear').value
	});
	
	socket.on('receiveMonthProgress', function(progress) {
		document.getElementById('progMsg').style.display = "none";
		document.getElementById('progDiv').innerHTML = progress.progDates;
		socket.close();
	});
}

// Create an account
function createAccount(event) {	
	document.getElementById('errMsg').innerHTML = "";
	document.getElementById('errMsg').style.display = "none";
	
	var emptyField = false;
	var mismatchedPasswords = false;
	var shortPasswords = false;
	var zipCodeWrongLength = false;
	var errMessage = "";

	// Validate first name (can't be empty)
	if (document.getElementById('firstname').value === "" || document.getElementById('lastname').value === "" || 
		document.getElementById('username').value === "" || document.getElementById('password').value === "" ||
		document.getElementById('confirmPass').value === "" || document.getElementById('email').value === "" ||
		document.getElementById('zipcode').value === "") {
		emptyField = true;
		errMessage += "All fields must be filled!<br>";
	}
	
	// Validate the passwords (make sure at least 8 characters)
	if (String(document.getElementById('password').value).length < 8 || String(document.getElementById('confirmPass').value).length < 8) {
		shortPasswords = true;
		errMessage += "Passwords must be at least 8 characters!<br>";
	}
	
	// Make sure the passwords match
	if (document.getElementById('password').value !== document.getElementById('confirmPass').value) {
		mismatchedPasswords = true;
		errMessage += "Passwords do not match!<br>";
	}
	
	// Make sure zip code is 5 digits
	if (String(document.getElementById('zipcode').value).length !== 5) {
		zipCodeWrongLength = true;
		errMessage += "Zip code must be 5 digits long!<br>";
	}
	
	// The form will not submit if there were errors
	if (emptyField === true || mismatchedPasswords == true || shortPasswords == true || zipCodeWrongLength == true) {
		document.getElementById('errMsg').innerHTML = errMessage;
		document.getElementById('errMsg').style.display = "block";
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
				// Now the account form can be submitted
				document.getElementById('accountCreation').submit();
			}
			// If the username is being used, display error
			else {
				errMessage += "Username is taken!";	
				document.getElementById('errMsg').innerHTML = errMessage;
				document.getElementById('errMsg').style.display = "block";
			}
			
			socket.close();
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
	location.reload();
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
