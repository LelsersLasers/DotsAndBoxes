const GRIDS_SIZE = 8;
const POP_SIZE = 10;

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
let board = new Board(GRIDS_SIZE);

const network = new Network([], board, turn);
let mutationRate = 0.2;
const population = new Population(POP_SIZE, network, board);

const pairings = population.pairings();
let currentPairing = 0;
let generation = 0;

let going = true;

function render() {
    context.fillStyle = "#3B4252";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // simulate
    for (let i = 0; i < 120; i++) {
        if (!board.hasMovesOpen()) {
            population.networksAndFitness[pairings[currentPairing][0]].fitness += board.countColoredBoxes(STATUS_OPTIONS.RED);
            population.networksAndFitness[pairings[currentPairing][1]].fitness += board.countColoredBoxes(STATUS_OPTIONS.GREEN);


            currentPairing++;
            // console.log(`${generation}\t${currentPairing}\t${pairings.length}`);
            if (currentPairing >= pairings.length) {
                const dif = population.bestFitnessScore().fitness - population.worstFitnessScore().fitness;
                console.log(`${generation}\t${dif}`);
                
                if (generation > 20) {
                    going = false;
                    break;
                } else {
                    mutationRate *= 0.9;
                    population.nextPopulation(board, mutationRate);
                    
                    generation++;
                    currentPairing = 0;
                }
            }

            board = new Board(GRIDS_SIZE);
            turn = STATUS_OPTIONS.RED;
        } else {
            population.networksAndFitness[pairings[currentPairing][0]].network.turn = STATUS_OPTIONS.RED;
            population.networksAndFitness[pairings[currentPairing][1]].network.turn = STATUS_OPTIONS.GREEN;

            if (turn == STATUS_OPTIONS.RED) {
                const index = population.networksAndFitness[pairings[currentPairing][0]].network.forwardValidOneshot(board.toDigit(), board);
                let boxFinished = board.placeIndex(index, turn);

                // switch turn
                if (!boxFinished) {
                    turn = STATUS_OPTIONS.GREEN;
                }
            } else {
                const index = population.networksAndFitness[pairings[currentPairing][1]].network.forwardValidOneshot(board.toDigit(), board);
                let boxFinished = board.placeIndex(index, turn);

                // switch turn
                if (!boxFinished) {
                    turn = STATUS_OPTIONS.RED;
                }
            }
        }
    }

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

            // the dots
            if (board.horizontalEdges[i][j] == STATUS_OPTIONS.EMPTY && i != GRIDS_SIZE - 1) {
                context.fillStyle = WHITE;
                context.beginPath();
                context.arc(x + boxSize, y, lineSize, 0, 2 * Math.PI);
                context.fill();
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

            if (board.verticalEdges[i][j] == STATUS_OPTIONS.RED) {
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
    
    // the dots
    for (let i = 0; i < GRIDS_SIZE - 1; i++) {
        for (let j = 0; j < GRIDS_SIZE - 1; j++) {
            let x = canvas.width * EDGE_OFFSET + boxSize * i;
            let y = canvas.height * EDGE_OFFSET + boxSize * (j + 1);

            context.fillStyle = WHITE;
            context.beginPath();
            context.arc(x + boxSize, y, lineSize, 0, 2 * Math.PI);
            context.fill();
        }
    }

    // randomly move
    // if (SPACE_DOWN) {
    //     if (board.hasMovesOpen()) {
    //         const index = network.forwardValidOneshot(board.toDigit(), board);
    //         let boxFinished = board.placeIndex(index, turn);

    //         // switch turn
    //         if (!boxFinished) {
    //             if (turn == STATUS_OPTIONS.RED) {
    //                 turn = STATUS_OPTIONS.GREEN;
    //             } else {
    //                 turn = STATUS_OPTIONS.RED;
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

    if (going) window.requestAnimationFrame(render);
    else console.log(population);
}


var t0 = performance.now();
var t1 = performance.now();
var delta = 1 / 60;

window.requestAnimationFrame(render);
