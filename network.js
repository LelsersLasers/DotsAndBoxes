class Layer {
	constructor(
		numInputs,
        numOutputs
	) {
		this.numInputs = numInputs;
		this.numOutputs = numOutputs;

		this.weights = [];
        this.bias = [];

		this.activationFunction = (x) => 1 / (1 + Math.exp(-x));

		for (let i = 0; i < numOutputs; i++) {
            this.weights.push([]);
            for (let j = 0; j < numInputs; j++) {
                this.weights[i].push(Math.random() - 0.5);
            }
            this.bias.push(Math.random() - 0.5);
        }
	}
	forwardPass(inputs) {
        const outputs = [];
        for (let i = 0; i < this.numOutputs; i++) {
            let sum = this.bias[i];
            for (let j = 0; j < this.numInputs; j++) {
                sum += inputs[j] * this.weights[i][j];
            }
            outputs.push(this.activationFunction(sum));
        }
        return outputs;
    }
	randomCopy() {
		// random weights/bias but same structure
		const newLayer = new Layer(this.numInputs, this.numOutputs);
		return newLayer;
	}
}

class Network {
	constructor(hiddenLayerSizes, board, turn) {
		this.layers = [];
		this.turn = turn;

		let lastSize = board.numOfEdges();
		for (let i = 0; i < hiddenLayerSizes; i++) {
			this.layers.push(new Layer(lastSize, hiddenLayerSizes[i]));
			lastSize = hiddenLayerSizes[i];
		}
		this.layers.push(new Layer(lastSize, board.numOfEdges()));
	}
	static flipInputs(inputs) {
		// [-1, 0, 1] -> [1, 0, -1]
		return inputs.map((x) => -x);
	}
	randomCopy() {
		const newNetwork = new Network(this.hiddenLayerSizes, this.board, this.turn);
		return newNetwork;			
	}
	forwardPass(inputs) {
		let outputs = this.turn == STATUS_OPTIONS.RED ? inputs : Network.flipInputs(inputs);
		for (let i = 0; i < this.layers.length; i++) {
			outputs = this.layers[i].forwardPass(outputs);
		}
		return outputs;
	}
	forwardOneshot(inputs) {
		const outputs = this.forwardPass(inputs);
		const max = Math.max(...outputs);
		const index = outputs.indexOf(max);
		return index;
	}
	forwardValidOneshot(inputs, board) {
		const outputs = this.forwardPass(inputs);
		const digit = board.toDigit();

		let max = -Infinity;
		let index = -1;

		for (let i = 0; i < outputs.length; i++) {
			if (digit[i] == STATUS_OPTIONS.EMPTY && outputs[i] > max) {
				if (outputs[i] > max) {
					max = outputs[i];
					index = i;
				}
			}
		}

		return index;
	}
}