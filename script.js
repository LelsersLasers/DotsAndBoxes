const GRIDS_SIZE = 8;
const EDGE_OFFSET = 0.025;
const LINE_WIDTH_RATIO = 0.05;

const RED = "#BF616A";
const GREEN = "#A3BE8C";
const BLACK = "#000000";
const WHITE = "#D8DEE9";

const canvas = document.getElementsByTagName("canvas")[0];
canvas.addEventListener("click", function (event) {
    // const rect = canvas.getBoundingClientRect();

    // const x = event.clientX - rect.left;
    // const y = event.clientY - rect.top;

    // const inputs = [x / canvas.width, y / canvas.height];
    // const outputs = selectedColor;

    // dataPoints.push(new DataPoint(inputs, outputs));
});

document.addEventListener("keydown", keyDownHandle, false);
document.addEventListener("keyup", keyUpHandle, false);

let SPACE_DOWN = false;
function keyDownHandle(event) {
    if (event.key.toLowerCase() == " ") {
        SPACE_DOWN = true;
    }
}
function keyUpHandle(event) {
    if (event.key.toLowerCase() == " ") {
        SPACE_DOWN = false;
    }
}

const context = canvas.getContext("2d");

const board = new Board(GRIDS_SIZE);

function rbgToFillStyle(r, g, b) {
    return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
}

function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

function resize() {
    if (canvas) {
        const maxWidth = (window.innerWidth - 34) * (2 / 3);
        const maxHeight = window.innerHeight - 34;

        const width = Math.min(maxWidth, maxHeight);
        const height = Math.min(maxHeight, maxWidth);

        canvas.width = width;
        canvas.height = height;
    }
}


