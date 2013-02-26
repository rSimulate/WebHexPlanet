  
			function createPlanet(size) {
		
			var planetgeometry	= new THREE.IcosahedronGeometry(size, 3);
			var material	= new THREE.MeshLambertMaterial(
					{map: THREE.ImageUtils.loadTexture("images/TEWworld.jpg")});
			var mesh	= new THREE.Mesh( planetgeometry, material ); 
			scene.add( mesh );
			mesh.rotation.y += 0.02;

			var atmopheregeometry	= new THREE.IcosahedronGeometry(size + 0.05 , 3);
			var atmospherematerial	= new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("images/clouds.png"),
				color: 0xFFFFFF,
				transparent: true,
				//opacity: 1.0
				} );
			var atmospheremesh	= new THREE.Mesh( atmopheregeometry, atmospherematerial ); 
				atmospheremesh.position.x = mesh.position.x;
				atmospheremesh.position.y = mesh.position.y;
				atmospheremesh.position.z = mesh.position.z;

			
			scene.add( atmospheremesh );
			var hexgeometry	= new THREE.IcosahedronGeometry(size + 0.01, 3);

			setHexUVs(hexgeometry);
			var material	= new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("images/hex02.png"),
				color: 0xFFFFFF,
				transparent: true,
				opacity: 0.25
				});
			var hexmesh	= new THREE.Mesh( hexgeometry, material ); 
				hexmesh.position.x = mesh.position.x;
				hexmesh.position.y = mesh.position.y;
				hexmesh.position.z = mesh.position.z;
			scene.add( hexmesh );
			return mesh;
		}
		
		function drawSkyBox()  {
		
		
			var stargeometry = new THREE.IcosahedronGeometry(5000 , 2);
			var starmaterial	= new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture("images/MilkyWay.jpg"),
				side: THREE.BackSide,
				} );
			var starmesh	= new THREE.Mesh( stargeometry, starmaterial ); 
			scene.add( starmesh );
			
			return starmesh;
		}
		

		
		function lights() {
			var textureFlare0 = THREE.ImageUtils.loadTexture( "images/lensflare/lensflare0.png" );
			var textureFlare2 = THREE.ImageUtils.loadTexture( "images/lensflare/lensflare2.png" );
			var textureFlare3 = THREE.ImageUtils.loadTexture( "images/lensflare/lensflare3.png" );

			addLight( 0.995, 0.025, 0.99, -500, 0, -1000 );

			function addLight( h, s, v, x, y, z ) {

				var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
				light.color.setHSL( h, s, v );
				light.position.set( x, y, z );
				scene.add( light );

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

				scene.add( lensFlare );

			}		
		
		}
		
