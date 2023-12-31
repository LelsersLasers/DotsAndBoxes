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

		this.hiddenLayerSizes = hiddenLayerSizes;

		let lastSize = board.numOfEdges();
		for (let i = 0; i < hiddenLayerSizes.length; i++) {
			this.layers.push(new Layer(lastSize, hiddenLayerSizes[i]));
			lastSize = hiddenLayerSizes[i];
		}
		this.layers.push(new Layer(lastSize, board.numOfEdges()));
	}
	static flipInputs(inputs) {
		// [-1, 0, 1] -> [1, 0, -1]
		return inputs.map((x) => -x);
	}
	randomCopy(board) {
		const newNetwork = new Network(this.hiddenLayerSizes, board, this.turn);
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
	crossover(other, mutationRate, board) {
		const newNetwork = this.randomCopy(board)
		for (let i = 0; i < this.layers.length; i++) {
			for (let j = 0; j < this.layers[i].numOutputs; j++) {
				for (let k = 0; k < this.layers[i].numInputs; k++) {
					if (Math.random() < 0.5 - mutationRate / 2) {
						newNetwork.layers[i].weights[j][k] = this.layers[i].weights[j][k];
					} else if (Math.random() > 0.5 + mutationRate / 2) {
						newNetwork.layers[i].weights[j][k] = other.layers[i].weights[j][k];
					} else {
						newNetwork.layers[i].weights[j][k] = Math.random() - 0.5;
					}
				}

				if (Math.random() < 0.5 - mutationRate / 2) {
					newNetwork.layers[i].bias[j] = this.layers[i].bias[j];
				} else if (Math.random() > 0.5 + mutationRate / 2) {
					newNetwork.layers[i].bias[j] = other.layers[i].bias[j];
				} else {
					newNetwork.layers[i].bias[j] = Math.random() - 0.5;
				}
			}
		}
		return newNetwork;
	}
	mutate(mutationRate, board) {
		const newNetwork = this.randomCopy(board);
		for (let i = 0; i < this.layers.length; i++) {
			for (let j = 0; j < this.layers[i].numOutputs; j++) {
				for (let k = 0; k < this.layers[i].numInputs; k++) {
					if (Math.random() < mutationRate) {
						newNetwork.layers[i].weights[j][k] = Math.random() - 0.5;
					}
				}

				if (Math.random() < mutationRate) {
					newNetwork.layers[i].bias[j] = Math.random() - 0.5;
				}
			}
		}
		return newNetwork;
	}

	save() {
		// write to localstorage
		localStorage.setItem("network", JSON.stringify(this));
	}
	static load(board) {
		const obj = JSON.parse(localStorage.getItem("network"));
		const newNetwork = new Network(obj.hiddenLayerSizes, board, obj.turn);
		newNetwork.layers = obj.layers.map((l) => {
			const newLayer = new Layer(l.numInputs, l.numOutputs);
			newLayer.weights = l.weights;
			newLayer.bias = l.bias;
			return newLayer;
		});
	}
}