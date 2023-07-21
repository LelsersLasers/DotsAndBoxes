const STATUS_OPTIONS = {
	EMPTY: 0,
	RED: 1,
	GREEN: -1,
	BLACK: 2,
}

// class Box {
// 	constructor(x, y) {
// 		this.x = x;
// 		this.y = y;

// 		this.status = STATUS_OPTIONS.EMPTY;

// 		this.edges = {
// 			top: STATUS_OPTIONS.EMPTY,
// 			right: STATUS_OPTIONS.EMPTY,
// 			bottom: STATUS_OPTIONS.EMPTY,
// 			left: STATUS_OPTIONS.EMPTY,
// 		};
// 	}
// 	toDigit() {
// 		return [
// 			this.edges.top,
// 			this.edges.right,
// 			this.edges.bottom,
// 			this.edges.left,
// 		];
// 	}
// }