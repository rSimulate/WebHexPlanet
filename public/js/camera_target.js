function CameraTarget(cameraControls, bodies) {
	if( keyboard.pressed("z") ) camMODE = 1;
	if( keyboard.pressed("x") ) camMODE = 0;

	if( keyboard.pressed("0") ) camTARGET = 0;
	if( keyboard.pressed("1") ) camTARGET = 1;
	if( keyboard.pressed("2") ) camTARGET = 2;
	if( keyboard.pressed("3") ) camTARGET = 3;

	if( keyboard.pressed("n") ) timeAccel = timeAccel - 1;
	if( keyboard.pressed("m") ) timeAccel = timeAccel + 1;

	if (camMODE == 1) cameraControls.update();

	if (camTARGET == 1) {
        camera.lookAt(light.position);
	    camera.position.x = light.position.x + 30;
	    camera.position.y = light.position.y + 25;
	    camera.position.z = light.position.z;
	    camMODE = 0;
    } else if (camTARGET == 2 && bodies && bodies[0]) {
	    camera.lookAt(bodies[0].planet.position);
	    camera.position.x = camradius * Math.cos(camorbitphase) + bodies[0].planet.position.x;//act on camera rotation.
	    camera.position.z = camradius * Math.sin(camorbitphase) + bodies[0].planet.position.z;
	    camera.position.y = 2 + bodies[0].planet.position.y;
	    camMODE = 0;
    } else if (camTARGET = 3 && bodies && bodies[1]) {
	    camera.lookAt(bodies[1].planet.position);
	    camera.position.x = bodies[1].planet.position.x + 2;
	    camera.position.y = bodies[1].planet.position.y + 1;
	    camera.position.z = bodies[1].planet.position.z + 3;
	    camMODE = 0;
    }
}
