// Defining constants
var quoteArray = [
	"Hi, I'm a dumb guy who makes youtube videos.",
	"I'm also a nerd who writes code.",
	"Sometimes my programs even turn out to be useful.",
	"I play all sorts of stuff on my youtube channel, ^^^^such as Minecraft, Undertale, Minecraft, Minecraft, etc.",
	"Please subscribe, ^^^^^or something.",
	"Oh wait, ^^^I didn't give you the link, did I.",
	"So, ^^^^it's in the sidebar that just so happens to be at the top-left of this page.",
	"Have you subscribed? ^^No? ^^Yeah, that's about what I expected.",
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
		textPosition--;
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