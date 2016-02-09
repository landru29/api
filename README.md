# API
Rest API

## Prerequisite
You must have a sane instance of nodejs. You also need to install *grunt-cli*, *jshint*, *bower* and *nodemon*.

````
    sudo npm install -g bower grunt-cli nodemon
````


## Install

Create files:

* `config.json`
* `config.dev.json`

based on `config.json.sample`

Then Install dependencies

````
npm install
bower install
````

## Development mod

Launch server

````
    make dev
````

Launch UX Documentation

````
    grunt serve
````
