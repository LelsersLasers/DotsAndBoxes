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
	constructor(numNetworks, baseNetwork, mutationRate) {
		this.numNetworks = numNetworks;
		this.mutationRate = mutationRate;

		this.networksAndFitness = [];
		for (let i = 0; i < numNetworks; i++) {
			this.networksAndFitness.push(new FitnessScore(baseNetwork.randomCopy(), 0));
		}
	}
	nextPopulation() {
		const newPopulation = [];
		// -2 because keep best + 1 for random
		for (let i = 0; i < this.numNetworks - 2; i++) {
			const parent1 = weighted_random(this.networksAndFitness);
			const parent2 = weighted_random(this.networksAndFitness);
			newPopulation.push(new FitnessScore(parent1.network.crossover(parent2.network, this.mutationRate), 0));
		}

		const bestNetworkAndFitness = this.networksAndFitness.reduce((a, b) => a.fitness > b.fitness ? a : b);
		newPopulation.push(new FitnessScore(bestNetworkAndFitness.network, 0));
		newPopulation.push(new FitnessScore(bestNetworkAndFitness.network.randomCopy(), 0));
			
		this.networksAndFitness = newPopulation;
	}
}