// this worker uses bresenham's line algorithm to concurrently smooth the browser's terrible mousemove polling rate
onmessage = (e) => {
    let outputset = new Set();
    
    let mousex = e.data[0];
    let mousey = e.data[1];
    let lastmousex = e.data[2];
    let lastmousey = e.data[3];
    
    let xdiff = mousex - lastmousex;
    let ydiff = mousey - lastmousey;
    let xsign = Math.sign(xdiff);
    let ysign = Math.sign(ydiff);
    xdiff = Math.abs(xdiff);
    ydiff = Math.abs(ydiff);
    let err = xdiff - ydiff;
    let x0 = lastmousex;
    let y0 = lastmousey;
    
    while (true) {
        outputset.add([x0, y0]);
        
        if ((x0 === mousex) && (y0 === mousey)) {
            break;
        }
        
        let e2 = err << 1;
        if (e2 > -ydiff) {
            err -= ydiff;
            x0 += xsign;
        }
        if (e2 < xdiff) {
            err += xdiff;
            y0 += ysign;
        }
    }
    
    postMessage(outputset);
}