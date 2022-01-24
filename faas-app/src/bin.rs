use std::io;
use std::io::Read;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use faas_lib as lib;

#[derive(Serialize, Deserialize)]
struct Input {
    input: Value,
    task: String,
}

fn main() {
    let mut stdin = io::stdin();
    let mut buf = String::new();
    stdin.read_to_string(&mut buf).unwrap();

    let input: Input = serde_json::from_str(&buf).expect("invalid input");

    let output: Value = match input.task.as_str() {
        "light" => {
            let input = input.input.as_i64().expect("invalid number") as isize;
            let output = lib::light_task(input);
            json!(output)
        }

        "heavy" => {
            let input = input.input.as_i64().expect("invalid number") as isize;
            let output = lib::heavy_task(input);
            json!(output)
        }

        "hello" => {
            let input = input.input.to_string();
            json!(lib::hello(&input))
        }

        _ => {
            panic!("unexpected input")
        }
    };

    print!(r#"{{"output":{}"#, output);
}
