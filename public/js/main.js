function createWorld(type, size, texture) {
	if (type == 'terra'){
		createTerra(size, texture);
	  }
	else if (type == 'rocky'){
	  createRocky();
	  return moonmesh;
	  }
}
