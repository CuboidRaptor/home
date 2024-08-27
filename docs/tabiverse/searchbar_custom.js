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

// focus search bar
search_input.focus();

// resize searchbar to maximum width - 256 (for spacing of other icon) or 1000, whichever is smaller
function searchbar_resize(event) {
    let barsize = Math.min(document.documentElement.clientWidth - 256, 1000)
    search_input.style.width = `${barsize}px`;
}

// resize initially, and then add listener
searchbar_resize();
window.addEventListener("resize", searchbar_resize);

// get <form> element
const form = document.getElementById("sbar-form");

// error message tag
const err_p = document.getElementById("err");

// make message fade and reset after a bit
function fade_error(msg) {
    if (err_p.innerHTML === msg) {
        err_p.style.opacity = "0";
    }
}

// reset opacity, innerhtml, blah blah blah of error <p> tag
function reset() {
    err_p.innerHTML = "";
    err_p.classList.remove("fade-transition");
    err_p.style.opacity = "1";
    err_p.offsetHeight; // listen I know this looks cursed but it triggers a reflow otherwise this still animates
    err_p.classList.add("fade-transition");
}

// set listener to empty when done fading
err_p.addEventListener("transitionend", reset);

// when enter is pressed
function searched(event) {
    event.preventDefault();
    let url = search_input.value;
    
    try {
        if (
            url.startsWith("http:")
            || url.startsWith("https:")
            || url.startsWith("file:")
        ) {
            window.open(url, "_self");
        }
        else {
            throw Error;
        }
    }
    catch (e) {
        let emsg = String(e.message);
        reset();
        err_p.innerHTML = emsg;
        setTimeout(() => (fade_error(emsg)), 5000);
        throw e;
    }
    
} 

// add listener
form.addEventListener("submit", searched);