let turn = STATUS_OPTIONS.RED;
function render() {
    context.fillStyle = "#3B4252";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const boxSize = canvas.width * (1 - EDGE_OFFSET * 2) / GRIDS_SIZE;
    const lineSize = boxSize * LINE_WIDTH_RATIO;


    // draw boxes
    for (let i = 0; i < GRIDS_SIZE; i++) {
        for (let j = 0; j < GRIDS_SIZE; j++) {
            const box = board.boxes[i][j];

            const x = canvas.width * EDGE_OFFSET + boxSize * i;
            const y = canvas.height * EDGE_OFFSET + boxSize * j;

            if (box == STATUS_OPTIONS.RED) {
                context.fillStyle = hexToRGB(RED, 0.5);
                context.fillRect(x, y, boxSize, boxSize);
            } else if (box == STATUS_OPTIONS.GREEN) {
                context.fillStyle = hexToRGB(GREEN, 0.5);
                context.fillRect(x, y, boxSize, boxSize);
            }
        }
    }

    // draw horizontal edges
    for (let i = 0; i < GRIDS_SIZE; i++) {
        for (let j = 0; j < GRIDS_SIZE - 1; j++) {
            let x = canvas.width * EDGE_OFFSET + boxSize * i;
            let y = canvas.height * EDGE_OFFSET + boxSize * (j + 1);

            let xRect = x;
            let yRect = y - lineSize / 2;

            if (board.horizontalEdges[i][j] == STATUS_OPTIONS.EMPTY) {
                context.fillStyle = WHITE;
                context.fillRect(xRect, yRect, boxSize, lineSize);
            } else if (board.horizontalEdges[i][j] == STATUS_OPTIONS.RED) {
                context.fillStyle = RED;
                context.fillRect(xRect, yRect, boxSize, lineSize);
            } else if (board.horizontalEdges[i][j] == STATUS_OPTIONS.GREEN) {
                context.fillStyle = GREEN;
                context.fillRect(xRect, yRect, boxSize, lineSize);
            }
        }
    }

    // draw vertical edges
    for (let i = 0; i < GRIDS_SIZE - 1; i++) {
        for (let j = 0; j < GRIDS_SIZE; j++) {
            let x = canvas.width * EDGE_OFFSET + boxSize * (i + 1);
            let y = canvas.height * EDGE_OFFSET + boxSize * j;

            let xRect = x - lineSize / 2;
            let yRect = y;

            if (board.verticalEdges[i][j] == STATUS_OPTIONS.EMPTY) {
                context.fillStyle = WHITE;
                context.fillRect(xRect, yRect, lineSize, boxSize);
            } else if (board.verticalEdges[i][j] == STATUS_OPTIONS.RED) {
                context.fillStyle = RED;
                context.fillRect(xRect, yRect, lineSize, boxSize);
            } else if (board.verticalEdges[i][j] == STATUS_OPTIONS.GREEN) {
                context.fillStyle = GREEN;
                context.fillRect(xRect, yRect, lineSize, boxSize);
            }
        }
    }

    // outer edges
    for (let i = 0; i < GRIDS_SIZE; i++) {
        let x = canvas.width * EDGE_OFFSET + boxSize * i;
        let y = canvas.height * EDGE_OFFSET;

        let xRect = x - lineSize / 2;
        let yRect = y - lineSize / 2;

        let hRect = lineSize;
        let wRect = boxSize + lineSize;

        context.fillStyle = BLACK;
        context.fillRect(xRect, yRect, wRect, hRect);
        context.fillRect(yRect, xRect, hRect, wRect);
        context.fillRect(xRect, canvas.height - yRect - hRect, wRect, hRect);
        context.fillRect(canvas.width - yRect - hRect, xRect, hRect, wRect);
    }

    // randomly move

    if (SPACE_DOWN) {
        let notMoved = true;
        let boxFinished = false;

        let moveX = -1;
        let moveY = -1;
        while (notMoved && board.hasMovesOpen()) {
            // console.log("a");
            moveX = Math.floor(Math.random() * GRIDS_SIZE);
            moveY = Math.floor(Math.random() * GRIDS_SIZE);

            if (Math.random() < 0.5) {
                // horizontal
                [notMoved, boxFinished] = board.placeHorizontalEdge(moveX, moveY, turn);
            } else {
                // vertical
                [notMoved, boxFinished] = board.placeVerticalEdge(moveX, moveY, turn);
            }
        }

        // switch turn
        if (!boxFinished) {
            if (turn == STATUS_OPTIONS.RED) {
                turn = STATUS_OPTIONS.GREEN;
            } else {
                turn = STATUS_OPTIONS.RED;
            }
        }
        // SPACE_DOWN = false;
    }

            

    // // randomly move
    // let notMoved = true;
    // while (notMoved) {
    //     // console.log("a");
    //     const i = Math.floor(Math.random() * GRIDS_SIZE);
    //     const j = Math.floor(Math.random() * GRIDS_SIZE);

    //     const box = board.boxes[i][j];

    //     if (box.status == STATUS_OPTIONS.EMPTY) {
    //         const boxDigit = box.toDigit();
    //         if (boxDigit.includes(STATUS_OPTIONS.EMPTY)) {
    //             const edge = Math.floor(Math.random() * 4);
    //             if (boxDigit[edge] == STATUS_OPTIONS.EMPTY) {
    //                 box.edges[Object.keys(box.edges)[edge]] = turn;
    //                 notMoved = false;

    //                 // check if box is completed
    //                 let completed = box.toDigit().every(edge => edge != STATUS_OPTIONS.EMPTY);
    //                 if (completed) {
    //                     box.status = turn;
    //                 } else {
    //                     if (turn == STATUS_OPTIONS.RED) {
    //                         turn = STATUS_OPTIONS.GREEN;
    //                     } else {
    //                         turn = STATUS_OPTIONS.RED;
    //                     }
    //                 }

    //             }
    //         }
    //     }
    // }


    // for (let i = 0; i < GRIDS_SIZE; i++) {
    //     for (let j = 0; j < GRIDS_SIZE; j++) {
    //         const box = board.boxes[i][j];

    //         const x = canvas.width * EDGE_OFFSET + boxSize * i;
    //         const y = canvas.height * EDGE_OFFSET + boxSize * j;

    //         if (box.status == STATUS_OPTIONS.RED) {
    //             context.fillStyle = RED;
    //             context.fillRect(x, y, boxSize, boxSize);
    //         } else if (box.status == STATUS_OPTIONS.GREEN) {
    //             context.fillStyle = GREEN;
    //             context.fillRect(x, y, boxSize, boxSize);
    //         }
    //     }
    // }

    // for (let i = 0; i < GRIDS_SIZE; i++) {
    //     for (let j = 0; j < GRIDS_SIZE; j++) {
    //         const box = board.boxes[i][j];

    //         const x = canvas.width * EDGE_OFFSET + boxSize * i;
    //         const y = canvas.height * EDGE_OFFSET + boxSize * j;

    //         for (edge in box.edges) {
    //             if (box.edges[edge] == STATUS_OPTIONS.EMPTY) {
    //                 context.fillStyle = WHITE;
    //             } else if (box.edges[edge] == STATUS_OPTIONS.RED) {
    //                 context.fillStyle = RED;
    //             } else if (box.edges[edge] == STATUS_OPTIONS.GREEN) {
    //                 context.fillStyle = GREEN;
    //             } else if (box.edges[edge] == STATUS_OPTIONS.BLACK) {
    //                 context.fillStyle = BLACK;
    //             }

    //             if (edge == "top") {
    //                 context.fillRect(x - lineSize / 2, y - lineSize / 2, boxSize + lineSize, lineSize);
    //             } else if (edge == "right") {
    //                 context.fillRect(x + boxSize - lineSize / 2, y - lineSize / 2, lineSize, boxSize + lineSize);
    //             } else if (edge == "bottom") {
    //                 context.fillRect(x - lineSize / 2, y + boxSize - lineSize / 2, boxSize + lineSize, lineSize);
    //             } else if (edge == "left") {
    //                 context.fillRect(x - lineSize / 2, y - lineSize / 2, lineSize, boxSize + lineSize);
    //             }
    //         }
    //     }
    // }


    t1 = performance.now();
    delta = t1 - t0;
    t0 = performance.now()
    
    // console.log(delta, 1000 / delta);

    // document.getElementById("fpsText").innerHTML =
    //     "FPS: " + Math.round(1000 / delta);

    window.requestAnimationFrame(render);
}


var t0 = performance.now();
var t1 = performance.now();
var delta = 1 / 60;

window.requestAnimationFrame(render);
