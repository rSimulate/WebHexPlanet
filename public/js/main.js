function loadScene(simulation) {
    var scene = new THREE.Scene();
    //getLinkByRel(simulation.links, '/rel/skybox', function(skyboxUri) {
    //    // create skybox using texture at skybox uri
    //});
    for (var i in simulation.bodies) {
        var body = simulation.bodies[i];
        // TODO create geometry, and texture it using link relation values
        getLinkByRel(body.links, '/rel/world_texture', function(worldTextureUri) {
            getLinkByRel(body.links, '/rel/world_texture_night', function(worldTextureNightUri) {
                createPlanet(scene, 2, worldTextureUri, worldTextureNightUri);
            });
        });
    }
    return scene;
}

function addCamera(scene) {
    // put a camera in the scene
    var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, .01, 50000);
    camera.position.set(149, 0, 15);
    scene.add(camera); 
    return camera;
}

function createPlanet(scene, size, worldTextureUri, worldTextureNightUri) {
	var vertexSky = $("#vertexSky").text();
	var fragmentSky = $("#fragmentSky").text();
	var vertexGround = $("#vertexGround").text();
	var fragmentGround = $("#fragmentGround").text();

	var diffuse = THREE.ImageUtils.loadTexture(worldTextureUri);
	var diffuseNight = THREE.ImageUtils.loadTexture(worldTextureNightUri);
	var maxAnisotropy = renderer.getMaxAnisotropy();
	
	diffuse.anisotropy = maxAnisotropy;
	diffuseNight.anisotropy = maxAnisotropy;

	var radius = size;
	var atmosphere = {
	  Kr: 0.0025,
	  Km: 0.0010,
	  ESun: 20.0,
	  g: -0.950,
	  innerRadius: size,
	  outerRadius: size * 1.025,
	  wavelength: [0.650, 0.570, 0.475],
	  scaleDepth: 0.25,
	  mieScaleDepth: 0.1
	};

	var uniforms = {
	  v3CameraPosition: {
	    type: "v3",
	    value: new THREE.Vector3(0, 0, 15)
	  },
	  v3LightPosition: {
	    type: "v3",
	    value: new THREE.Vector3(1e8, 0, 1e8).normalize()
	  },
	  v3InvWavelength: {
	    type: "v3",
	    value: new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
	  },
	  fCameraHeight: {
	    type: "f",
	    value: 0
	  },
	  fCameraHeight2: {
	    type: "f",
	    value: 0
	  },
	  fInnerRadius: {
	    type: "f",
	    value: atmosphere.innerRadius
	  },
	  fInnerRadius2: {
	    type: "f",
	    value: atmosphere.innerRadius * atmosphere.innerRadius
	  },
	  fOuterRadius: {
	    type: "f",
	    value: atmosphere.outerRadius
	  },
	  fOuterRadius2: {
	    type: "f",
	    value: atmosphere.outerRadius * atmosphere.outerRadius
	  },
	  fKrESun: {
	    type: "f",
	    value: atmosphere.Kr * atmosphere.ESun
	  },
	  fKmESun: {
	    type: "f",
	    value: atmosphere.Km * atmosphere.ESun
	  },
	  fKr4PI: {
	    type: "f",
	    value: atmosphere.Kr * 4.0 * Math.PI
	  },
	  fKm4PI: {
	    type: "f",
	    value: atmosphere.Km * 4.0 * Math.PI
	  },
	  fScale: {
	    type: "f",
	    value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
	  },
	  fScaleDepth: {
	    type: "f",
	    value: atmosphere.scaleDepth
	  },
	  fScaleOverScaleDepth: {
	    type: "f",
	    value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
	  },
	  g: {
	    type: "f",
	    value: atmosphere.g
	  },
	  g2: {
	    type: "f",
	    value: atmosphere.g * atmosphere.g
	  },
	  nSamples: {
	    type: "i",
	    value: 3
	  },
	  fSamples: {
	    type: "f",
	    value: 3.0
	  },
	  tDiffuse: {
	    type: "t",
	    value: diffuse
	  },
	  tDiffuseNight: {
	    type: "t",
	    value: diffuseNight
	  },
	  tDisplacement: {
	    type: "t",
	    value: 0
	  },
	  tSkyboxDiffuse: {
	    type: "t",
	    value: 0
	  },
	  fNightScale: {
	    type: "f",
	    value: 1
	  },
	  m4ModelInverse: {
		type: "m4",
		value: THREE.Matrix4()
	  }
	};

	var planetgeometry	= new THREE.SphereGeometry(size, 50, 250);
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
    	vertexShader: vertexGround,
    	fragmentShader: fragmentGround});
	var planetmesh	= new THREE.Mesh(planetgeometry, material); 
	scene.add(planetmesh);

	var cloudgeometry	= new THREE.SphereGeometry(size + 0.02, 50, 50);
	var cloudmaterial	= new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("images/clouds.png"),
		color: 0xFFFFFF,
		transparent: true,
		opacity: 1.0});
	var cloudmesh	= new THREE.Mesh(cloudgeometry, cloudmaterial); 
	planetmesh.add(cloudmesh);

	var hexgeometry	= new THREE.IcosahedronGeometry(size + 0.01, 3);
	setHexUVs(hexgeometry);
	var material	= new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("images/hex02.png"),
		color: 0xFFFF00,
		transparent: true,
		opacity: 0.25
		});
	var hexmesh	= new THREE.Mesh(hexgeometry, material); 
	planetmesh.add(hexmesh);

	var atmopheregeometry	= new THREE.SphereGeometry(atmosphere.outerRadius, 50, 50);
	var atmospherematerial	= new THREE.ShaderMaterial({
		uniforms: uniforms,
    	vertexShader: vertexSky,
    	fragmentShader: fragmentSky
		});
	var vector = new THREE.Vector3(1, 0, 0)
	var cameraHeight = camera.position.length()
	var atmospheremesh	= new THREE.Mesh(atmopheregeometry, atmospherematerial); 
	atmospheremesh.material.side = THREE.BackSide;
	atmospheremesh.material.transparent = true;	
	planetmesh.add(atmospheremesh);

	return {
		planet: planetmesh,
		atmosphere: atmospheremesh,
		hex: hexmesh
	};
}
		
