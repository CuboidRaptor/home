// automaton rule is modified Bombers by Mirek Wojtowicz.

// consts because I want this to work for differnt viewportsspeplling is hard shut up
const cW = document.documentElement.clientWidth;
const cH = document.documentElement.clientHeight;
const sqCols = 100;
const sqRows = 75;
const weight = 2;
var sqWidth = Math.floor(Math.min(((cW) / sqCols), ((cH) / sqRows)));
const tick_framerate = 30;
const maxmousepollrate = 60;
const outlinecolor = "#fefeff";

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

const canvas = document.getElementById("main_canvas");
const ctx = canvas.getContext("2d");
const grid_opts = { // griddy
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
    
    if (mousejustup) {
        processing.forEach(function(sq) {
            matrix[sq[1]][sq[0]] = rStates - 1;
        });
        processing = new Set();
        mousejustup = false;
    }
    
    render();
}

function mousemove(e) { // take event thingy and get relative mouse position to canvas
    if (e.timeStamp - this.pointerTimestamp < (1000 / (maxmousepollrate))) {
        return
    }
    this.pointerTimestamp = e.timeStamp
    
    let x = e.pageX - e.currentTarget.offsetLeft; 
    let y = e.pageY - e.currentTarget.offsetTop;
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
    matrix = Array.from({length:sqRows}, function () {
        row = new Array(sqCols)
        
        for (let i = 0; i < row.length; i++) {
            row[i] = (Math.floor(Math.random() * 2) == 0) ? 0 : (rStates - 1);
        }
        
        return row;
    });
    
    render();
    
    setInterval(tick, (1000 / tick_framerate));
    // setInterval(mousecheck, (1000 / mouse_framerate));
    
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mousemove", mousemove);
}

init();