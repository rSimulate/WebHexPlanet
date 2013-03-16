var http = require('http');
var express = require('express');
var sys = require('sys');
var fs = require('fs');
var url = require('url');
var uuid = require('node-uuid');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost';

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getLinkByRel(links, rel) {
	for (var i in links) {
		if (links[i].rel === rel) {
			return links[i];
		}
	}
	return undefined;
}

var app = express();

// Render a page and return a link to the data file
app.get('/metasim', function(request, response) {
    var versions = {
        versions: [{
            id: '1.0',
	       	links: [{
	    	    rel: '/rel/entrypoint',
	    		href: '/metasim/1.0',
	    		method: 'GET'}]}]};
	response.send(versions);
});

mongo.connect(mongoUri, {}, function(error, db) {
	db.addListener('error', function(error) {
		console.log(error);
	});

	// setup default data for engines
	db.collection('engines').update({name: 'TerrainReferenceEngine'}, {
		name: 'TerrainReferenceEngine',
		type: 'terrain',
		href: 'http://metasimTerrainReferenceEngine.herokuapp.com/metasim/1.0',
		version: '1.0'}, {upsert: true});
   	db.collection('engines').update({name: 'WeatherReferenceEngine'}, {
		name: 'WeatherReferenceEngine',
		type: 'weather',
		href: 'http://metasimWeatherReferenceEngine.herokuapp.com/metasim/1.0',
		version: '1.0'}, {upsert: true});
	db.collection('engines').update({name: 'AgentReferenceEngine'}, {
		name: 'AgentReferenceEngine',
		type: 'agent',
		//href: 'http://metasimAgentReferenceEngine.herokuapp.com/metasim/1.0',
		href: 'http://localhost:5001/metasim/1.0',
		version: '1.0'}, {upsert: true});

	// Endpoint resource
	app.get('/metasim/:version', function(request, response) {
		if (request.params.version == '1.0') {
			response.send({
				links: [{
					rel: '/rel/simulations',
					href: '/metasim/' + request.params.version+ '/simulations',
					method: 'GET'}, {
					rel: '/rel/engines',
					href: '/metasim/' + request.params.version+ '/engines',
					method: 'GET'}]});
			
		} else {
			response.send(404, null);
		}
	});

	// Engines resource
	app.get('/metasim/:version/engines', function(request, response) {
		if (request.params.version == '1.0') {
			db.collection('engines').find({version: request.params.version}).toArray(function(err, engines) {
				console.log('sending engines' + JSON.stringify(engines));
				response.send({
					engines: engines});
			});
		} else {
			response.send(404, null);
		}
	});

	// Simulations resource
	app.get('/metasim/:version/simulations', function(request, response) {
		if (request.params.version == '1.0') {
			db.collection('simulations').find({}).toArray(function(err, simulations) {
				console.log('sending simulations' + JSON.stringify(simulations));
				response.send({
					simulations: simulations,
					links: [{
						rel: '/rel/add',
						href: '/metasim/' + request.params.version+ '/simulations',
						method: 'POST'}]});
			});
		} else {
			response.send(404, null);
		}
	});

	// Create a new simulation
	app.post('/metasim/:version/simulations', function(request, response) {
		var simulationId = new ObjectID();
		var simulationUri = '/metasim/' + request.params.version + '/simulations/' + simulationId.toString();
		// req body
		var terrainEngineName = request.body.terrain_engine_name;
		var agentEngineName = request.body.agent_engine_name;
		var terrainEngine = db.collection('engines').findOne({name:terrainEngineName, version: request.params.version});
		var agentEngine = db.collection('engines').findOne({name:agentEngineName, version: request.params.version});
		if (terrainEngine == null) {
			response.send(400, 'TerrainEngine: ' + terrainEngineName + ' not found.');
		} else if (agentEngine == null) {
			response.send(400, 'AgentEngine: ' + agentEngineName + ' not found.');
		}
		else {
			// create the simulation on the engines..
			// Get the terrain engine endpoint
			http.get(terrainEngine.href, function(res) {
				var simulationsHref = getLinkByRel(res.body.links, '/rel/simulations').href;
				// Get the terrain engine simulations resource
				http.get(simulationsHref, function(res) {
					var simulationAddHref = url.parse(getLinkByRel(res.body.links, '/rel/add').href);
					// Post a new simulation to the terrain engine
					var req = http.request({
						hostname: simulationAddHref.hostname,
						port: simulationAddHref.port,
						path: simulationAddHref.path,
						method: 'POST'});
					req.on('response', function (res) {
						var terrainSimulationHref = res.headers.Location;
						// Get the agent engine endpoint
						http.get(agentEngine.href, function(res) {
							var simulationsHref = getLinkByRel(res.body.links, '/rel/simulations').href;
							// Get the agent engine simulations resource
							http.get(simulationsHref, function(res) {
								var simulationAddHref = url.parse(getLinkByRel(res.body.links, '/rel/add').href);
								// Post a new simulation to the terrain engine
								var req = http.request({
									hostname: agentAddHref.hostname,
									port: agentAddHref.port,
									path: agentAddHref.path,
									method: 'POST'});
								req.on('response', function (res) {
									var agentSimulationHref = res.headers.Location;
									
									// Setup some reverse proxies to forward calls from MetaSim to the engines
									app.get(url.parse(terrainSimulationHref).path, function(request, response) {
										var req = http.get(terrainSimuationHref, function (res) {
											res.setEncoding('utf8');
											res.on('data', function (chunk) {
												response.write(chunk);
											});
											res.on('close', function() {
												response.writeHead(res.statusCode);
												response.end();
											});
										});
									});
									app.get(url.parse(agentSimulationHref).path, function(request, response) {
										var req = http.get(agentSimuationHref, function (res) {
											res.setEncoding('utf8');
											res.on('data', function (chunk) {
												response.write(chunk);
											});
											res.on('close', function() {
												response.writeHead(res.statusCode);
												response.end();
											});
										});
									});

									// Create the simulation object and return it.
									var simulation = {
										links: [{
											rel: 'self',
											href: simulationUri,
											method: 'GET'}, {
											rel: '/rel/delete',
											href: simulationUri,
											method: 'DELETE'}, {
											rel: '/rel/world_texture',
											href: terrainSimulationHref,
											method: 'GET'}, {
											rel: '/rel/agents',
											href: agentSimulationHref,
											method: 'GET'}]};
									db.collection('simulations').insert(simulation);
									response.header('Location', simulationUri);
									response.send(201, null);
								});
								req.write({simulation_href: simulationUri});
								req.end();
							});
						});
					});
					req.write({simulation_href: simulationUri});
					req.end();
				});
			});
		}
	});

	// Delete simulations
	app.delete('/metasim/:version/simulations/:id', function(request, response) {
		var version = request.params.version;
		if (version == '1.0') {
			var simulationId = request.params.id;
			if (db.collection('simulations').find({_id:simulationId}).count() > 0) {	
				db.collection('simulations').remove({_id:simulationId});
				response.send(204, null);
			} else {
				console.log('simulation ' + simulationId + ' not found');
				response.send(404, 'simulation ' + simulationId + ' not found');
			}
		} else {
			console.log('version ' + version + ' not found');
			response.send(404, 'version ' + version + ' not found');
		}
	});
});

// Redirect / to /index.html
app.get('/', function(req, res) {
    res.redirect('/index.html');
});
// Serve up static content
app.get('/index.html|/js/*|/images/*|/vendor/*|/css/*|/shaders/*', function(request, response) {
    fs.readFile('./public' + request.path, function(err, data) {
	    if (err) {
		    console.log(err);
			response.send(500, err);
		} else {
		    var contentType = 'text/plain';
			if (request.path.endsWith('.html')) {
				contentType = 'text/html';
			} else if (request.path.endsWith('.js')) {
				contentType = 'text/javascript';
			} else if (request.path.endsWith('.jpg') || request.path.endsWith('.jpeg')) {
				contentType = 'image/jpeg';
			} else if (request.path.endsWith('.css')) {
				contentType = 'text/css';
			}
		    response.header('Content-Type', contentType);
	        response.send(data);
         }
    });
});

var port = process.env.PORT || 9292;
app.listen(port, function() {
    console.log("Listening on " + port);
});
