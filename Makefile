PROJECT=api
BUILD=build
DIST=dist
GRUNT=grunt
NPM=npm
NODE=node
BOWER=bower
GETCONF=$(NODE) get-conf
DEL=rm -rf
ARCHIVE=dist.tar.gz
BASE=$(shell echo "`$(GETCONF) application.domain.protocol`:\/\/`$(GETCONF) application.domain.host`\/doc\/")
DOMAIN=`$(GETCONF) application.domain.host`
HTML=dist/doc/index.html
HTMLTMP=dist/doc/index.html.new
TAR=tar czf
RENAME=mv
DOCKER=docker
SAIL_REGISTRY = sailabove.io
SAIL_TAG = $(account)/$(PROJECT)
SAIL = sail

help:
	@echo "make clean                         Clean the project"
	@echo "make build                         Build the project"
	@echo "make docker                        Build the Docker image"
	@echo "make sail           account=xx     Create a service on Sailabove.io"
	@echo "make sail-redeploy  account=xx     Redeploy a service on Sailabove.io"

install:
	$(NPM) install
	$(BOWER) install

clean:
	$(DEL) bower_components
	$(DEL) node_modules
	$(DEL) build
	$(DEL) dist

grunt:
	$(GRUNT)

tests: install
	$(NPM) test

configure: config.json info
	sed 's/<base href="[a-zA-Z0-9:\/]*">/<base href="$(BASE)">/' <$(HTML) >$(HTMLTMP)
	$(DEL) $(HTML)
	$(RENAME) $(HTMLTMP) $(HTML)

build: config.json tests grunt configure
	$(TAR) $(ARCHIVE) $(DIST)

docker: config.json build
	$(DOCKER) build -t $(PROJECT) .

sail_send: config.json docker
	$(DOCKER) tag -f $(PROJECT) $(SAIL_REGISTRY)/$(SAIL_TAG)
	$(DOCKER) push $(SAIL_REGISTRY)/$(SAIL_TAG)

sail: config.json sail_send
	$(SAIL) service add $(SAIL_TAG) --batch --publish 80:8080 --env MONO_THREAD=true --env API_HOST=$(baseref) --network predictor --batch $(PROJECT)
	$(SAIL) service start --batch $(SAIL_TAG)
	$(SAIL) service domain attach $(SAIL_TAG) $(DOMAIN)

sail-redeploy: config.json sail_send
	$(SAIL) service redeploy --batch $(SAIL_TAG)
	$(SAIL) service start --batch $(SAIL_TAG)
	$(SAIL) service domain attach $(SAIL_TAG) $(DOMAIN)

config.json:
	$(error You must create file config.json based on config.sample.json)

info:
	@echo "Domain $(DOMAIN)"
	@echo "Base $(BASE)"
