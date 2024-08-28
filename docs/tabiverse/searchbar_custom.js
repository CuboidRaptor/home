"use strict";

// get list of TLDs from IANA website thing
const tlds_url = "https://data.iana.org/TLD/tlds-alpha-by-domain.txt";
let tlds = [];
fetch(tlds_url)
    .then((response) => (response.text()))
    .then((response) => {
        tlds = (response.split(/\r?\n/).slice(1));
    }
);

// the search <input>
const search_input = document.getElementById("search");
const container = document.getElementById("sbar-container");

// focus search bar
search_input.focus();

// resize searchbar to maximum width - 256 (for spacing of other icon) or 1200, whichever is smaller
function searchbar_resize(event) {
    let barsize = Math.min(document.documentElement.clientWidth - 256, 1200)
    container.style.width = `${barsize}px`;
}

// resize initially, and then add listener
searchbar_resize();
window.addEventListener("resize", searchbar_resize);

// get <form> element
const form = document.getElementById("sbar-form");
const engine_display = document.getElementById("engine-display");

// error message tag
const err_p = document.getElementById("err");

// make message fade and reset after a bit
function fade_error(msg) {
    if (err_p.innerHTML === msg) {
        err_p.style.opacity = "0";
    }
}

// reset opacity, innerhtml, blah blah blah of error <p> tag (after fadeout finishes)
function reset() {
    err_p.innerHTML = "";
    err_p.classList.remove("fade-transition");
    err_p.style.opacity = "1";
    err_p.offsetHeight; // listen I know this looks cursed but it triggers a reflow otherwise this still animates
    err_p.classList.add("fade-transition");
}

// set listener to empty when done fading
err_p.addEventListener("transitionend", reset);

// regexes for searched()
const domain_re = /^(?:[a-z\-]+\.)+([a-z\-]+)\/.*/i;

const default_engine = [":g", "Google", "https://www.google.com/search?q="];
const engines = [
    [":g", "Google", "https://www.google.com/search?q="],
    [":yt", "YouTube", "https://www.youtube.com/results?search_query="],
    [":d", "DuckDuckGo", "https://duckduckgo.com/?q="],
    [":e", "Ecosia", "https://www.ecosia.org/search?q="],
    [":s", "Startpage", "https://www.startpage.com/do/search?query="],
    [":amzn", "Amazon", "https://www.amazon.ca/s?k="],
    [":b", "Bing", "https://www.bing.com/search?q="],
    [":br", "Brave Search", "https://search.brave.com/search?q="],
    [":mo", "Mojeek", "https://www.mojeek.com/search?q="],
    [":m", "MuseScore", "https://musescore.com/sheetmusic?text="]
];

// when enter is pressed
function searched(event) {
    event.preventDefault();
    try {
        let string = search_input.value.trimEnd();
        let original_string = string;
        let urlToOpen = null;

        if (string === "[DEBUG]: error.throw();") {
            throw new Error("Debug error triggered in omnibox");
        }

        // strip protocol so we can apply a regex to determine url/google search
        if (string.startsWith("http:")) {
            string = string.slice(5).match(/\/*(.+)/)[1];
        }
        else if (string.startsWith("https:")) {
            string = string.slice(6).match(/\/*(.+)/)[1];
        }
        let slashed_string = string.endsWith("/") ? string : (string + "/"); // add a slash to the end if not present

        let re_match = slashed_string.match(domain_re);

        if (re_match !== null) { // matches url regex
            let tld = re_match[1];

            if (tlds.includes(tld.toUpperCase())) { // valid tld, http open it (hsts + https everywhere should make this safe)
                urlToOpen = "http://" + string;
            }
            else { // invalid tld, send to default search
                urlToOpen = default_engine[2] + original_string;
            }
        }
        else { // not url, send to default search
            let search_string = default_engine[2];
            let content_string = original_string;

            for (let engine of engines) { // check if any search engines enabled
                if (original_string.startsWith(engine[0] + " ")) {
                    search_string = engine[2];
                    content_string = content_string.slice(engine[0].length + 1);
                    break;
                }
            }

            urlToOpen = search_string + content_string;
        }

        console.log("urlToOpen:");
        console.log(urlToOpen);
        if (urlToOpen !== null) { // open!!!
            window.open(urlToOpen, "_self", "noreferrer=true");
        }
        else { // something borked
            throw new Error("urlToOpen is null/undefined");
        }
    }
    catch (e) { // deal with errors + display them
        let emsg = String(e.message);
        reset();
        err_p.innerHTML = emsg;
        setTimeout(() => (fade_error(emsg)), 5000);
        throw e;
    }
    
} 

function oninput(event) {
    console.log(search_input.value);
    let found = false;
    for (let engine of engines) { // check if any search engines enabled
        if (search_input.value.startsWith(engine[0] + " ")) {
            engine_display.innerHTML = engine[1];
            found = true;
            break;
        }
    }

    if (!found) {
        engine_display.innerHTML = "<br>";
    }
}

// add listener
form.addEventListener("submit", searched);
search_input.addEventListener("input", oninput);

// set placecholder correctly with default engine
search_input.placeholder = `Search with ${default_engine[1]} or enter address`;