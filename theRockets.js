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

	//drawing the target to hit
	ellipse(target.x, target.y, 16, 16);

}

//Rocket Object
function Rocket() {
	//constructors
	this.position = createVector(width/2, height);//starting at bottom of window
	this.velocity = createVector();// no velocity
	this.acceleration = createVector();//no acceleration
	this.dna = new DNA();

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

	//run population
	this.run = function() {
		for (var i = 0; i < this.populationSize; i++) {
			this.rockets[i].update();
			this.rockets[i].show();
		}
	}
}

//DNA Object
function DNA() {
	this.genes = [];
	for (var i = 0; i < rocketLifeSpan; i++) {
		this.genes[i] = p5.Vector.random2D();//random vector
		this.genes[i].setMag(.1);
	}
}