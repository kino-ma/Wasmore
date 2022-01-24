mod nbody;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct Input {
    pub input: Value,
    pub task: String,
}

#[derive(Serialize, Deserialize)]
pub struct Output {
    output: Value,
}

pub fn main(args: Value) -> Result<Value, serde_json::Error> {
    let input: Input = serde_json::from_value(args)?;

    let output: Value = match input.task.as_str() {
        "light" => {
            let input = input.input.as_i64().expect("invalid number") as isize;
            let output = light_task(input);
            json!(output)
        }

        "heavy" => {
            let input = input.input.as_i64().expect("invalid number") as isize;
            let output = heavy_task(input);
            json!(output)
        }

        "hello" => {
            let input = input.input.to_string();
            json!(hello(&input))
        }

        _ => {
            panic!("unexpected input")
        }
    };

    return Ok(output);
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn hello(name: &str) -> String {
    format!("hello, {}", name)
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn heavy_task(input: isize) -> Box<[f64]> {
    let (a, b) = nbody::run(input as usize);
    Box::new([a, b])
}

/// Caluclates the Nth fibonacci number
#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn light_task(input: isize) -> isize {
    let n = input as usize;
    let mut fibs = vec![0isize; n + 1];
    fibs[1] = 1;

    for i in 2..=n {
        fibs[i] = fibs[i - 2] + fibs[i - 1];
    }

    return fibs[n];
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hello_works() {
        let expect = String::from("hello, rust-test");
        let actual = hello("rust-test");

        assert_eq!(expect, actual);
    }

    #[test]
    fn hundredth_fib() {
        let fib50 = light_task(50);

        assert_eq!(fib50, 12586269025)
    }
}
