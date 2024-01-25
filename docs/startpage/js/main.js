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

var datetxt = document.getElementById("date"); // set date object

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
    
    var date = new Date();
    var dateString = `${date.getFullYear()}/${addZero(date.getMonth() + 1)}/${addZero(date.getDate())}, \
${addZero(date.getHours())}:${addZero(date.getMinutes())}.${addZero(date.getSeconds())}`;
    datetxt.innerText = `It has been ${dateString} for as long as you can remember.`;
    
    if (document.visibilityState == "visible")
    {
        currentDcid = setTimeout(checkDate, 1000, dcid);
        dcids.push(currentDcid);
    }
}

checkDate();

//darkmode because full whitespace hurts

function clickHandler()
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
}

dmode.addEventListener("click", clickHandler)
