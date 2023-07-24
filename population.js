function weighted_random(options) {
    let i;

    let weights = [options[0].fitness];

    for (i = 1; i < options.length; i++)
        weights[i] = options[i].fitness + weights[i - 1];
    
    let random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return options[i];
}

class FitnessScore {
	constructor(network, fitness) {
		this.network = network;
		this.fitness = fitness;
	}
}

class Population {
	constructor(numNetworks, baseNetwork, board) {
		this.numNetworks = numNetworks;

		this.networksAndFitness = [];
		for (let i = 0; i < numNetworks; i++) {
			this.networksAndFitness.push(new FitnessScore(baseNetwork.randomCopy(board), 0));
		}
		this.oldNetworksAndFitness = this.networksAndFitness.slice();
	}
	nextPopulation(board, mutationRate) {
		this.oldNetworksAndFitness = this.networksAndFitness.slice();

		const newPopulation = [];
		for (let i = 0; i < this.numNetworks / 2 - 1; i++) {
			const parent1 = weighted_random(this.networksAndFitness);
			const parent2 = weighted_random(this.networksAndFitness);
			newPopulation.push(new FitnessScore(parent1.network.crossover(parent2.network, mutationRate, board), 0));
		}

		for (let i = 0; i < this.numNetworks / 2 - 1; i++) {
			const net = weighted_random(this.networksAndFitness);
			newPopulation.push(new FitnessScore(net.network.mutate(mutationRate, board), 0));
		}

		const bestNetworkAndFitness = this.bestFitnessScore();
		newPopulation.push(new FitnessScore(bestNetworkAndFitness.network, 0));
		newPopulation.push(new FitnessScore(bestNetworkAndFitness.network.randomCopy(board), 0));
			
		this.networksAndFitness = newPopulation;
	}
	bestFitnessScore() {
		return this.networksAndFitness.reduce((a, b) => a.fitness > b.fitness ? a : b);
	}
	worstFitnessScore() {
		return this.networksAndFitness.reduce((a, b) => a.fitness < b.fitness ? a : b);
	}
	pairings() {
		// every possible combination of 2 fitness scores
		const pairings = [];
		for (let i = 0; i < this.networksAndFitness.length; i++) {
			for (let j = 0; j < this.networksAndFitness.length; j++) {
				if (i == j) continue;
				pairings.push([i, j]);
			}
		}
		return pairings;
	}
}