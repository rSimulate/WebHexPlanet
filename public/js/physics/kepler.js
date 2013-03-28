//Load orbit parameters and convert to useable path for SS bodies and orbit lines.
		function OrbitSteering(t, a, b, e, i, w) {
		// t = time in MJD
		// a = semi-major axis
		// b = semi-minor axis
		// e = eccentricty
		// i = inclination
		// w = orbital velocity
		
			var PIseconds	= Date.now() / 1000  * Math.PI;
			var time = PIseconds * timeAccel;
			var semimajoraxis = 7;    		// Turn into parameter
			var eccentricity = 0.0549; 		// Turn into parameter
			var angularvelocity = 0.01;		// Turn into paratmeter
			var orbitphase = angularvelocity * time;
			var radius = semimajoraxis * ((1.0 - eccentricity^2)/(1.0 + eccentricity * Math.cos(orbitphase)));
			var inclination = 6.0 ;
			var incRadian = (inclination / 180.0) * Math.PI;
			var maxH = 2;
			var height = maxH * Math.cos(incRadian) * Math.sin(orbitphase);
			var rotationspeed = 0.00002 * timeAccel; //need to study up on this relation to orbit and mass. 			
	
			var camangularvelocity = 0.002;//added camera rotation.
			var camsemimajoraxis = 3; 
			var camorbitphase = camangularvelocity * time;
			var cameccentricity = 0.0549;
			var camradius = camsemimajoraxis * ((1.0 - cameccentricity^2)/(1.0 + cameccentricity * Math.cos(camorbitphase)));
			var geometry = new THREE.Geometry();
			var radius = size;
			var i = 0;
			while(i < Math.PI * 2) {
			i += 0.01;
			geometry.vertices.push(new THREE.Vector3(radius * Math.cos(i) + planet.planet.position.x, 0 , radius * Math.sin(i) + planet.planet.position.z)); 

			moonmesh.rotation.y += rotationspeed;	// Moon rotation
			//Moon's orbit
			moonmesh.position.x = radius * Math.cos(orbitphase) + planet.planet.position.x;
			moonmesh.position.z = radius * Math.sin(orbitphase) + planet.planet.position.z;
			moonmesh.position.y = height + planet.planet.position.y;
			
			}
			
			var material = new THREE.LineBasicMaterial({
				color: color,
				linewidth: 10});
			
			var line = new THREE.Line(geometry, material);
			scene.add(line);
		
		
		}