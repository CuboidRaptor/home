// consts because I want this to work for differnt viewportsspeplling is hard shut up
const cW = document.documentElement.clientWidth;
const cH = document.documentElement.clientHeight;
const sqCols = 75;
const sqRows = 50;
const weight = 1;
var sqWidth = Math.floor(Math.min(((cW) / sqCols), ((cH) / sqRows)));

const canvas = document.getElementById("main_canvas");
const ctx = canvas.getContext("2d");
const grid_opts = { // griddy
    cols       : sqCols,
    rows       : sqRows,
    width      : sqWidth * sqCols,
    height     : sqWidth * sqRows,
    weight     : weight,
    background : "#000000",
    color      : "#b8b8c8"
};

var matrix; // matrix, will be randomly init'ed by init() on program start

const rSurvive = [3, 4, 5];
const rBirth = [2, 4];
const rStates = 20;

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

const states = 20;
const colors = ["#000000"];

for (let i = 1; i <= (states - 1); i++) {
    colors.push(hsvToRgb(i / (states - 1), 0.69, 0.84))
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

function click(e) { // click listener
    var x = e.pageX - e.currentTarget.offsetLeft; 
    var y = e.pageY - e.currentTarget.offsetTop;
    var gridx = Math.round((x - (sqWidth / 2)) / sqWidth);
    var gridy = Math.round((y - (sqWidth / 2)) / sqWidth);
    
    createCanvasGrid();
    drawRect(1, gridx, gridy);
    drawLines()
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
    
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            drawRect(matrix[row][col], col, row);
        }
    }
    
    drawLines();
}

function matrixGet(row, col) {
    var row = matrix[row];
    
    if (row == undefined) {
        return 0;
    }
    
    var val = row[col];
    
    return (val == undefined) ? 0 : val
}

function count(arr, item) {
    return Array.from(
        arr,
        (elem) => ((elem == item) ? 1 : 0)
    ).reduce(
        (partialSum, a) => partialSum + a,
        0
    );
}

function neighbors(row, col) {
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
    var newMatrix = Array.from(new Array(matrix.length), (elem) => new Array(matrix[0].length));

    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            let state = matrix[row][col];
            let cur_n = neighbors(row, col); // list of neighbors
            let cur_c = count(cur_n, state); // count of neighbors with same state
            let cur_c1 = count(cur_n, state + 1); // count of neighbors with next state
            let changed = false;
            
            if (state > 0) {
                if (!rSurvive.includes(cur_c)) {
                    newMatrix[row][col] = state - 1;
                    changed = true;
                }
            }
            
            if (state < states) {
                if (rBirth.includes(cur_c1)) {
                    newMatrix[row][col] = state + 1;
                    changed = true;
                }
            }
            
            if (!changed) {
                newMatrix[row][col] = state;
            }
        }
    }
    
    matrix = newMatrix;
    
    render();
}

function init() { // init!
    matrix = Array.from({length:sqRows}, function () {
        row = new Array(sqCols)
        
        for (let i = 0; i < row.length; i++) {
            row[i] = Math.floor(Math.random() * 2);
        }
        
        return row;
    });
    
    // tick();
    
    render();
    
    setInterval(tick, 1000);
    
    canvas.addEventListener("click", click);
}

init();