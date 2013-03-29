//Load orbit parameters and convert to useable path for SS bodies and orbit lines.
		function OrbitSteering(t, a, b, ec, i, p, d, ax, pre) {
		// t = time in MJD
		// a = semi-major axis
		// b = semi-minor axis
		// ec = eccentricty
		// i = inclination
		// l = longitude of ascending node
		// p = period of revolution/orbit/natural-year, measured in MJD
		// d = period of rotation/day, measured in MJD
		// ax = axial tilt of object orbit, degrees
		// pre = precesion of orbit, period
		
		//Local cartesian coords for easy reference.
		//Needs Sph2Cart implemented
		var x = Sph2Cart('x',r,theta,phi);
		var y = Sph2Cart('y',r,theta,phi);
		var z = Sph2Cart('z',r,theta,phi);
			
		//###### IMPORTANT, Return the following to the main render #####
		//These are the global 'stationary' reference frame cartesian coordinates
		[Object].stationary.x = x + getParentCoords('x');
		[Object].stationary.y = y + getParentCoords('y');
		[Object].stationary.z = z + getParentCoords('z');
		[Object].stationary.day += 2 * pi * (1/d) * t; //rotation position
		[Object].stationary.ax = 2 * pi * ax //Axial Tilt
		
		//For ease of reference, convert period to frequency
		var f = (1/p);
		
		var theta = (2 * pi * f * t); //Angulary Displacement
		
		//Calculates radius r based on orbit parameters.
		var r = a * ((1.0 - ec^2)/(1.0 + ec * Math.cos(theta)));
		
		//
		var 
		
		
		
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