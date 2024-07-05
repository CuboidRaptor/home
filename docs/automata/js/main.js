// automaton rule is modified Bombers by Mirek Wojtowicz.

// consts because I want this to work for differnt viewportsspeplling is hard shut up
var cW;
var cH;
const sqCols = 100;
const sqRows = 75;
const weight = 2;
var sqWidth;
const tick_framerate = 30;
const maxmousepollrate = 60;
const outlinecolor = "#fefeff";
const gamemargin = 10;
const hudheight = 150;

var plmx = 0; // precision last mouse x
var plmy = 0;
var lastmousex = 0;
var lastmousey = 0 ;
var mousex = 0;
var mousey = 0;
var processing = new Set();
var mousedownstate = false;
var mousejustup = false;

const bresenhamWorker = new Worker("js/bresenham.js");

const gamediv = document.getElementById("game");
const windowdiv = document.getElementById("window");
const rectanglediv = document.getElementById("rectangle");

const canvas = document.getElementById("main_canvas");
const ctx = canvas.getContext("2d");
var grid_opts = { // griddy
    cols        : sqCols,
    rows        : sqRows,
    width       : sqWidth * sqCols,
    height      : sqWidth * sqRows,
    weight      : weight,
    background  : "#000000",
    color       : "#686878"
};

var matrix; // matrix, will be randomly init'ed by init() on program start

const rSurvive = [3, 4, 5];
const rBirth = [2, 4];
const rStates = 15;

// by mjackson on github, slightyl modified by me
function hsvToRgb(h, s, v) { // exactly what it sounds like
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return "#" + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
}

const colors = ["#000000"];

for (let i = 1; i <= (rStates - 1); i++) {
    colors.push(hsvToRgb(i / (rStates - 1), 0.55, 0.9))
}

rectanglediv.style.height = hudheight;

function resize() {
    cW = document.documentElement.clientWidth;
    cH = document.documentElement.clientHeight;
    sqWidth = Math.floor(
        Math.min(
            ((cW - (2 * gamemargin)) / sqCols),
            (((cH - (2 * gamemargin)) * 0.9) / sqRows)
        )
    ); // resize the game dynamically
    grid_opts.width = sqWidth * sqCols;
    grid_opts.height = sqWidth * sqRows;
    
    gamediv.style.width = (sqWidth * sqCols).toString() + "px";
    gamediv.style.height = (sqWidth * sqRows + 150 + 5).toString() + "px"; // the 5px is for some goofy ahhh css margin that i'm too lazy to remove
    
    rectanglediv.style.width = (sqWidth * sqCols).toString() + "px";
}

function drawRect(cind, x, y) { // draw rect with cind color from colors array and at grid (x, y)
    ctx.fillStyle = colors[cind];
    ctx.fillRect(
        x * sqWidth,
        y * sqWidth,
        sqWidth,
        sqWidth
    );
}

function drawOutlineRect(color, x, y) { // draw rect outline rect with color color at (x, y)
    ctx.strokeStyle = color;
    ctx.strokeRect( 
        x * sqWidth,
        y * sqWidth,
        sqWidth,
        sqWidth
    );
}

function mousedown(e) { // mosue go up
    // console.log(gridx, gridy);
    // console.log(matrixGet(gridy, gridx));
    // console.log(neighbors(gridy, gridx));
    
    // matrix[gridy][gridx] = rStates - 1;
    processing.add([mousex, mousey]);
    
    mousedownstate = true;
    
    render();
}

function mouseup(e) { // mouse go down
    mousedownstate = false;
    mousejustup = true; // turning stroke into alive cells gets moved into end of tick() because I'm paranoid of race conditions
}

function createCanvasGrid() { // init canvas with no lines, just a rect
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    canvas.width = grid_opts.width;
    canvas.height = grid_opts.height;
    
    ctx.fillStyle = grid_opts.background;
    ctx.fillRect(0, 0, grid_opts.width, grid_opts.height);
}

function drawLines() { // draw griddy lines
    ctx.beginPath();
    ctx.strokeStyle = grid_opts.color;
    ctx.lineWidth = grid_opts.weight;
    
    for (let i = 0; i <= grid_opts.cols; i++) { // all  vert grid lines
        let newX = i * (grid_opts.width / grid_opts.cols);
        ctx.moveTo(newX, 0);
        ctx.lineTo(newX, grid_opts.height);
    }
    
    for (let i = 0; i <= grid_opts.rows; i++) { // horz lines
        let newY = i * (grid_opts.height / grid_opts.rows);
        ctx.moveTo(0, newY);
        ctx.lineTo(grid_opts.width, newY);
    }
    
    ctx.stroke();
} 

