// set lightbulb image randomly
var bgimg = document.getElementById("lb");
randint = Math.floor(Math.random() * 3);
bgimg.setAttribute("src", `img/wslb${randint + 1}.gif`);

// add zeroes to shorter dates for consistent formatting
function addZero(dateN)
{
    dateS = dateN.toString()
    if (dateN < 10)
    {
        dateS = "0" + dateS;
    }
    return dateS;
}

var datetxt = document.getElementById("date"); // set date objects
var utimestamp = document.getElementById("utimestamp");

const dcids = [];

function killAllTimeouts() // kill all running cleardates so we don't create massive memory leaks on refocus
{
    for (let i = 0; i < dcids.length; i++)
    {
        clearTimeout(i);
    }
}

document.addEventListener("visibilitychange", (event) => { // restart clock on refocus
    if (document.visibilityState == "visible")
    {
        killAllTimeouts();
        setTimeout(killAllTimeouts, 500);
        checkDate();
    }
});

function utcOffsetFormat(date)
{
    var tzo = date.getTimezoneOffset();
    
    if (tzo < 0)
    {
        tzo = -tzo
        return "UTC+" + `${addZero(Math.floor(tzo / 60))}:${addZero(tzo % 60)}`;
    }
    else if (tzo > 0)
    {
        return "UTC-" + `${addZero(Math.floor(tzo / 60))}:${addZero(tzo % 60)}`;
    }
    else
    {
        return "UTC+00:00";
    }
}

function checkDate(dcid=-69) // check the current date, update
{
    if (dcid != -69)
    {
        var index = array.indexOf(dcid);
        if (index > -1)
        {
          array.splice(index, 1);
        }
    }
    
    // check dmode so it changes at the start of every period
    var date = new Date();
    title = document.getElementById("wstitle");
    
    if ((date.getHours() == 20) && (date.getMinutes() == 0) && (date.getSeconds() == 0))
    {
        document.documentElement.style.mixBlendMode = "difference";
        title.innerText = "WELCOME TO BLACK SPACE.";
    }
    else if ((date.getHours() == 8) && (date.getMinutes() == 0) && (date.getSeconds() == 0))
    {
        document.documentElement.style.mixBlendMode = "normal";
        title.innerText = "WELCOME TO WHITE SPACE.";
    }
    
    var date = new Date();
    var dateString = `${date.getFullYear()}/${addZero(date.getMonth() + 1)}/${addZero(date.getDate())}, \
${addZero(date.getHours())}:${addZero(date.getMinutes())}.${addZero(date.getSeconds())} \
${utcOffsetFormat(date)}`;
    datetxt.innerText = `It has been ${dateString} for as long as you can remember.`;
    utimestamp.innerText = `(${Math.floor(date.getTime() / 1000)})`;
    
    if (document.visibilityState == "visible")
    {
        currentDcid = setTimeout(checkDate, 1000, dcid);
        dcids.push(currentDcid);
    }
}

checkDate();

//darkmode because full whitespace hurts

function clickHandlerDMode()
{
    mbm = document.documentElement.style.mixBlendMode;
    title = document.getElementById("wstitle");
    
    if (mbm == "difference")
    {
        document.documentElement.style.mixBlendMode = "normal";
        title.innerText = "WELCOME TO WHITE SPACE.";
    }
    else
    {
        document.documentElement.style.mixBlendMode = "difference";
        title.innerText = "WELCOME TO BLACK SPACE.";
    }
    
    clickHandlerSpkr(); clickHandlerSpkr(); // kill and restart music
}

var playing = false;
var audio = undefined;

function clickHandlerSpkr()
{
    var mbm = document.documentElement.style.mixBlendMode;
    
    if (!playing)
    {
        if (mbm == "normal")
        {
            audio = new Audio("audio/whitespace.ogg");
        }
        else if (mbm == "difference")
        {
            audio = new Audio("audio/welcome_again.ogg");
        }
        
        audio.loop = true;
        playing = true;
        audio.play();
    }
    else
    {
        audio.pause();
        playing = false;
    }
    
}

var dmode = document.getElementById("dmode");
dmode.addEventListener("click", clickHandlerDMode)

var spkr = document.getElementById("spkr");
spkr.addEventListener("click", clickHandlerSpkr)

// check dmode on open
var date = new Date();
title = document.getElementById("wstitle");
if ((date.getHours() >= 20) || (date.getHours() < 8))
{
    document.documentElement.style.mixBlendMode = "difference";
    title.innerText = "WELCOME TO BLACK SPACE.";
}
else
{
    document.documentElement.style.mixBlendMode = "normal";
    title.innerText = "WELCOME TO WHITE SPACE.";
    }

// qotd
quotes = `Just because you did something bad, doesn't make you a bad person.
All it costs is your love!
You'd forgive youself, won't you Sunny?
Goodbye... little brother.
I fucking love air-conditioning.
You just shouldn't have looked.
Promise me we'll always be there for each other.
What if it's up to you? What if it's only up to you?
The sun shined brighter... when she was here...
You are far away from home.
It's a long way down... do you want to jump?
I have to tell you something.
Friends... friends are supposed to be there for each other.
A place to survive, but not to live.
An unallowed burden has been placed upon you. You have the power to change the future.
What will you do, DREAMER? What will you do?
Everything is going to be okay.
Don't be afraid. It's not as scary as you think.
No bandage can stifle and eternal wound... and there will be a time when it's influence will bleed through.
Waiting for something to happen?
It might be easier to ignore your problems, but it's okay to cry about them too.
You can see it too, can't you? Something... something behind you...
There is nothing here.
Maybe one day... things can go back to the way they were before.
Close your eyes, you'll be here soon.
Oyasumi
There's no way out of this, is there?
Left, right, up, it doesn't matter! It's all forward, isn't it?
Pain doesn't last forever.
Trying to lose yourself? Or have you accomplished that already?
The DREAMER could run and bury away his fears, but one still has to face his own reflection.
MEWO has been very, very bad.
With time, what is important will change. You must choose what you will keep and what you will cast away.
Humans are bounded creatures. Your limits are what define you. What makes you human?
When trouble shows itself, there is always the choice to run. But one day, you may very well find yourself running alone.
You may not be in control now... but do not lose hope, DREAMER. There are some who still believe in you.
My thoughts will follow you into your dreams.`.split("\n");

var date = new Date();
datestamp = Math.floor((date.getTime() - date.getTimezoneOffset()) / 86400000);

var qn = localStorage.getItem("qn");

if (qn == null) // no qotd
{
    qn = Math.floor(Math.random() * quotes.length);
    quote = quotes[qn];
    localStorage.setItem("qn", qn + "," + (datestamp + 1));
}
else
{
    q = qn.split(",");
    qexp = q[1];
    qn = q[0];
    
    if ((qexp <= datestamp) || ((qn >= quotes.length))) // expired qotd or invalid length (update?)
    {
        console.log(qexp);
        console.log(datestamp);
        qn = Math.floor(Math.random() * quotes.length);
        quote = quotes[qn];
        localStorage.setItem("qn", qn + "," + (datestamp + 1));
    }
    else // valid
    {
        quote = quotes[qn];
    }
}

quoteElem = document.getElementById("quote");
quoteElem.innerText = quote;

