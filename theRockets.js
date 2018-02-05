var rocket;
var rocketLifeSpan = 200;//number of frames
var numRockets = 100;
var inherentSpeed = 0.8;
var rocketAcceleration = 0;
//population life
var lifePopDisp;
//rocket count
var count = 0;
//the thing we want to hit
var target;
//genearation counter
var generationCnt = 0;
var generationDisp;
//obstacle dimensions
var obstacleX,obstacleY,obstacleW,obstacleH;
obstacleX = (100);obstacleY = 150;obstacleW = 200;obstacleH = 10;

// function startTime() {
// 	sysStartTime = new Date();
// 	return (sysStartTime);
// }

// function endTime() {
// 	sysEndTime = new Date();
// 	return (sysEndTime);
// }

// function elapsedTime(start, end) {
// 	var sysElapsedTime;
// 	sysElapsedTime = start - end;
// 	return (sysElapsedTime);
// }


function setup() {
	createCanvas(400, 300);
	rocket = new Rocket();
	population = new Population();
	lifePopDisp = createP();//paragraph ele
	target = createVector(width/2, 35);//middle of the window at the top
	generationDisp = createP();
}

function draw() {
	background(0);
	rocket.update();
	rocket.show();
	population.run();
	generationDisp.html("generation number: " + generationCnt);
	//count of each generation
	lifePopDisp.html(count);//displays each rocket count
	
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
	this.obstacle = false;
	this.border = false;

	//time to target/aka overall velocity
	this.elapsedTime = 0;

	//adding force
	this.applyForce = function(force) {
		this.acceleration.add(force);
	}
	//applying physics
	this.update = function() {
		sysStartTime = new Date();
		var location = dist(this.position.x, this.position.y, target.x, target.y);
		//stop the rocket if we hit the target
		if (location < 5) {//within the box range
			this.touching = true;
			this.position = target.copy();//setting the rocket at the target
			sysEndTime = new Date();
			this.elapsedTime = sysEndTime - sysStartTime;
			// console.log(elapsedTime);
		}

		//apply vectors
		this.applyForce(this.dna.genes[count]);	
		//check if we hit target
		if (!this.touching && !this.collision) {//if not, apply movement
			this.velocity.add(this.acceleration);
			this.position.add(this.velocity);
			this.acceleration.mult(rocketAcceleration);
			this.velocity.limit(4);//so the rockets don't go too crazy
		}
		//hitting obstacle is bad aka crashing
		if (this.position.x > obstacleX && this.position.x < obstacleX + obstacleW/**width of obstacle**/
			&& this.position.y > obstacleY && this.position.y < obstacleY + obstacleH/**height of obstacle**/
			) {
			this.collision = true;
			this.obstacle = true;
			sysEndTime = new Date();
			this.elapsedTime = sysEndTime - sysStartTime;
		}
		//window collision detection
		if ((this.position.x > width || this.position.x < 0) ||/**width**/
			(this.position.y > height || this.position.y < 0)) {/**height**/
			this.collision = true;
			this.border = true;
			sysEndTime = new Date();
			this.elapsedTime = sysEndTime - sysStartTime;
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
		//just rewarding the fit rockets
		if (this.touching) {
			this.fitness *= 10;//boost fitness scores
			if (this.elapsedTime < 900) {
				this.fitness *= (10^3);//boost fitness scores
			} else if (this.elapsedTime < 500) {
				this.fitness *= (10^4);//boost fitness scores
			} else if (this.elapsedTime < 100) {
				this.fitness *= (10^5);//boost fitness scores
			} else if (this.elapsedTime < 50) {
				this.fitness *= (10^6);//boost fitness scores
			}
		}
		if (this.collision) {
			if (this.border) {
				this.fitness /= 100;
			} else if (this.obstacle) {
				this.fitness /= 5;
			}
			
		}
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
	generationCnt++;//update the generation counter
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

