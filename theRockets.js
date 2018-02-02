var rocket;
var rocketLifeSpan = 200;
var numRockets = 100;
//population life
var lifeP;
//rocket count
var count = 0;
//the thing we want to hit
var target;

function setup() {
	createCanvas(400, 300);
	rocket = new Rocket();
	population = new Population();
	lifeP = createP();//paragraph ele
	target = createVector(width/2, 35);//middle of the window at the top
}

function draw() {
	background(0);
	rocket.update();
	rocket.show();
	population.run();
	//count of each generation
	lifeP.html(count);
	count++;

	if (count == rocketLifeSpan) {
		//make 
		population.eval();
		population.natSelection();
		count = 0;//reset val
	}

	//drawing the target to hit
	rect(target.x, target.y, 16, 16);

}

//Rocket Object
function Rocket(dna) {
	if (dna) {
		this.dna = dna;//existing dna
	} else {
		this.dna = new DNA();//new DNA property
	}
	//constructors
	this.position = createVector(width/2, height);//starting at bottom of window
	this.velocity = createVector();// no velocity
	this.acceleration = createVector();//no acceleration
	this.fitness = 0;//fitness score

	//adding force
	this.applyForce = function(force) {
		this.acceleration.add(force);
	}
	//applying physics
	this.update = function() {
		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);
		this.acceleration.mult(0);
		//apply vectors
		this.applyForce(this.dna.genes[count]);

	}

	this.show = function() {
		push();
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading());//angle adjustments
		rectMode(CENTER);
		rect(0, 0, 20, 5);//draw the rocket
		pop();
	}
	//genetic algo p1.2
	//fitness scoring
	this.getFitness = function() {
		//closer to target == better fitness
		var distance = dist(this.position.x, this.position.y, target.x, target.y);
		//1 == best fitness score possible i.e. we hit the target
		// this.fitness = (1 / distance);
		this.fitness = map(distance, 0, width, width, 0);//mapping the distance, inverted distance val
	}
}

//Population Object
function Population() {
	//array of rockets
	this.rockets = [];
	this.populationSize = numRockets;

	//making tons of rockets
	for (var r = 0; r < this.populationSize; r++) {
		this.rockets[r] = new Rocket();
	}
	//runs through all rockets, to calc fitness
	this.eval = function() {
		var maximumFitness = 0;//the max fitness score out of all elements
		//go through each rocket
		for (var r = 0; r < this.populationSize; r++) {
			this.rockets[r].getFitness();//gets each rocket fitness

			//set the max fitness if it is the max
			if (this.rockets[r].fitness > 0) {
				maximumFitness = this.rockets[r].fitness	
			}
			
		}
		//genetic algo p1.1
		//go through each rocket
		//for normalizing (to 1)
		for (var r = 0; r < this.populationSize; r++) {
			if (maximumFitness != 0) {
				this.rockets[r].fitness /= maximumFitness;
			}			
			
		}
		//genetic algo p2
		//array for each generation of mates
		this.matingPool = [];
		//stores values that are desirable ie better fitness score for the mating pool
		for (var r = 0; r < this.populationSize; r++) {
			if (this.rockets[r].fitness > 0) {
				var n = this.rockets[r].fitness * 100;//getting the values between 0-100
				//add values to the mating pool
				for (var s = 0; s < n; s++) {
					this.matingPool.push(this.rockets[r]);
				}				
			}			
			
		}
	}

	//run population
	this.run = function() {
		for (var r = 0; r < this.populationSize; r++) {
			this.rockets[r].update();
			this.rockets[r].show();
		}
	}

	//selecting function ie natural selection
	this.natSelection = function() {
		var babyRockets = [];
		for (var i = 0; i < this.rockets.length; i++) {
			var parentOne = random(this.matingPool).dna;//allowed via p5 library, picks random index for us given array
			var parentTwo = random(this.matingPool).dna;//does not account for the parents being the same**
			var child = parentOne.mating(parentTwo);//lets make a baby/child
			babyRockets[i] = new Rocket(child);//new rocket is born
		}
		this.rockets = babyRockets;//we have a new generation set
	}	
}

//DNA Object
function DNA(genes) {
	if (genes) {//if we receive existing genes, use that
		this.genes = genes;
	} else {
		//always generate random DNA
		this.genes = [];
		for (var i = 0; i < rocketLifeSpan; i++) {
			this.genes[i] = p5.Vector.random2D();//random vector
			this.genes[i].setMag(.1);//speed
		}
	}

	this.mating = function(mate) {
		var childDNA = [];
		//randomly select via p5 library
		//a point that is somewhere in the middle
		var midPoint = floor(random(this.genes.length));
		//create new / overwrite DNA with parents
		for (var i = 0; i < this.genes.length; i++) {
			if (i > midPoint) {
				childDNA[i] = this.genes[i];
			} else {
				childDNA[i] = mate.genes[i];
			}

		}
		return new DNA(childDNA);
	}
}

