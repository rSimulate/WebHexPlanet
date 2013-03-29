//var geometry = new THREE.Geometry();//moons orbital line
	//		var radius = 15
		//	var i = 0;
			//while(i < 6.437) {
			//i += 0.01;
			//geometry.vertices.push(new THREE.Vector3(radius * Math.cos(i) + planet.planet.position.x, 0 , radius * Math.sin(i) + planet.planet.position.z)); 

			//}

			//var material = new THREE.LineBasicMaterial({
				//color: 0xFFFF00,
				//linewidth: 10});

			//var line = new THREE.Line(geometry, material);
			//scene.add(line);

function drawOrbit(size, color, originx, originz, originy) {

			var geometry = new THREE.Geometry();
			var radius = size;
			var theta = 0;
			while(theta < Math.PI * 2) {
			theta += 0.01;
			geometry.vertices.push(
				new THREE.Vector3(
					radius * Math.cos(theta) + originx,
					0,//radius * Math.sin(), 
					radius * Math.sin(theta) + originz
					)
				); 

			}

			var material = new THREE.LineBasicMaterial({
				color: color,
				linewidth: 10});

			var line = new THREE.Line(geometry, material);
			scene.add(line);

		}

		function drawBodyOrbit(size, color, body) {

			var geometry = new THREE.Geometry();
			var radius = size;
			var i = 0;
			while(i < Math.PI * 2) {
			i += 0.01;
			geometry.vertices.push(new THREE.Vector3(radius * Math.cos(i) + planet.planet.position.x, 0 , radius * Math.sin(i) + planet.planet.position.z)); 

			}

			var material = new THREE.LineBasicMaterial({
				color: color,
				linewidth: 10});

			var line = new THREE.Line(geometry, material);
			scene.add(line);


		}