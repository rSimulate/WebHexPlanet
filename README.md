WebHexPlanet
============

An HTML/WebGL port of HexPlanet using Three.js.

View the live demo at http://webhexplanet.herokuapp.com/

To jump straight into the code for our project, here's our cloud 9 share:
https://github.com/rSimulate/WebHexPlanet/wiki/Cloud-9-Environment

If you're using this for seperate purposes, or want to test your own fork of the code, follow the below procedures:

Running with Rack
=================

Setup Ruby if you haven't yet
http://www.ruby-lang.org/en/downloads/

Setup RubyGems if you haven't yet.
http://docs.rubygems.org/read/chapter/3

Setup GemBundler if you haven't yet.
http://gembundler.com/

`gem install bundler`

Checkout the source, setup, and run.

`git clone https://github.com/rSimulate/WebHexPlanet.git`

`cd WebHexPlanet`

`bundle install`

`rackup`

Navigate to localhost:9292

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

Set the mongodb URI as an environment variable

`export MONGOLAB_URI="mongodb://localhost"`

Serve up the web application

`node web.js`

Navigate to localhost:9292
