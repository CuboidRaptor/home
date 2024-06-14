// consts because I want this to work for differnt viewportsspeplling is hard shut up
const cW = document.documentElement.clientWidth;
const cH = document.documentElement.clientHeight;
const sqCols = 75
const sqRows = 50
var sqWidth = Math.floor(Math.min(((cW) / sqCols), ((cH) / sqRows)))

const canvas = document.getElementById("main_canvas");
const ctx = canvas.getContext("2d");

function click(e) { // click listener
    var x = e.pageX - e.currentTarget.offsetLeft; 
    var y = e.pageY - e.currentTarget.offsetTop;
    var gridx = Math.round((x - (sqWidth / 2)) / sqWidth)
    var gridy = Math.round((y - (sqWidth / 2)) / sqWidth)
    
    console.log(x, sqWidth)
    ctx.fillStyle = "#01feaa";
    ctx.fillRect(Math.floor(x / sqWidth) * sqWidth, Math.floor(y / sqWidth) * sqWidth, sqWidth, sqWidth)
}

function main() {
    let canvas = createCanvasGrid({ // griddy
        cols       : sqCols,
        rows       : sqRows,
        width      : sqWidth * sqCols,
        height     : sqWidth * sqRows,
        weight     : 1,
        background : '#000001',
        color      : '#a8a8b8'
    });
    
    canvas.addEventListener("click", click);
}

function createCanvasGrid(options) {
    let opts = options

    canvas.width = opts.width;
    canvas.height = opts.height;

    let weight2 = opts.weight * 2;
    let weightHalf = opts.weight / 2;

    let availWidth =  opts.width - opts.weight;
    let availHeight = opts.height - opts.weight;

    let cellWidth = availWidth / opts.cols;
    let cellHeight = availHeight / opts.rows;

    if (options.background) {
        ctx.fillStyle = opts.background;
        ctx.fillRect(0, 0, opts.width, opts.height);
    }

    ctx.beginPath();
    ctx.strokeStyle = opts.color;
    ctx.lineWidth = opts.weight;

    for (let col = 0; col <= opts.cols; col++) {
        let newX = Math.floor(col * cellWidth) + weightHalf;
        ctx.moveTo(newX, 0);
        ctx.lineTo(newX, opts.height);
    }

    for (let row = 0; row <= opts.rows; row++) {
        let newY = (row * cellHeight) + weightHalf;
        ctx.moveTo(0, newY);
        ctx.lineTo(opts.width, newY);
    }

    ctx.stroke();

    return canvas;
};

main();