function drawSkyBox()  {
	var stargeometry = new THREE.SphereGeometry(5000 , 20, 20);
	var starmaterial	= new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("images/MilkyWay.jpg"),
		side: THREE.BackSide,
		});
	var starmesh	= new THREE.Mesh(stargeometry, starmaterial); 

	var starTexture = THREE.ImageUtils.loadTexture("images/star.png");
	starTexture.needsUpdate = true;

	// create a star material
	var material = new THREE.ParticleBasicMaterial({
		//map: starTexture,
		vertexColors: true,
		size: 1.6,
		sizeAttenuation: false
	});

	var nStars = 10000;
	var starParticles = new THREE.BufferGeometry();
	starParticles.attributes = {
		position: {
			itemSize: 3,
			array: new Float32Array(nStars * 3),
			numItems: nStars * 3
		},
		color: {
			itemSize: 3,
			array: new Float32Array(nStars * 3),
			numItems: nStars * 3
		}
	};

	var positions = starParticles.attributes.position.array;
	var colors = starParticles.attributes.color.array;

	// new Random object with a seed of 1234
	var randomStream = new Random(1234);
	// generate some stars
	for (var i = 0; i < nStars; i++) {
		// find the star temperature in Kelvin
		var temp = Math.random() * 41000 + 3120;
		var magnitude = 1.0 * Math.random() + 1.2;
		// find the sequence color
		var red, green, blue;
		if (temp/100 <= 66) {
			red = 255;
		} else {
			red = temp/100 - 60;
			red = 329.698727446 * Math.pow(red, -0.1332047592);
			if (red < 0) {
				red = 0;
			} else if (red > 255) {
				red = 255;
			}
		}

		if (temp/100 <= 66) {
			green = temp/100;
			green = 99.4708025861 * Math.log(green) - 161.1195681661;
			if (green < 0) {
				green = 0;
			} else if (green > 255) {
				green = 255;
			}
		}

		if (temp/100 >= 66) {
			blue = 255;
		} else {
			if (temp/100 <= 19) {
				blue = 0;
			} else {
				blue = temp/100 - 10;
				blue = 138.5117312231 * Math.log(blue) - 305.0447927307;
				if (blue < 0) {
					blue = 0;
				} else if (blue > 255) {
					blue = 255;
				}
			}
		}
		var starColor = new THREE.Color();
		starColor.setRGB(red/255.0, green/255.0, blue/255.0);

		// randomly generate a spherical coordinate with r = start geometry radius - 1;
		// phi ~[0, 2 PI] centered on PI
		var phi = randomStream.normal(0.0, Math.PI * 2);
		// theta ~[0, PI] centered on PI/2
		var theta = randomStream.normal(0, Math.PI);
		var r = 1000 * magnitude;
		// convert to cartesian
		var x = r * Math.sin(theta) * Math.cos(phi);
		var y = r * Math.cos(theta);
		var z = r * Math.sin(theta) * Math.sin(phi);

		positions[i] = x;
		positions[i+1] = y;
		positions[i+2] = z;
		colors[i] = starColor.r;
		colors[i+1] = starColor.g;
		colors[i+2] = starColor.b;
	}

	starParticles.computeBoundingSphere();

	var starParticleSystem = new THREE.ParticleSystem(starParticles, material);

	starmesh.add(starParticleSystem);

	scene.add(starmesh);
	return starmesh;
}

function lights() {
	var textureFlare0 = THREE.ImageUtils.loadTexture("images/lensflare/lensflare0.png");
	var textureFlare2 = THREE.ImageUtils.loadTexture("images/lensflare/lensflare2.png");
	var textureFlare3 = THREE.ImageUtils.loadTexture("images/lensflare/lensflare3.png");

	return addLight(0.995, 0.025, 0.99, 0, 0, 0);

	function addLight(h, s, v, x, y, z) {

		var light = new THREE.PointLight(0xffffff, 1.5, 4500);
		light.color.setHSL(h, s, v);
		light.position.set(x, y, z);
		scene.add(light);

		var flareColor = new THREE.Color(0xffffff);
		flareColor.setHSL(h, s - 0.5, v + 0.5);

		var lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);

		lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
		lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
		lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);

		lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
		lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
		lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
		lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);

		lensFlare.customUpdateCallback = function lensFlareUpdateCallback(object) {

			var f, fl = object.lensFlares.length;
			var flare;
			var vecX = -object.positionScreen.x * 2;
			var vecY = -object.positionScreen.y * 2;


			for(f = 0; f < fl; f++) {

				   flare = object.lensFlares[ f ];

				   flare.x = object.positionScreen.x + vecX * flare.distance;
				   flare.y = object.positionScreen.y + vecY * flare.distance;

				   flare.rotation = 0;

			}

			object.lensFlares[ 2 ].y += 0.025;
			object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);

		}
		lensFlare.position = light.position;

		scene.add(lensFlare);
		return lensFlare;
	}		
}

