class Board {
	constructor(size) {
		this.size = size;

		// this.boxes = [];
		// for (let i = 0; i < size; i++) {
		// 	this.boxes.push([]);
		// 	for (let j = 0; j < size; j++) {
		// 		this.boxes[i].push(new Box(i, j));

		// 		if (i == 0) this.boxes[i][j].edges.left = STATUS_OPTIONS.BLACK;
		// 		if (i == size - 1) this.boxes[i][j].edges.right = STATUS_OPTIONS.BLACK;
		// 		if (j == 0) this.boxes[i][j].edges.top = STATUS_OPTIONS.BLACK;
		// 		if (j == size - 1) this.boxes[i][j].edges.bottom = STATUS_OPTIONS.BLACK;
		// 	}
		// }

		this.horizontalEdges = [];
		for (let i = 0; i < size; i++) {
			this.horizontalEdges.push([]);
			for (let j = 0; j < size - 1; j++) {
				this.horizontalEdges[i].push(STATUS_OPTIONS.EMPTY);
			}
		}

		this.verticalEdges = [];
		for (let i = 0; i < size - 1; i++) {
			this.verticalEdges.push([]);
			for (let j = 0; j < size; j++) {
				this.verticalEdges[i].push(STATUS_OPTIONS.EMPTY);
			}
		}

		this.boxes = [];
		for (let i = 0; i < size; i++) {
			this.boxes.push([]);
			for (let j = 0; j < size; j++) {
				this.boxes[i].push(STATUS_OPTIONS.EMPTY);
			}
		}
	}
	placeIndex(index, status) {
		const oldDigit = this.toDigit();
		const oldCount = this.countAndSetCompletedBoxes(status);

		oldDigit[index] = status;
		this.fromDigit(oldDigit);
		
		const newCount = this.countAndSetCompletedBoxes(status);
		const difCount = newCount - oldCount;
		
		return difCount > 0;
	}
	placeHorizontalEdge(x, y, status) {
		if (y == 0) return [true, false];
		if (this.horizontalEdges[x][y - 1] != STATUS_OPTIONS.EMPTY) return [true, false];

		const startCount = this.countAndSetCompletedBoxes(status);
		this.horizontalEdges[x][y - 1] = status;
		const endCount = this.countAndSetCompletedBoxes(status);
		const difCount = endCount - startCount;

		return [false, difCount > 0];

	}
	placeVerticalEdge(x, y, status) {
		if (x == 0) return [true, false];
		if (this.verticalEdges[x - 1][y] != STATUS_OPTIONS.EMPTY) return [true, false];

		const startCount = this.countAndSetCompletedBoxes(status);
		this.verticalEdges[x - 1][y] = status;
		const endCount = this.countAndSetCompletedBoxes(status);
		const difCount = endCount - startCount;

		return [false, difCount > 0];
	}
	countColoredBoxes(color) {
		let count = 0;
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				let edges = {
					top: false,
					right: false,
					bottom: false,
					left: false
				}
				edges.left = i == 0 || this.verticalEdges[i - 1][j] != STATUS_OPTIONS.EMPTY;
				edges.right = i == this.size - 1 || this.verticalEdges[i][j] != STATUS_OPTIONS.EMPTY;
				edges.top = j == 0 || this.horizontalEdges[i][j - 1] != STATUS_OPTIONS.EMPTY;
				edges.bottom = j == this.size - 1 || this.horizontalEdges[i][j] != STATUS_OPTIONS.EMPTY;

				if (edges.top && edges.right && edges.bottom && edges.left) {
					if (this.boxes[i][j] == color) {
						count++;
					}
				}
			}
		}
		return count;
	}
	countAndSetCompletedBoxes(turn = STATUS_OPTIONS.EMPTY) {
		let count = 0;

		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				let edges = {
					top: false,
					right: false,
					bottom: false,
					left: false
				}
				edges.left = i == 0 || this.verticalEdges[i - 1][j] != STATUS_OPTIONS.EMPTY;
				edges.right = i == this.size - 1 || this.verticalEdges[i][j] != STATUS_OPTIONS.EMPTY;
				edges.top = j == 0 || this.horizontalEdges[i][j - 1] != STATUS_OPTIONS.EMPTY;
				edges.bottom = j == this.size - 1 || this.horizontalEdges[i][j] != STATUS_OPTIONS.EMPTY;

				if (edges.top && edges.right && edges.bottom && edges.left) {
					count++;
					if (this.boxes[i][j] == STATUS_OPTIONS.EMPTY) {
						this.boxes[i][j] = turn;
					}
				}
			}
		}

		return count;
	}

	hasMovesOpen() {
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size - 1; j++) {
				if (this.horizontalEdges[i][j] == STATUS_OPTIONS.EMPTY) return true;
			}
		}
		for (let i = 0; i < this.size - 1; i++) {
			for (let j = 0; j < this.size; j++) {
				if (this.verticalEdges[i][j] == STATUS_OPTIONS.EMPTY) return true;
			}
		}
		return false;
	}
	

	toDigit() {
		const digit = [];
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size - 1; j++) {
				digit.push(this.horizontalEdges[i][j]);
			}
		}
		for (let i = 0; i < this.size - 1; i++) {
			for (let j = 0; j < this.size; j++) {
				digit.push(this.verticalEdges[i][j]);
			}
		}
		return digit;
	}
	fromDigit(digit) {
		let index = 0;
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size - 1; j++) {
				this.horizontalEdges[i][j] = digit[index++];
			}
		}
		for (let i = 0; i < this.size - 1; i++) {
			for (let j = 0; j < this.size; j++) {
				this.verticalEdges[i][j] = digit[index++];
			}
		}
	}

	numOfEdges() {
		return this.size * (this.size - 1) * 2;
	}
}