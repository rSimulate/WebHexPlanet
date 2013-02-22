  // spaceData 
/
// Base Object for all Data Classes
var spaceData = function (Id,typeName,radius, semimajoraxis,eccentricity, angularvelocity, inclination){
    var self = {};
    // Game Attributes
	self.ID = Id;
	self.Type = typeName;
    
    // Geometry Attributes
	self.Radius = radius; // Geometry data type? = semimajoraxis / (1 + Eccentricity * cos(theta)); [For Keppler]
	self.Geometry = [];
	self.SemiMajorAxis = semimajoraxis;
	self.Eccentricity = eccentricity;
	self.AngularVelocity = angularvelocity //I think inclination only effects Y but there is a trig function;
    Self.Inclination = inclination;
    self.nonLocalposition = {};
    self.nonLocalposition.x = 0; //= r * cos(theta); theta=freq * time  
    self.nonLocalposition.y = 0; //= r*cos(Inclination)*sin(theta) [need to double check]   
    self.nonLocalposition.z = 0; //= r * sin(theta);
    self.IsUpdatable = true; // Can this object be updated?
    self.HasOrbit = true;
    //self.AxialTilt = 0;
    // Other Base Attributes  
    
	
	return self;
};

// Asteroid Data
var AsteroidData = function (Id,radius){
	var self = new spaceData(Id,"space:asteroid",radius);
	// Asteroid Attributes 
    
	return self;
};

// Moon Data
var MoonData = function (planetID,Id,radius){
	var self = new spaceData(Id,"space:moon", radius);
    // Moon Attributes
	self.PlanetID = planetID; // Parent Object
    
    
    

	return self;
};

// Planet Data
var PlanetData = function (starId,Id, radius){
	var self = new spaceData(Id,"space:planet", radius);
	// Planet Attributes of Moons
	self.StarID = starId; // Parent Object
    // Atmosphere data 
	self.Atmosphere = {}; // This will become and Atmosphere subObject
    
	
	return self;
};

// Star Data
var StarData = function (Id, radius){
	var self = new spaceData(Id,"space:star", radius);
	// Star Attributes 
	
	
	return self;
};

// Star System Data
var StarSystemData = function(Id, radius, starRadius) {
	var self = new spaceData(Id,"space:star_system",radius);
	self.Star = new StarData(Id,starRadius);
	// Array of PlanetData 
	self.Planets = [];
	// Star system Attributes
	
	
