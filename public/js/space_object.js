// spaceObjects.js 

// Space Object Base Object 
// This also works with THREE.js
var SpaceObject = function (spaceData){
    var self = {};
	self.Data = spaceData;
    // Position updateable by GameCLient/Render
    self.Postion = {};
    self.Position.x = 0;
    self.Position.y = 0;
    self.Position.z = 0; 
 
        
    self.BaseInit = function (callback){
        // Init the basics! ! 
        
        // and then finally do this..
        callback();
    };
	
	self.BaseUpdate = function (space, time, callback){
        // common updates! 
        
        // and then finally do this...
        callback();
	};
	
	return self;
};

var AsteroidObject = function(asteroidData){
	var self = new SpaceObject(asteroidData);
	
	self.Init = function (){
        self.BaseInit(function(){
        // Init the ASteroid if needed    
        });
	};
	
	self.Update = function (space,time){
		//  Always call BaseUpdate();
		self.BaseUpdate(space,time, function () {
			// Update the Asteroid! 
		});
	};
	
	return self;
};

var MoonObject = function (moonData) {
	var self = new SpaceObject(moonData);
	
    self.Init = function (){
        self.BaseInit(function(){
        // Init the Moon if needed    
        });
	};
	
	self.Update = function (space,time){
		//  Always call BaseUpdate();
		self.BaseUpdate(space,time, function () {
			// Update the Moon! 
		});
	};
	
	return self;
}; 

var PlanetObject = function (planetData) {
	var self = new SpaceObject(planetData);
	self.Moons = [];
	
	self.Init = function() {
        self.BaseInit(function(){
    		// Init the planet! 
    		for(var moon_index = self.Data.Moons){
                var current_moon_data = self.Data.Moons[moon_index];
    			var n_moon = new MoonObject(current_moon_data);
    			n_moon.Init();
    			self.Moons.push(n_moon);
    		}
        });
	};
	
	self.Update = function (space,time){
		//  Always call BaseUpdate();
		self.BaseUpdate(space,time, function () {
			// Update the Planet! 
			
			// Then Update the Moons!
			for(var moon_index in self.Moons){
				var current_moon_object = self.Moons[moon_index];
				current_moon_object.Update();
			};
		});
	};
	
	return self;
};

var StarObject= function (starData){
	var self = new SpaceObject(starData);
	
	self.Init = function(){
    	self.BaseInit(function(){
    	    // Init the Star! 
    	});
	};
	
	self.Update = function (space,time){
		//  Always call BaseUpdate();
		self.BaseUpdate(space,time, function () {
			// Update the Star System! 
		});
	};
	
	return self;
};


var StarSystemObject = function (starSystemData){
	var self = new SpaceObject(starSystemData);
	self.Star = new StarObject(starSystemData.Star);
	self.Planets = [];
	self.Asteroids = [];
	
	
	self.Init = function(){
            self.BaseInit(function() {
    		// Init the star system 
    		// Load the Planet Data ! 
    		for(var planet_index in self.Data.Planets){
    			var current_planet_data = self.Planets[planet_index];
    			var n_planet = new PlanetObject(current_planet_data);
    			n_planet.Init();
    			self.Planets.push(n_planet);
    		}
    		
    		for(var asteroid_index in self.Data.Asteroids){
    			var current_asteroid_data = self.Data.Asteroids[asteroid_index];
    			var n_asteroid = new AsteroidObject(current_asteroid_data);
    			n_asteroid.Init();
    			self.Asteroids.push(n_asteroid);
    		};
        });
	};
	
	self.Update = function (space,time){
		//  Always call BaseUpdate();
		self.BaseUpdate(space,time, function () {
			// Update the Star System!
			
			// Update each planet in the star system 
			for(var planet_index in self.Planets){
				var current_planet_object = self.Planets[planet_index];
				current_planet_object.Update();
			}
			
			// Update the Asteroids in the star system
			for(var asteroid_index in self.Asteroids){
				var current_asteroid_object = self.Asteroids[asteroid_index];
				current_asteroid_object.Update();
			}

		});
	};
	
	return self;
};


