  
			function createPlanet(size) {
		
			var planetgeometry	= new THREE.IcosahedronGeometry(2, 4);
			var material	= new THREE.MeshLambertMaterial(
					{map: THREE.ImageUtils.loadTexture("images/TEWworld.jpg")});
			var mesh	= new THREE.Mesh( planetgeometry, material ); 
			//Scale the object to the size variable
			mesh.scale.x = size;
			mesh.scale.y = size;
			mesh.scale.z = size;
			scene.add( mesh );

			var atmopheregeometry	= new THREE.IcosahedronGeometry(2.05 , 4);
			var atmospherematerial	= new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("images/clouds.png"),
				color: 0xFFFFFF,
				transparent: true,
				//opacity: 1.0
				} );
			var atmospheremesh	= new THREE.Mesh( atmopheregeometry, atmospherematerial ); 
			//Scale the object to the size variable
			atmospheremesh.scale.x = size + 0.05;
			atmospheremesh.scale.y = size + 0.05;
			atmospheremesh.scale.z = size + 0.05;
			
			
			scene.add( atmospheremesh );
			var hexgeometry	= new THREE.IcosahedronGeometry(2.01, 4);

			setHexUVs(hexgeometry);
			var material	= new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("images/hex02.png"),
				color: 0xFFFFFF,
				transparent: true,
				opacity: 0.4
				});
			var hexmesh	= new THREE.Mesh( hexgeometry, material ); 
			hexmesh.scale.x = size + 0.05;
			hexmesh.scale.y = size + 0.05;
			hexmesh.scale.z = size + 0.05;
			
			
			
			scene.add( hexmesh );
			
		}
		
		function drawSkyBox()  {
		
		
			var stargeometry = new THREE.IcosahedronGeometry(500 , 3);
			var starmaterial	= new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture("images/MilkyWay.jpg"),
				side: THREE.BackSide,
				//color: 0xFFFFFF,
				//transparent: true,
				opacity: 1.0
				} );
			var starmesh	= new THREE.Mesh( stargeometry, starmaterial ); 
			scene.add( starmesh );
			
			return starmesh;
		}
		

		
		function lights() {
		
			var light	= new THREE.DirectionalLight( 0xffffff );
			light.position.set( 450, 0, 0).normalize();
			scene.add( light );

		
		}
		
