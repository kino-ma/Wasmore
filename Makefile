SHELL := /bin/bash
WASM_BIND := faas-app/pkg/faas_app.js
DOCKER_RUST_NAME := faas-app-rust
UNAME := $(shell uname)

ifeq (, $(shell which cargo))
	CARGO := $(DOCKER_RUST_EXEC) cargo
	DOCKER_RUST_CREATE := docker container create -it --name $(DOCKER_RUST_NAME) --volume "$$PWD/faas-app:/app" --workdir '/app' rust:latest bash
	DOCKER_RUST_START := docker start $(DOCKER_RUST_NAME)
	DOCKER_RUST_EXEC := docker exec -i faas-app-rust
else
	CARGO := cd faas-app && cargo
	DOCKER_RUST_CREATE := echo "cargo exists"
	DOCKER_RUST_START := echo "using host cargo"
	DOCKER_RUST_EXEC :=
endif

default: run

.PHONY: default run install wasm test test-js test-rs check check-rs check-js rust-container clean-container

run: faas-app/pkg/faas_app.js
	yarn run start

install: package.json
	$(DOCKER_RUST_CREATE)
	$(MAKE) rust-container
	$(CARGO) install wasm-pack
	$(MAKE) $(WASM_BIND)
	yarn
	docker pull ubuntu:latest
	@echo OK

rust-container:
	$(DOCKER_RUST_START)

bin:
	$(CARGO) build 

wasm: $(WASM_BIND)

$(WASM_BIND): faas-app/src/lib.rs rust-container
	$(DOCKER_RUST_EXEC) wasm-pack build

test: test-js test-rs
	@echo OK

test-js: clean-container
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

# ignore errors
clean-container:
	-docker ps -a | grep ubuntu | grep -E 'date|sleep' | awk '{print $$1}' | xargs docker rm -f
