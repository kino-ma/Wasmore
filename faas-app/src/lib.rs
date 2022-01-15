#[cfg(feature = "wasm")]
#[crate_type = "cdylib"]

#[cfg(feature = "bin")]
#[crate_type = "lib"]

use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn hello(name: &str) -> String {
    format!("hello, {}", name)
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn heavy_task(input: isize) -> isize {
    let mut sum = 0;
    for _ in 1..=input {
        sum += input;
    }
    sum
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn light_task(input: isize) -> isize {
    input + input
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
}