function render() { // render the frame by drawing squares
    createCanvasGrid();
    
    for (let row = 0; row < matrix.length; row++) { // render every square from matrix
        for (let col = 0; col < matrix[row].length; col++) {
            drawRect(matrix[row][col], col, row);
        }
    }
    
    drawLines();
    
    processing.forEach(function(sq) {
        drawOutlineRect(outlinecolor, sq[0], sq[1]);
    });
}

function matrixGet(row, col) { // get state at position (yes it's a one line func I'm lazy ight)
    let mrow = matrix[row];
    
    if (mrow === undefined) {
        return 0;
    }
    
    let val = mrow[col];
    
    return (val !== undefined) ? val : 0;
}

function count(arr, cond) { // count occurences in arr that return true when passed into cond()
    return Array.from(
        arr,
        (elem) => (cond(elem) ? 1 : 0)
    ).reduce(
        (partialSum, a) => partialSum + a,
        0
    );
}

function neighbors(row, col) { // return list of states of neighbours
    return [
        matrixGet(row - 1, col - 1),
        matrixGet(row, col - 1),
        matrixGet(row + 1, col - 1),
        matrixGet(row - 1, col),
        matrixGet(row + 1, col),
        matrixGet(row - 1, col + 1),
        matrixGet(row, col + 1),
        matrixGet(row + 1, col + 1)
    ];
}

function tick() { // every tick/frame
    var newMatrix = Array.from(new Array(matrix.length), (elem) => (new Array(matrix[0].length)).fill(0));

    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            let state = matrix[row][col];
            let cur_n = neighbors(row, col); // list of neighbor rStates
            let cur_c = count(cur_n, (elem) => (elem == (rStates - 1))); // count of neighbors alive or dying state
            let changed = false;
            
            // state 0 = dead, state <rStates - 1> = alive, state 1 - <rStates - 1> is decreasing amounts of dying
            if (state == 0) {
                if (rBirth.includes(cur_c)) {
                    newMatrix[row][col] = rStates - 1;
                }
            }
            else if (state > 0) {
                let shouldSurvive = rSurvive.includes(cur_c);
                
                if ((state == (rStates - 1)) && (shouldSurvive)) {
                    newMatrix[row][col] = state;
                }
                else {
                    newMatrix[row][col] = state - 1;
                }
            }
        }
    }
    
    matrix = newMatrix;
    
    if (mousejustup) { // add in stroked alive cells
        processing.forEach(function(sq) {
            matrix[sq[1]][sq[0]] = rStates - 1;
        });
        processing = new Set();
        mousejustup = false;
    }
    
    resize();
    render();
}

function mousemove(e) { // take event thingy and get relative mouse position to canvas
    if (e.timeStamp - this.pointerTimestamp < (1000 / (maxmousepollrate))) {
        return
    }
    this.pointerTimestamp = e.timeStamp
    
    let rect = canvas.getBoundingClientRect(),
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    let x = (e.clientX - rect.left) * scaleX;   // scale mouse coordinates after they have been adjusted to be relative to element
    let y = (e.clientY - rect.top) * scaleY;
    
    mousex = Math.round((x - (sqWidth / 2)) / sqWidth);
    mousey = Math.round((y - (sqWidth / 2)) / sqWidth);
    
    if (((mousex !== lastmousex) || (mousey !== lastmousey)) && mousedownstate) {
        processing.add([mousex, mousey]); // outline
        
        // bresenham's line algorithm to interpolate/monkeypatch browser's terrible sampling rate
        
        bresenhamWorker.postMessage([mousex, mousey, lastmousex, lastmousey]);
    }
        
    lastmousex = mousex;
    lastmousey = mousey;
    plmx = x;
    plmy = y;
}

bresenhamWorker.onmessage = (e) => {
    processing = new Set([...processing, ...e.data]);
    render();
    
    setTimeout(
        function() { // check if mousedown and not cleared in 150ms (a.k.a lag go brrrr), then render and clear
            if ((processing != new Set()) && (!mousedownstate)) {
                mousejustup = true;
            }
        },
        150
    )
}

function init() { // init!
    /* random initialisation for testing
    matrix = Array.from({length:sqRows}, function () {
        row = new Array(sqCols)
        
        for (let i = 0; i < row.length; i++) {
            row[i] = (Math.floor(Math.random() * 2) == 0) ? 0 : (rStates - 1);
        }
        
        return row;
    });
    */
    resize();
    matrix = Array.from(new Array(sqRows), (elem) => (new Array(sqCols)).fill(0));
    
    render();
    
    setInterval(tick, (1000 / tick_framerate));
    // setInterval(mousecheck, (1000 / mouse_framerate));
    
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mousemove", mousemove);
}

init();