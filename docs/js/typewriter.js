// Defining constants
var quoteArray = [
	"Hi, I'm a dumb guy who does random stuff that you legit don't care about.",
	"I'm also a nerd who writes code.",
	"Sometimes my programs even turn out to be useful.",
	"One thing I wrote that is notable, is.^.^.",
	"Well.^^.^^.^^.",
	"Anyways, ^^^^^I guess the clever piece of JavaScript in this page that is typing this text can loop back to the beginning now."
];
var textPosition = 0; 
var mode = "w";
var textNum = 0;
var doneDelay = false;

// More stuff
typewriter = () => {
	if ((quoteArray[textNum][textPosition-1] == "^") && (mode == "w")) {
		setTimeout(typewriter, 100)
		textPosition++;
		return
	}
	document.querySelector("#target").innerHTML = quoteArray[textNum].substring(0, textPosition).replace(/\^/g, "") + '<span class="blink">|</span>';
	if (mode == "w") {
		textPosition++;
		var speed = 100;
	} else {
		if (quoteArray[textNum][textPosition] == "^") {
			textPosition--;
		}
		textPosition--;
        if (quoteArray[textNum][textPosition] == "^") {
			textPosition--;
		} // yes this check is run twice I can't be fk bothered to read my own code
		var speed = 60;
	}
	
	if (doneDelay) {
		speed = doneDelay;
		doneDelay = false;
	}
	
	if (mode == "w") {
		if (textPosition < quoteArray[textNum].length) {
			mode = "w";
		} else {
			doneDelay = 1200;
			mode = "d";
		}
	} else if (mode == "d") {
		if (textPosition == 0) {
			doneDelay = 1000;
			textNum++;
			
			if (textNum >= quoteArray.length) {
				textNum = 0;
			}
			
			mode = "w";
		} else {
			mode = "d";
		}
	}
	
	setTimeout(typewriter, speed);
}

window.addEventListener("load", typewriter);