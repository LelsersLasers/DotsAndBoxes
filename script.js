const GRIDS_SIZE = 5;
const POP_SIZE = 25;
const GENERATIONS = 100;

const EDGE_OFFSET = 0.025;
const LINE_WIDTH_RATIO = 0.05;

const RED = "#BF616A";
const GREEN = "#A3BE8C";
const BLACK = "#000000";
const WHITE = "#D8DEE9";

const canvas = document.getElementsByTagName("canvas")[0];
canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const boxSize = canvas.width * (1 - EDGE_OFFSET * 2) / GRIDS_SIZE;

    let distances = [];
    let index = 0;

    for (let i = 0; i < GRIDS_SIZE; i++) {
        for (let j = 0; j < GRIDS_SIZE - 1; j++) {
            let x = canvas.width * EDGE_OFFSET + boxSize * i;
            let y = canvas.height * EDGE_OFFSET + boxSize * (j + 1);

            if (board.horizontalEdges[i][j] == STATUS_OPTIONS.EMPTY) {
                const centerX = x + boxSize / 2;
                const centerY = y;

                const difX = mouseX - centerX;
                const difY = mouseY - centerY;

                const dist = Math.sqrt(difX * difX + difY * difY);
                distances.push([index, dist]);
            }

            index++;
        }
    }

    // draw vertical edges
    for (let i = 0; i < GRIDS_SIZE - 1; i++) {
        for (let j = 0; j < GRIDS_SIZE; j++) {
            let x = canvas.width * EDGE_OFFSET + boxSize * (i + 1);
            let y = canvas.height * EDGE_OFFSET + boxSize * j;

            if (board.verticalEdges[i][j] == STATUS_OPTIONS.EMPTY) {
                const centerX = x;
                const centerY = y + boxSize / 2;

                const difX = mouseX - centerX;
                const difY = mouseY - centerY;

                const dist = Math.sqrt(difX * difX + difY * difY);
                distances.push([index, dist]);
            }

            index++;
        }
    }

    if (distances.length > 0) {
        const closedIndex = distances.reduce((a, b) => a[1] < b[1] ? a : b)[0];
        const oldDigit = board.toDigit();
		const oldCount = board.countAndSetCompletedBoxes(turn);

		oldDigit[closedIndex] = turn;
		board.fromDigit(oldDigit);
		
		const newCount = board.countAndSetCompletedBoxes(turn);
		const difCount = newCount - oldCount;
		
		if (difCount == 0) {
            if (turn == STATUS_OPTIONS.RED) {
                turn = STATUS_OPTIONS.GREEN;
            } else {
                turn = STATUS_OPTIONS.RED;
            }
        }
    }
    

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
let mutationRate = 0.4;
const population = new Population(POP_SIZE, network, board);
let bestNetwork = null;

const pairings = population.pairings();
let currentPairing = 0;
let generation = 0;


function render() {
    context.fillStyle = "#3B4252";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // simulate
    if (SPACE_DOWN || true) {
        if (generation < GENERATIONS) {
            for (let i = 0; i < 100; i++) {
                if (!board.hasMovesOpen()) {
                    population.networksAndFitness[pairings[currentPairing][0]].fitness += board.countColoredBoxes(STATUS_OPTIONS.RED);
                    population.networksAndFitness[pairings[currentPairing][1]].fitness += board.countColoredBoxes(STATUS_OPTIONS.GREEN);

                    currentPairing++;
                    // console.log(`${generation}\t${currentPairing}\t${pairings.length}`);
                    if (currentPairing >= pairings.length) {
                        const dif = population.bestFitnessScore().fitness - population.worstFitnessScore().fitness;
                        console.log(`${generation}\t${dif}`);
                        
                        bestNetwork = population.bestFitnessScore().network;

                        mutationRate *= 0.9;
                        population.nextPopulation(board, mutationRate);
                        
                        generation++;
                        currentPairing = 0;
                    }

                    board = new Board(GRIDS_SIZE);
                    turn = STATUS_OPTIONS.RED;

                    if (generation >= GENERATIONS) {
                        SPACE_DOWN = false;
                        bestNetwork.save();
                        break;
                    }
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
        } else {
            if (turn == STATUS_OPTIONS.GREEN) {
                bestNetwork.turn = STATUS_OPTIONS.GREEN;
                const index = bestNetwork.forwardValidOneshot(board.toDigit(), board);
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

            if (board.horizontalEdges[i][j] == STATUS_OPTIONS.RED) {
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
    for (let i = -1; i < GRIDS_SIZE; i++) {
        for (let j = -1; j < GRIDS_SIZE; j++) {
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

    window.requestAnimationFrame(render);
}


var t0 = performance.now();
var t1 = performance.now();
var delta = 1 / 60;

window.requestAnimationFrame(render);
