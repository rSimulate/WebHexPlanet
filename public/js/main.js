  
		function createPlanet() {
		
			var planetgeometry	= new THREE.IcosahedronGeometry(2, 4);
			var material	= new THREE.MeshLambertMaterial(
							{map: THREE.ImageUtils.loadTexture("images/world.jpg")});
			var mesh	= new THREE.Mesh( planetgeometry, material ); 
			scene.add( mesh );

			var atmopheregeometry	= new THREE.IcosahedronGeometry(2.05 , 4);
			var atmospherematerial	= new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("images/clouds.png"),
				color: 0xFFFFFF,
				transparent: true,
				//opacity: 1.0
				} );
			var atmospheremesh	= new THREE.Mesh( atmopheregeometry, atmospherematerial ); 
			scene.add( atmospheremesh );
			var hexgeometry	= new THREE.IcosahedronGeometry(2.01, 4);

			setHexUVs(hexgeometry);
			var material	= new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("images/hex.png"),
				color: 0xFFFFFF,
				transparent: true,
				//opacity: 1.0
				});
			var mesh	= new THREE.Mesh( hexgeometry, material ); 
			scene.add( mesh );
			
		}
		
		function drawSkyBox()  {
		
			var urls = [ 
				"images/skybox.png", "images/skybox.png", //Unused These is the array of the sides of the skybox, currently it uses 1 image for all of them
				"images/skybox.png", "images/skybox.png", //Unused
				"images/skybox.png", "images/skybox.png" ]; //unsude
			var textureCube = THREE.ImageUtils.loadTextureCube( "images/skybox.png" ); //unused 
			var skymaterial = new THREE.MeshBasicMaterial( {map : THREE.ImageUtils.loadTexture("images/skybox.png"),side: THREE.BackSide} ) ;
				
			var skybox = new THREE.CubeGeometry( 500, 500, 500 );
				
		
			var skymesh = new THREE.Mesh( skybox, skymaterial ); 

			scene.add(skymesh);	
			return skymesh;
		}
		
		function createMoon() {
		
			var geometry	= new THREE.IcosahedronGeometry(0.8, 4);
			setHexUVs(geometry);
			var material	= new THREE.MeshLambertMaterial(
							{map: THREE.ImageUtils.loadTexture("images/moons/tethys.jpg")});
			var moonmesh	= new THREE.Mesh( geometry, material ); 
			moonmesh.position.x = 15;
			moonmesh.position.y = 2;
			
			scene.add( moonmesh );
						
		}
		
		function lights() {
		
			var light	= new THREE.DirectionalLight( 0xffffff );
			light.position.set( 5, 0, 0).normalize();
			scene.add( light );

		
		}
		
