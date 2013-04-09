var http = require('http');
var httpProxy = require('http-proxy');
var express = require('express');
var sys = require('sys');
var fs = require('fs');
var url = require('url');
var uuid = require('node-uuid');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var BSON = require('mongodb').BSONPure;

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/metasim';

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

function traverseLinks(client, uri, rels, callback) {
	console.log('GETting ' + uri);
    client.get(uri, function(res) {
        var body = ''; 
        res.on('data', function(chunk) {
            body += chunk;
        }); 
        res.on('end', function() {
            var jsonBody = JSON.parse(body);
            if (rels.length === 0) {
                callback(jsonBody, res);
            } else {
                var rel = rels.shift();
                var uriObj = url.parse(uri);
                uriObj.pathname = getLinkByRel(jsonBody.links, rel).href;
                traverseLinks(client, url.format(uriObj), rels, callback);
            }
        }); 
    });
}

var app = express();
app.configure(function(){
	app.use(express.bodyParser());
});

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
	if (db == null) {
		console.log('Error: db == null');
		console.log(error);
		return;
	}
	db.addListener('error', function(error) {
		console.log(error);
	});

	// setup default data for engines
	db.collection('engines').update({name: 'TerrainReferenceEngine'}, {
		name: 'TerrainReferenceEngine',
		type: 'terrain',
		//href: 'http://metasimTerrainReferenceEngine.herokuapp.com/metasim/1.0',
		href: 'http://localhost:5001/metasim/1.0',
		version: '1.0'}, {upsert: true});
   	db.collection('engines').update({name: 'WeatherReferenceEngine'}, {
		name: 'WeatherReferenceEngine',
		type: 'weather',
		//href: 'http://metasimWeatherReferenceEngine.herokuapp.com/metasim/1.0',
		href: 'http://localhost:5002/metasim/1.0',
		version: '1.0'}, {upsert: true});
	db.collection('engines').update({name: 'AgentReferenceEngine'}, {
		name: 'AgentReferenceEngine',
		type: 'agent',
		//href: 'http://metasimAgentReferenceEngine.herokuapp.com/metasim/1.0',
		href: 'http://localhost:5003/metasim/1.0',
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
			db.collection('simulations').find({}, {name:1, date_created:1, links:1}).toArray(function(err, simulations) {
				console.log('sending simulations' + JSON.stringify(simulations));
				response.send({
					active: simulations,
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
		var simulationName = request.body.name;
		var simulationUri = '/metasim/' + request.params.version + '/simulations/' + simulationId.toString();
		// req body
		var terrainEngineName = request.body.terrain_engine_name;
		var agentEngineName = request.body.agent_engine_name;
		console.log('Searching for ' + JSON.stringify({name:terrainEngineName, version: request.params.version}));
		db.collection('engines').findOne({name:terrainEngineName, version: request.params.version}, function(err, terrainEngine){
			if (!terrainEngine) {
				console.log('terrainEngine=' + terrainEngine);
				response.send(400, 'TerrainEngine: ' + terrainEngineName + ' not found.');
			} else {
				console.log('Searching for ' + JSON.stringify({name:agentEngineName, version: request.params.version}));
				db.collection('engines').findOne({name:agentEngineName, version: request.params.version}, function(err, agentEngine){
					if (!agentEngine) {
						response.send(400, 'AgentEngine: ' + agentEngineName + ' not found.');
					} else {
						// create the simulation on the engines..
						// Get the terrain engine endpoint
						console.log('Getting terrain engine endpoint: ' + terrainEngine.href);
						var terrainEngineHostPart = url.parse(terrainEngine.href);
						terrainEngineHostPart.pathname = '';
						terrainEngineHostPart = url.format(terrainEngineHostPart);
						console.log('terrain engine hostpart: ' + terrainEngineHostPart);
						traverseLinks(http, terrainEngine.href, ['/rel/simulations'], function(body, res) {
							var simulationAddHref = url.parse(terrainEngineHostPart + getLinkByRel(body.links, '/rel/add').href);
							// Post a new simulation to the terrain engine
							console.log('POSTing to ' + url.format(simulationAddHref));
							console.log(JSON.stringify({
								hostname: simulationAddHref.hostname,
								port: simulationAddHref.port,
								path: simulationAddHref.path,
								headers: {'Content-Type': 'application/json'},
								method: 'POST'}));
							var req = http.request({
								hostname: simulationAddHref.hostname,
								port: simulationAddHref.port,
								path: simulationAddHref.path,
								headers: {'Content-Type': 'application/json'},
								method: 'POST'});
							req.on('error', function(e) {
								console.log('problem with request: ' + e.message);
							});
							req.on('response', function (res) {
								var terrainSimulationHref = res.headers.location;
								console.log('response status: ' + res.status);
								console.log('response headers: ' + JSON.stringify(res.headers));
								console.log('Terrain simulation created at ' + terrainSimulationHref);
								// Get the agent engine endpoint
								console.log('Getting agent engine endpoint ' + agentEngine.href);
								var agentEngineHostPart = url.parse(agentEngine.href);
								agentEngineHostPart.pathname = '';
								agentEngineHostPart = url.format(agentEngineHostPart);
								console.log('agent engine hostpart: ' + agentEngineHostPart);
								traverseLinks(http, agentEngine.href, ['/rel/simulations'], function(body, res) {
									var simulationAddHref = url.parse(agentEngineHostPart + getLinkByRel(body.links, '/rel/add').href);
									// Post a new simulation to the agent engine
									console.log('POSTing to ' + url.format(simulationAddHref));
									console.log(JSON.stringify({
										hostname: simulationAddHref.hostname,
										port: simulationAddHref.port,
										path: simulationAddHref.path,
										headers: {'Content-Type': 'application/json'},
										method: 'POST'}));
									var req = http.request({
										hostname: simulationAddHref.hostname,
										port: simulationAddHref.port,
										path: simulationAddHref.path,
										headers: {'Content-Type': 'application/json'},
										method: 'POST'});
									req.on('error', function(e) {
										console.log('problem with request: ' + e.message);
									});
									req.on('response', function (res) {
										var agentSimulationHref = res.headers.location;
										console.log('Agent simulation created at ' + agentSimulationHref);
										// Setup some reverse proxies to forward calls from MetaSim to the engines
										var terrainSimulationPath = url.parse(terrainSimulationHref).path;
										console.log('Forwarding requests from ' + terrainSimulationPath + ' to ' + terrainSimulationHref);
										var agentSimulationPath = url.parse(agentSimulationHref).path;
										console.log('Forwarding requests from ' + agentSimulationPath + ' to ' + agentSimulationHref);

										// Create the simulation object and return it.
										var simulation = {
											_id: simulationId,
											name: simulationName,
											date_created: new Date(),
											forwardedPaths: [{
												path: terrainSimulationPath, dest: terrainSimulationHref}, {
											    path: agentSimulationPath, dest: agentSimulationHref}],      
											links: [{
												rel: 'self',
												href: simulationUri,
												method: 'GET'}, {
												rel: '/rel/delete',
												href: simulationUri,
												method: 'DELETE'}, {
												rel: '/rel/world_texture',
												href: terrainSimulationPath,
												method: 'GET'}, {
												rel: '/rel/agents',
												href: agentSimulationPath,
												method: 'GET'}]};
										console.log('Inserting simulation in db');
										db.collection('simulations').insert(simulation);
										console.log('Returning 201 created at ' + simulationUri);
										response.header('Location', simulationUri);
										response.send(201, null);
									});
									req.write(JSON.stringify({simulation_href: simulationUri}));
									req.end();
								});
							});
							req.write(JSON.stringify({simulation_href: simulationUri}));
							req.end();
						});
					}
				});
			}
		})
	});

	app.get('/metasim/:version/simulations/:id', function(request, response) {
		var version = request.params.version;
		if (version == '1.0') {
			var simulationId = BSON.ObjectID.createFromHexString(request.params.id);
			db.collection('simulations').findOne({_id: simulationId}, function(err, simulation) {
				if (!simulation) {
					console.log(err);
					console.log('simulation ' + simulationId + ' not found');
					response.send(404, 'simulation ' + simulationId + ' not found');
				} else {
					console.log('err: ' + JSON.stringify(err));
					console.log('found simulation: ' + request.params.id);
					console.log('sending : ' + JSON.stringify(simulation));
					response.send(simulation);
				}
			});
		} else {
			console.log('version ' + version + ' not found');
			response.send(404, 'version ' + version + ' not found');
		}
	});
	// Delete simulations
	app.delete('/metasim/:version/simulations/:id', function(request, response) {
		var version = request.params.version;
		if (version == '1.0') {
			var simulationId = new BSON.ObjectID.createFromHexString(request.params.id);
			console.log('searching for simulation ' + simulationId);
			db.collection('simulations').find({_id: simulationId}).count(function(err, number) {	
				if (number > 0) {
					console.log('deleting simulation ' + request.params.id);
					db.collection('simulations').remove({_id: simulationId});
					response.send(204, null);
				} else {
					console.log('simulation ' + simulationId + ' not found');
					response.send(404, 'simulation ' + simulationId + ' not found');
				}
			});
		} else {
			console.log('version ' + version + ' not found');
			response.send(404, 'version ' + version + ' not found');
		}
	});

	// Create a default route to pass unknown uris to engines (if they exist)
	var proxy = new httpProxy.RoutingProxy();
	app.use(function(request, response) {
		// find a simulation (if any) that contains the requested url
		console.log('Trying to forward to engine...');
		console.log('Finding simulation with path: ' + request.originalUrl);
		db.collection('simulations').findOne({forwardedPaths: {'$elemMatch': {path: request.originalUrl}}}, {'forwardedPaths.$':1}, function(err, path) {
			if (err) {
				console.log(err);
				response.send(404);
			} else {
				// construct the destination url
				var uri = url.parse(path.dest);
				console.log('Forwarding request to ' + uri.hostname + ':' + uri.port);
				proxy.proxyRequest(request, response, {host: uri.hostname, port:uri.port});
			}
		});
	});
});

// Redirect / to /index.html
app.get('/', function(req, res) {
    res.redirect('/index.html');
});
// Serve up static content
app.get('/index.html|/favicon.ico|/js/*|/images/*|/vendor/*|/css/*|/shaders/*', function(request, response) {
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
