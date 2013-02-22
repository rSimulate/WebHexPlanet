// Game Client
// scene_url = this url will load the starSystemObjects from a Url. 
var Client = function (scene_url) {
    var self = this;
	// Attributes
	self.stats = {};
	self.scene = new THREE.Scene();
	self.renderer = {};
	self.composer = {};
	self.meshes = [];
	self.camera = {};
	self.cameraControl = {};
	self.gui = {};
	self.skymesh = {};
	self.SceneUrl = scene_url; // For now some arbitrary value
	self.StarSystem = {};
	
	// Functions 
	self.drawSkyBox = function()  {
			var stargeometry = new THREE.IcosahedronGeometry(5000 , 2);
			var starmaterial	= new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture("images/MilkyWay.jpg"),
				side: THREE.BackSide,
				} );
			var starmesh	= new THREE.Mesh( stargeometry, starmaterial ); 
			self.scene.add( starmesh );
			
			return starmesh;
	;}
	
	self.lights = function() {
			// lens flares
			var textureFlare0 = THREE.ImageUtils.loadTexture( "images/lensflare/lensflare0.png" );
			var textureFlare2 = THREE.ImageUtils.loadTexture( "images/lensflare/lensflare2.png" );
			var textureFlare3 = THREE.ImageUtils.loadTexture( "images/lensflare/lensflare3.png" );
			addLight( 0.995, 0.025, 0.99, -500, 0, -1000 );
	}
	
	self.addLight = function( h, s, v, x, y, z ) {

				var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
				light.color.setHSL( h, s, v );
				light.position.set( x, y, z );
				self.scene.add( light );

				var flareColor = new THREE.Color( 0xffffff );
				flareColor.setHSL( h, s - 0.5, v + 0.5 );

				var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

				lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
				lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
				lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

				lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
				lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
				lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
				lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

				lensFlare.customUpdateCallback = function lensFlareUpdateCallback( object ) {

					var f, fl = object.lensFlares.length;
					var flare;
					var vecX = -object.positionScreen.x * 2;
					var vecY = -object.positionScreen.y * 2;


					for( f = 0; f < fl; f++ ) {

						   flare = object.lensFlares[ f ];

						   flare.x = object.positionScreen.x + vecX * flare.distance;
						   flare.y = object.positionScreen.y + vecY * flare.distance;

						   flare.rotation = 0;

					}

					object.lensFlares[ 2 ].y += 0.025;
					object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

				}
				lensFlare.position = light.position;

				self.scene.add( lensFlare );

	}		
	
	self.setHexUVs = function(geometry){
			for(var f in geometry.faceVertexUvs[0]){
			  	var uvs = geometry.faceVertexUvs[0][f];
			  	uvs[0] = new THREE.Vector2(0.20, 0.73);
			  	uvs[1] = new THREE.Vector2(0.51, 0.15);
			  	uvs[2] = new THREE.Vector2(0.78, 0.70);
			}
	};
	
	self.Init = function () {
		if( Detector.webgl ){
				self.renderer = new THREE.WebGLRenderer({
					antialias		: true,	// to get smoother output
					preserveDrawingBuffer	: true	// to allow screenshot
				});
				self.rendererrenderer.setClearColorHex( 0xBBBBBB, 1 );
			}else{
				Detector.addGetWebGLMessage();
				return true;
			}
			self.rendererrenderer.setSize( window.innerWidth, window.innerHeight );
			document.getElementById('container').appendChild(renderer.domElement);

			/// Load the Scene from the url 
			self.StarSystem = self.GetSceneFromServer();
			
			// Build the star sytem objects into the Scene
			
			
			self.stats = new Stats();
			self.stats.domElement.style.position	= 'absolute';
			self.stats.domElement.style.bottom	= '0px';
			document.body.appendChild( stats.domElement );
			
			// create a scene
			// put a camera in the scene
			self.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, .01, 50000);
			self.camera.position.set(0, 0, 15);
			self.scene.add(camera);

			// create a camera contol
			self.cameraControls	= new THREE.OrbitControls( camera )

			// transparently support window resize
			THREEx.WindowResize.bind(renderer, camera);
			// allow 'p' to make screenshot
			THREEx.Screenshot.bindKey(renderer);
			// allow 'f' to go fullscreen where this feature is supported
			if( THREEx.FullScreen.available() ){
				THREEx.FullScreen.bindKey();		
				document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
			}
			
			// other functions 
			skymesh = drawSkyBox();
			lights();

	};
	
	self.GetSceneFromServer = function() {
		// TODO: Write ajax function to get JSON StarSystem data until then manually build your scene here. The Generator would build these, and then you would get them back from the server
		
		var starSystemData = new StarSystemData(0,2000,200);
		// Add planets 
		var planetData = new PlanetData(1,100);
		// Add moons to planets 
		var moonData = new MoonData(1,20);
		planetData.Moons.push(moonData);
		// Add Asteroids 
		
		self.StarSystem = new StarSystemObject(starSystemData);
        return starSystemData;
	};
	
	self.render = function (){
			// variable which is increase by Math.PI every seconds - usefull for animation
            
            // Some of this stuff needs to be moved to a spaceObject?
			var PIseconds	= Date.now() * Math.PI;
			var time = Date.now() / 50;
			var semimajoraxis = 7;    		// Turn into parameter
			var eccentricity = 0.0549; 		// Turn into parameter
			var angularvelocity = 0.03;		// Turn into paratmeter
			var orbitphase = angularvelocity * time;
			var radius = semimajoraxis * ((1.0 - eccentricity^2)/(1.0 + eccentricity * Math.cos(orbitphase)));
			var inclination = 6.0 ;
			var incRadian = (inclination / 180.0) * Math.PI;
			var maxH = 2;
			var height = maxH * Math.cos(incRadian) * Math.sin(orbitphase);
			var rotationspeed = 0.02; //need to study up on this relation to orbit and mass. 
						
			// update camera controls
			self.cameraControls.update();
			// animation of all objects
			// Update all meshes 
			for(var mesh_index in self.meshes){
				var current_mesh = self.meshes[mesh_index];
				current_mesh.Update(); // all of vour gamespace  objects like Planet nad Moon will need an update function. this is only logic that update the object's data NOT for the rendere
				// Update hte mesh to the render, I am reading up on how to basically do this ...
				self.scene.updateMesh (current_mesh); 
                // Or if we even need to? will THREE.js maintian a pointer?
			};

			self.skymesh.position = camera.position;
			// actually render the scene
			self.renderer.render( scene, camera );
		}
	
	self.animate = function() {
			// loop on request animation loop
			// - it has to be at the begining of the function
			// - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
			requestAnimationFrame( animate );
			
			// do the render
			self.render();

			// update stats
			self.stats.update();
	};
	
	return self;
};