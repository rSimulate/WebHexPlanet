var express = require('express');
var sys = require('sys');
var fs = require('fs');
var url = require('url');
var uuid = require('node-uuid');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;

var mongoUri = process.env.MONGOLAB_URI;

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var app = express();

// Render a page and return a link to the data file
app.get('/metasim', function(request, response) {
    var versions = {
        versions: [{
            id: '1.0',
	       	links: [{
	    	    'rel': '/rel/entrypoint',
	    		'href': '/metasim/1.0',
	    		'method': 'GET'}]}]};
	response.send(versions);
});

mongo.connect(mongoUri, {}, function(error, db) {
	db.addListener('error', function(error) {
		console.log(error);
	});

	app.get('/metasim/:version', function(request, response) {
		if (request.params.version == '1.0') {
			db.collection('simulations').find({}).toArray(function(err, simulations) {
				console.log('sending simulations' + JSON.stringify(simulations));
				response.send({
					'simulations': simulations,
					'links': [{
						'rel': '/rel/add',
						'href': '/metasim/' + request.params.version+ '/simulations',
						'method': 'POST'}]});
			});
		} else {
			response.send(404, null);
		}
	});
	
	app.post('/metasim/:version/simulations', function(request, response) {
		var simulationId = new ObjectID();
		var simulationUri = '/metasim/' + request.params.version + '/simulations/' + simulationId.toString();
		var simulation = {
			'links': [{
				'rel': 'self',
				'href': simulationUri,
				'method': 'GET'}, {
				'rel': '/rel/delete',
				'href': simulationUri,
				'method': 'DELETE'}, {
				'rel': '/rel/world_texture',
				'href': simulationUri + '/world-texture.jpg',
				'method': 'GET'}]};
		db.collection('simulations').insert(simulation);
		response.header('Location', simulationUri);
		response.send(201, null);
	});
	
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
