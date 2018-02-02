var rocket;
var rocketLifeSpan = 100;//number of frames
var numRockets = 1000;
var inherentSpeed = 0.1;
var rocketAcceleration = 1;
//population life
var lifeP;
//rocket count
var count = 0;
//the thing we want to hit
var target;
//genearation counter
var generationCnt = 0;
//obstacle dimensions
var obstacleX,obstacleY,obstacleW,obstacleH;
obstacleX = 100;obstacleY = 150;obstacleW = 200;obstacleH = 10;

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
	lifeP.html(count);//displays each rocket count
	count++;

	if (count == rocketLifeSpan) {
		//make 
		population.eval();
		population.natSelection();
		count = 0;//reset val

	}
	//obstacle creation
	rect(obstacleX, obstacleY, obstacleW, obstacleH);
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

	//explosion detector!
	this.touching = false;
	//collision detector
	this.collision = false;

	//adding force
	this.applyForce = function(force) {
		this.acceleration.add(force);
	}
	//applying physics
	this.update = function() {
		var location = dist(this.position.x, this.position.y, target.x, target.y);
		//stop the rocket if we hit the target
		if (location < 16) {//within the box range
			this.touching = true;
			this.position = target.copy();//setting the rocket at the target
		}

		//apply vectors
		this.applyForce(this.dna.genes[count]);	
		//check if we hit target
		if (!this.touching && !this.collision) {//if not, apply movement
			this.velocity.add(this.acceleration);
			this.position.add(this.velocity);
			this.acceleration.mult(rocketAcceleration);
		}
		//just rewarding the fit rockets
		if (this.touching) {
			this.fitness *= 50000;//boost fitness scores
		}
		if (this.collision) {
			this.fitness /= 10;
		}

		//hitting obstacle is bad aka crashing
		if (this.position.x > obstacleX && this.position.x < obstacleX + obstacleW/**width of obstacle**/
			&& this.position.y > obstacleY && this.position.y < obstacleY + obstacleH/**height of obstacle**/
			) {
			this.collision = true;
		}
		//window collision detection
		if ((this.position.x > width || this.position.x < 0) ||/**width**/
			(this.position.y > height || this.position.y < 0)) {/**height**/
			this.collision = true;
		}

	}

	this.show = function() {
		push();
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading());//angle adjustments
		rectMode(CENTER);
		rect(5, 5, 5, 5);//draw the rocket
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

		//TODO add in time it takes to get to target
	}
}

//Population Object
function Population() {
	//array of rockets
	this.rockets = [];
	this.populationSize = numRockets;
	//array for each generation of mates
	this.matingPool = [];
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
	generationCnt++;
	console.log(generationCnt);
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
			child.mutation();//adds in variability
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
			this.genes[i].setMag(inherentSpeed);//speed
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
	//allows for some variability rather than just the first generation genes
	this.mutation = function() {
		for (var i = 0; i < this.genes.length; i++) {
			if (random(1) < 0.01) {//random number with mutation rate of 1%
				this.genes[i] = p5.Vector.random2D();//becomes new Random vector
				this.genes[i].setMag(0.1); //length of vector
			}
			
		}
	}
}

