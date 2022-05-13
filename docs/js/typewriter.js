// Defining constants
var quoteArray = [
	"I'm a dumb guy who makes youtube videos.",
	"I'm also a nerd who writes programs.",
	"Sometimes my programs even turn out to be useful.",
	"I play all sorts of stuff on my youtube channel, such as Minecraft, Undertale, Celeste, etc."
];
var textPosition = 0; 
var mode = "w";
var textNum = 0;
var doneDelay = false;

// More stuff
typewriter = () => {
	document.querySelector("#target").innerHTML = quoteArray[textNum].substring(0, textPosition) + '<span class="blink">|</span>';
	if (mode == "w") {
		textPosition++;
		var speed = 70;
	} else {
		textPosition--;
		var speed = 100;
	}
	
	if (doneDelay) {
		speed = 1000;
		doneDelay = false;
	}
	
	if (mode == "w") {
		if (textPosition < quoteArray[textNum].length) {
			mode = "w";
		} else {
			doneDelay = true;
			mode = "d";
		}
	} else if (mode == "d") {
		if (textPosition == 0) {
			doneDelay = true;
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