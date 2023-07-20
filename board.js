class Board {
	constructor(size) {
		this.size = size;

		this.boxes = [];
		for (let i = 0; i < size; i++) {
			this.boxes.push([]);
			for (let j = 0; j < size; j++) {
				this.boxes[i].push(new Box(i, j));

				if (i == 0) this.boxes[i][j].edges.left = STATUS_OPTIONS.BLACK;
				if (i == size - 1) this.boxes[i][j].edges.right = STATUS_OPTIONS.BLACK;
				if (j == 0) this.boxes[i][j].edges.top = STATUS_OPTIONS.BLACK;
				if (j == size - 1) this.boxes[i][j].edges.bottom = STATUS_OPTIONS.BLACK;
			}
		}
	}
	toDigit() {
		// TODO: condense repeated edges
		let digit = [];
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				digit.push(...this.boxes[i][j].toDigit());
			}
		}
		return digit;
	}
}