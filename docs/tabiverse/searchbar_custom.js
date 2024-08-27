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

function fade_error(msg) {
    if (err_p.innerHTML === msg) {
        err_p.innerHTML = "";
    }
}

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
        err_p.innerHTML = emsg;
        setTimeout(() => (fade_error(emsg)), 5000);
        throw e;
    }
    
} 

// add listener
form.addEventListener("submit", searched);