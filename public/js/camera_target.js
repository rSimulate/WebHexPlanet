function CameraTarget() {
	if( keyboard.pressed("z") ) camMODE = 1;
	if( keyboard.pressed("x") ) camMODE = 0;

	if( keyboard.pressed("0") ) camTARGET = 0;
	if( keyboard.pressed("1") ) camTARGET = 1;
	if( keyboard.pressed("2") ) camTARGET = 2;
	if( keyboard.pressed("3") ) camTARGET = 3;

	if( keyboard.pressed("n") ) timeAccel = timeAccel - 1;
	if( keyboard.pressed("m") ) timeAccel = timeAccel + 1;

	if (camMODE == 1)cameraControls.update();

	if (camTARGET == 1) camera.lookAt(light.position);
	if (camTARGET == 1) camera.position.x = light.position.x + 30;
	if (camTARGET == 1) camera.position.y = light.position.y + 25;
	if (camTARGET == 1) camera.position.z = light.position.z;
	if (camTARGET == 1) camMODE = 0;


	if (camTARGET == 2) camera.lookAt(planet.planet.position);
	if (camTARGET == 2) camera.position.x = camradius * Math.cos(camorbitphase) + planet.planet.position.x;//act on camera rotation.
	if (camTARGET == 2) camera.position.z = camradius * Math.sin(camorbitphase) + planet.planet.position.z;
	if (camTARGET == 2) camera.position.y = 2 + planet.planet.position.y;
	if (camTARGET == 2) camMODE = 0;


	if (camTARGET == 3) camera.lookAt(moonmesh.position);
	if (camTARGET == 3) camera.position.x = moonmesh.position.x + 2;
	if (camTARGET == 3) camera.position.y = moonmesh.position.y + 1;
	if (camTARGET == 3) camera.position.z = moonmesh.position.z + 3;
	if (camTARGET == 3) camMODE = 0;
}