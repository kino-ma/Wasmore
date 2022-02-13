use std::io;

use serde_json::{json, Value};

use faas_lib as lib;
use lib::Input;

fn main() {
    let stdin = io::stdin();
    let mut buf = String::new();
    stdin.read_line(&mut buf).unwrap();

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
            let input_str = input.input.as_str().expect("invalid string");
            json!(lib::hello(input_str))
        }

        _ => {
            panic!("unexpected input")
        }
    };

    print!(r#"{{"output":{}"#, output);
}
