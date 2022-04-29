PROJECT=mlasq
NODE_BIN=./node_modules/.bin
SRC = index.js $(wildcard lib/*.js)
TEST_SRC = $(wildcard test/*.js)

all: check compile

check: lint test

compile: build/build.js build/test.js

build:
	mkdir -p $@

build/build.js: $(SRC) | build node_modules
	$(NODE_BIN)/browserify --require ./index.js:$(PROJECT) --debug --outfile $@

build/test.js: $(SRC) $(TEST_SRC) | build node_modules
	$(NODE_BIN)/browserify --entry ./test/mlasq.js --debug --outfile $@

.DELETE_ON_ERROR: build/build.js build/test.js

node_modules: package.json
	yarn
	touch $@

lint: | node_modules
	$(NODE_BIN)/jshint $(SRC) test

test:
	$(NODE_BIN)/electron-mocha --require should --renderer

clean:
	rm -fr build node_modules

.PHONY: all clean check lint compile test
