WebHexPlanet
============

An HTML/WebGL port of HexPlanet using Three.js.

View the live demo at http://webhexplanet.herokuapp.com/

To jump straight into the code for our project, here's our cloud 9 share:
https://github.com/rSimulate/WebHexPlanet/wiki/Cloud-9-Environment

If you're using this for seperate purposes, or want to test your own fork of the code, follow the below procedures:

Running with Node+MongoDB
=========================

Setup node.js
http://nodejs.org/download/

Setup mongodb
http://www.mongodb.org/downloads

Checkout the source and download dependencies

`git clone https://github.com/rSimulate/WebHexPlanet.git`

`cd WebHexPlanet`

`npm install`

Serve up the web application

`node web.js`

Setup and run https://github.com/rSimulate/terrainReferenceEngine and https://github.com/rSimulate/agentReferenceEngine

Navigate to localhost:9292
