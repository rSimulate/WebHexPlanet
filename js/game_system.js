// represents any game controllable object 
// Hut
// House
// Ironworks
// Factory
// SpacePort
// Starbase Module
// Starship Module
var gameSystemItem = function (Id){
    var self = {};
    // Game Logic Attributes
    self.EnergyProduction = 0;
    self.Active = true;
    self.Strength = 0;
    self.MaxEnergyStorage = 0;
    self.EnergyRate = 0; // negative means it consumes, positive means it produces
    self.MaxEnergyStorage; // Max amount of energy that can be stored here
    self.MaxPopulation = 0; // Maximum amount of population that can
    
    // Mesh Attributes
    self.Geometry = {};
    self.Lights = {};
    
    // UI Attributes
    
    // Game Actions things players can do 
    self.UseItem = function () {
    
    };
    
    self.AddFuel = function () {
        
    };
    
    self.RemoveFuel = function () {
    
    };
    
    self.Repair = function () {
    
    };
    
    self.Destroy = function () {
        
    };
    
    self.Populate = function () {
    
    };
    
    self.Activate = function () {
        // Activation logic : can this be activated?
        self.Active = true;
    };
    
    self.Deactivate = function() {
        // Deactivate 
        self.Active = false;
    };
    
    self.Init = function () {
        // Object Init Function 
    };
    
    self.Update = function () {
        // Object Update Function
    };
    
    return self;
};

var gameSystem = function(){
    var self = {};
    self.Items = []; // array of gameSystemItems
    self.Geometry = {};
    // Mesh Attributes
    self.Geometry = {};
    self.Lights = {};
    // UI Attributes
    
    self.Init = function (){
    };
    
    self.Update = function () {
    };
    
    self.AddItem = function (itemData){
    
    };
    
    return self;
};