SHELL := /bin/bash
WASM_BIND := faas-app/pkg/faas_app.js
NATIVE_BUILD := faas-app/target/release/faas_bin
DOCKER_RUST_NAME := faas-app-rust
DOCKER_BIN_NAME := faas-bin
UNAME := $(shell uname)

ifeq (, $(shell which cargo))
	DOCKER_RUST_CREATE := docker container create -it --name $(DOCKER_RUST_NAME) --volume "$$PWD/faas-app:/app" --workdir '/app' rust:latest bash
	DOCKER_RUST_START := docker start $(DOCKER_RUST_NAME)
	DOCKER_RUST_EXEC := docker exec -i faas-app-rust
	CARGO := $(DOCKER_RUST_EXEC) cargo
else
	CARGO := cd faas-app && cargo
	DOCKER_RUST_CREATE := echo "cargo exists"
	DOCKER_RUST_START := echo "using host cargo"
	DOCKER_RUST_EXEC := cd faas-app &&
endif

default: run

.PHONY: default run install test test-js test-rs check check-rs check-js rust-container bin-runner clean-container

run:
	yarn run start

install: package.json
	$(DOCKER_RUST_CREATE)
	$(MAKE) rust-container
	$(CARGO) install wasm-pack
	$(MAKE) $(WASM_BIND)
	$(MAKE) bin
	yarn
	docker pull ubuntu:latest
	$(MAKE) bin-runner
	@echo OK

rust-container:
	$(DOCKER_RUST_START)

bin-runner: $(NATIVE_BUILD)
	docker build -t $(DOCKER_BIN_NAME):latest --no-cache .

bin: $(NATIVE_BUILD)

$(NATIVE_BUILD):
	$(CARGO) build --release

wasm: $(WASM_BIND)

$(WASM_BIND): faas-app/src/lib.rs
	$(DOCKER_RUST_EXEC) wasm-pack build --target nodejs . --features wasm

test: test-js test-rs
	@echo OK

test-js:
	@$(MAKE) clean-container &>/dev/null
	yarn test --detectOpenHandles
	@$(MAKE) clean-container &>/dev/null

test-rs: rust-container
	$(CARGO) test

check: check-rs check-js
	@echo OK

check-rs: rust-container
	$(CARGO) check

check-js:
	find . \
		-iname '*.js' \
type f \
		-not -path './node_modules/*' \
		-not -path './faas-app/pkg/*' \
		-exec node --check {} \;

# ignore errors
clean-container:
	-docker ps -a | grep -E 'ubuntu|faas-bin' | grep -E 'date|sleep' | awk '{print $$1}' | xargs docker rm -f
