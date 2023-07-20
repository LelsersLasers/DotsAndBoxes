const GRIDS_SIZE = 10;
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

const context = canvas.getContext("2d");

const board = new Board(GRIDS_SIZE);
// console.log(board.toDigit());

function rbgToFillStyle(r, g, b) {
    return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
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

    // randomly move
    let notMoved = true;
    while (notMoved) {
        // console.log("a");
        const i = Math.floor(Math.random() * GRIDS_SIZE);
        const j = Math.floor(Math.random() * GRIDS_SIZE);

        const box = board.boxes[i][j];

        if (box.status == STATUS_OPTIONS.EMPTY) {
            const boxDigit = box.toDigit();
            if (boxDigit.includes(STATUS_OPTIONS.EMPTY)) {
                const edge = Math.floor(Math.random() * 4);
                if (boxDigit[edge] == STATUS_OPTIONS.EMPTY) {
                    box.edges[Object.keys(box.edges)[edge]] = turn;
                    notMoved = false;
                }
            }
        }
    }

    // switch turn
    if (turn == STATUS_OPTIONS.RED) {
        turn = STATUS_OPTIONS.GREEN;
    } else {
        turn = STATUS_OPTIONS.RED;
    }


    for (let i = 0; i < GRIDS_SIZE; i++) {
        for (let j = 0; j < GRIDS_SIZE; j++) {
            const box = board.boxes[i][j];

            const x = canvas.width * EDGE_OFFSET + boxSize * i;
            const y = canvas.height * EDGE_OFFSET + boxSize * j;

            if (box.status == STATUS_OPTIONS.RED) {
                context.fillStyle = RED;
                context.fillRect(x, y, boxSize, boxSize);
            } else if (box.status == STATUS_OPTIONS.GREEN) {
                context.fillStyle = GREEN;
                context.fillRect(x, y, boxSize, boxSize);
            }
        }
    }

    for (let i = 0; i < GRIDS_SIZE; i++) {
        for (let j = 0; j < GRIDS_SIZE; j++) {
            const box = board.boxes[i][j];

            const x = canvas.width * EDGE_OFFSET + boxSize * i;
            const y = canvas.height * EDGE_OFFSET + boxSize * j;

            for (edge in box.edges) {
                if (box.edges[edge] == STATUS_OPTIONS.EMPTY) {
                    context.fillStyle = WHITE;
                } else if (box.edges[edge] == STATUS_OPTIONS.RED) {
                    context.fillStyle = RED;
                } else if (box.edges[edge] == STATUS_OPTIONS.GREEN) {
                    context.fillStyle = GREEN;
                } else if (box.edges[edge] == STATUS_OPTIONS.BLACK) {
                    context.fillStyle = BLACK;
                }

                if (edge == "top") {
                    context.fillRect(x - lineSize / 2, y - lineSize / 2, boxSize + lineSize, lineSize);
                } else if (edge == "right") {
                    context.fillRect(x + boxSize - lineSize / 2, y - lineSize / 2, lineSize, boxSize + lineSize);
                } else if (edge == "bottom") {
                    context.fillRect(x - lineSize / 2, y + boxSize - lineSize / 2, boxSize + lineSize, lineSize);
                } else if (edge == "left") {
                    context.fillRect(x - lineSize / 2, y - lineSize / 2, lineSize, boxSize + lineSize);
                }
            }
        }
    }


    t1 = performance.now();
    delta = t1 - t0;
    t0 = performance.now()
    
    console.log(delta, 1000 / delta);

    // document.getElementById("fpsText").innerHTML =
    //     "FPS: " + Math.round(1000 / delta);

    window.requestAnimationFrame(render);
}


var t0 = performance.now();
var t1 = performance.now();
var delta = 1 / 60;

window.requestAnimationFrame(render);
