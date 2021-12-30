SHELL := /bin/bash
WASM_BIND := faas-app/pkg/faas_app.js
DOCKER_RUST_NAME := faas-app-rust
DOCKER_RUST_EXEC := docker exec -it faas-app-rust
CARGO := $(DOCKER_RUST_EXEC) cargo
UNAME := $(shell uname)

default: run

.PHONY: default run install test test-js test-rs check check-rs check-js rust-container clean-container

run: faas-app/pkg/faas_app.js
	yarn run start

install: package.json
	docker container create -it --name $(DOCKER_RUST_NAME) --volume "$$PWD/faas-app:/app" --workdir '/app' rust:latest bash
	$(MAKE) rust-container
	$(CARGO) install wasm-pack
	$(MAKE) $(WASM_BIND)
	yarn
	docker pull ubuntu:latest
	@echo OK

rust-container:
	docker start $(DOCKER_RUST_NAME)

$(WASM_BIND): faas-app/src/lib.rs rust-container
	$(DOCKER_RUST_EXEC) wasm-pack build --target nodejs

test: test-js test-rs
	@echo OK

test-js:
	yarn test
	$(MAKE) clean-container

test-rs: rust-container
	$(CARGO) test

check: check-rs check-js
	@echo OK

check-rs: rust-container
	$(CARGO) check

check-js:
	find . \
		-iname '*.js' \
		-type f \
		-not -path './node_modules/*' \
		-not -path './faas-app/pkg/*' \
		-exec node --check {} \;

clean-container:
	docker ps -a | grep ubuntu | grep 'date' | awk '{print $$1}' | xargs docker rm
