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
	target = createVector(width/2, 50);//middle of the window at the top
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

	}

	//drawing the target to hit
	ellipse(target.x, target.y, 16, 16);

}

//Rocket Object
function Rocket() {
	//constructors
	this.position = createVector(width/2, height);//starting at bottom of window
	this.velocity = createVector();// no velocity
	this.acceleration = createVector();//no acceleration
	this.dna = new DNA();//DNA property
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
	//genetic algo p2
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
			this.rockets[r].fitness /= maximumFitness;
			
		}
		//genetic algo p1.2
		//array for each generation of mates
		this.matingPool = [];
		//stores values that are desirable ie better fitness score for the mating pool
		for (var r = 0; r < this.populationSize; r++) {
			var n = this.rockets[r].fitness * 100;//getting the values between 0-100
			for (var s = 0; s < n; s++) {
				this.matingPool.add(this.rockets[r]);
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
}

//DNA Object
function DNA() {
	this.genes = [];
	for (var i = 0; i < rocketLifeSpan; i++) {
		this.genes[i] = p5.Vector.random2D();//random vector
		this.genes[i].setMag(.1);//speed
	}
}

