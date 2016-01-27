PROJECT=api
BUILD=build
DIST=dist
GRUNT=grunt
NPM=npm
BOWER=bower
DEL=rm -rf
ARCHIVE=dist.tar.gz
BASE=$(shell echo $(baseref) | sed 's/\//\\\//g')\/doc\/
DOMAIN=$(shell echo $(baseref) |sed 's/http:\/\///')
HTML=dist/doc/index.html
HTMLTMP=dist/doc/index.html.new
TAR=tar czf
RENAME=mv
DOCKER=docker
SAIL_REGISTRY = sailabove.io
SAIL_TAG = $(account)/$(PROJECT)
SAIL = sail

help:
	@echo "make clean                                           Clean the project"
	@echo "make build         baseref=<url-base-ref>            Build the project"
	@echo "make docker        baseref=<url-base-ref>            Build the Docker image"
	@echo "make sail          baseref=<url-base-ref> account=xx Create a service on Sailabove.io"
	@echo "make sail-redeploy baseref=<url-base-ref> account=xx Redeploy a service on Sailabove.io"

install:
	$(NPM) install
	$(BOWER) install

clean:
	$(DEL) bower_components
	$(DEL) node_modules
	$(DEL) build
	$(DEL) dist

grunt: install
	$(GRUNT)

configure:
	sed 's/<base href="[a-zA-Z0-9:\/]*">/<base href="$(BASE)">/' <$(HTML) >$(HTMLTMP)
	$(DEL) $(HTML)
	$(RENAME) $(HTMLTMP) $(HTML)

build: grunt configure
	$(TAR) $(ARCHIVE) $(DIST)

docker: build
	$(DOCKER) build -t $(PROJECT) .

sail_send: docker
	$(DOCKER) tag -f $(PROJECT) $(SAIL_REGISTRY)/$(SAIL_TAG)
	$(DOCKER) push $(SAIL_REGISTRY)/$(SAIL_TAG)

sail: sail_send
	$(SAIL) service add $(SAIL_TAG) --batch --publish 80:8080 --env MONO_THREAD=true --env API_HOST=$(baseref) --network predictor --batch $(PROJECT)
	$(SAIL) service start --batch $(SAIL_TAG)
	$(SAIL) service domain attach $(SAIL_TAG) $(DOMAIN)

sail-redeploy: sail_send
	$(SAIL) service redeploy --batch $(SAIL_TAG)
	$(SAIL) service start --batch $(SAIL_TAG)
	$(SAIL) service domain attach $(SAIL_TAG) $(DOMAIN)
