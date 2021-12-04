default: run

run: faas-app/pkg/faas_app.js
	yarn run start

faas-app/pkg/faas_app.js: faas-app/src/lib.rs
	cd faas-app && wasm-pack build --target nodejs