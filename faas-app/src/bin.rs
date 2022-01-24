use std::env;
use std::io;

use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use faas_lib as lib;

#[derive(Serialize, Deserialize)]
struct Input<T> {
    input: T,
}

fn main() {
    let stdin = io::stdin();

    let output: Value = match env::args().nth(1).unwrap().as_str() {
        "light" => {
            let input = read_input(stdin);
            let output = lib::light_task(input);
            json!(output)
        }

        "heavy" => {
            let input = read_input(stdin);
            let output = lib::heavy_task(input);
            json!(output)
        }

        "hello" => {
            let input: String = read_input(stdin);
            json!(lib::hello(&input))
        }

        _ => {
            panic!("unexpected input")
        }
    };

    print!(r#"{{"output":{}"#, output);
}

fn read_input<T: DeserializeOwned>(stream: std::io::Stdin) -> T {
    let input: Input<T> = serde_json::from_reader(stream).expect("invalid input");
    input.input
}
