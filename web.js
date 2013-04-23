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
var async = require('async');
var extend = require('xtend');

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
    db.collection('engines').update({name: 'BodiesReferenceEngine'}, {
        name: 'BodiesReferenceEngine',
        type: 'bodies',
        //href: 'http://metasimBodiesReferenceEngine.herokuapp.com/metasim/1.0',
        href: 'http://localhost:5004/metasim/1.0',
        version: '1.0'}, {upsert: true});
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
        var simulationPathname = '/metasim/' + request.params.version + '/simulations/' + simulationId.toString();
        var simulationUrl = url.format({
            protocol: 'http',
            hostname: request.host,
            port: port,
            pathname: simulationPathname});
        var simulation = {
            _id: simulationId,
            name: simulationName,
            date_created: new Date(),
            forwardedPaths: [],
            links: [{
                rel: 'self',
                href: simulationPathname,
                method: 'GET'}, {
                rel: '/rel/delete',
                href: simulationPathname,
                method: 'DELETE'}]};

        db.collection('simulations').insert(simulation, function(err, docs) {
            // req body
            var bodiesEngineName = request.body.bodies_engine_name;
            var terrainEngineName = request.body.terrain_engine_name;
            var agentEngineName = request.body.agent_engine_name;
            console.log('Created simulation locally ' + simulationId);
            console.log('Creating on simulation on engines');

            // transform the engineName, version list into a sequence of functions that when invoked,
            // call a callback with the retrieved engine
            async.eachSeries([
                {name:bodiesEngineName, version:request.params.version},
                {name:terrainEngineName, version:request.params.version},
                {name:agentEngineName, version:request.params.version}], function(item, callback) {
                console.log('Looking up engine ' + item.name + ' ' + item.version);
                // find the matching engine
                db.collection('engines').findOne(item, function(err, engine) {
                    // Get the engine endpoint
                    console.log('Getting engine endpoint: ' + engine.href);
                    var engineHostPart = url.parse(engine.href);
                    engineHostPart.pathname = '';
                    engineHostPart = url.format(engineHostPart);
                    console.log('Engine hostpart: ' + engineHostPart);
                    traverseLinks(http, engine.href, ['/rel/simulations'], function(body, res) {
                        var simulationAddHref = url.parse(engineHostPart + getLinkByRel(body.links, '/rel/add').href);
                        // Post a new simulation to the engine
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
                            callback('problem with request: ' + e.message);
                        });
                        req.on('response', function (res) {
                            var simulationHref = res.headers.location;
                            console.log('response status: ' + res.status);
                            console.log('response headers: ' + JSON.stringify(res.headers));
                            console.log('Engine simulation created at ' + simulationHref);
                            var body = ''; 
                            res.on('data', function(chunk) {
                                body += chunk;
                            }); 
                            res.on('end', function() {
                                // only merge in body if an response was returned
                                if (body != '') {
                                    var jsonBody = JSON.parse(body);

                                    // if the engine returned anything, merge it into the simulation object
                                    if (jsonBody != null) {
                                        console.log('merging engine response into simulation ');
                                        console.log('engine response: ' + JSON.stringify(jsonBody));
                                        console.log('simulation: ' + JSON.stringify(simulation));
                                        simulation = extend(simulation, jsonBody);
                                    }
                                    // _id field needs to be an objectId not a string
                                    simulation._id = simulationId;
                                    console.log('Updating simulation in db ' + JSON.stringify(simulation));
                                    db.collection('simulations').save(simulation);
                                } else {
                                    console.log('No response body from engine. No merge performed.');
                                }
                                callback();
                            });
                        });    
                        req.write(JSON.stringify({simulation_href: simulationUrl}));
                        req.end();
                    });
               });
           },
           // afterwards, return the location of the simulation Uri back to the client
           function(err, results) {
              console.log('Returning 201 created at ' + simulationUrl);
              response.header('Location', simulationPathname);
              response.send(201, null);
           });
        });
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
