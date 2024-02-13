PROJECT=mlasq
NODE_BIN=./node_modules/.bin
SRC = index.js $(wildcard lib/*.js)
TEST_SRC = $(wildcard test/*.js)

all: check compile

check: lint test

build:
	mkdir -p $@

node_modules: package.json
	yarn
	touch $@

lint: | node_modules
	$(NODE_BIN)/jshint $(SRC) test

test:
	node --require should --test

clean:
	rm -fr build node_modules

.PHONY: all clean check lint compile test
