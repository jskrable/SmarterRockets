var rocket;
function setup() {
	createCanvas(400, 300);
	rocket = new Rocket();

}

function draw() {
	background(0);
	rocket.update();
	rocket.show();
}

//Rocket Object
function Rocket() {
	//constructors

	this.position = createVector(width/2, height);//starting at bottom of window
	this.velocity = createVector(0, -1);//going up
	this.acceleration = createVector();
	//adding force
	this.applyForce = function(force) {
		this.acceleration.add(force);
	}
	//applying physics
	this.update = function() {
		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);
		this.acceleration.mult(0);
	}

	this.show = function() {
		push();
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading());//angle adjustments
		rectMode(CENTER);
		rect(0, 0, 50, 5);
		pop();
	}
}

//Population Object
function Population() {
	//array of rockets
	this.rockets = [];
	this.populationSize = 10000;

	for (var = idx = 0; idx < this.populationSize; i++) {
		this.rockets[i] = new Rocket();
	}
}