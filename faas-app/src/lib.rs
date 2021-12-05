use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hello(name: &str) -> String {
    format!("hello, {}", name)
}

#[wasm_bindgen]
pub fn heavy_task(input: isize) -> isize {
    input.pow(2)
}

#[wasm_bindgen]
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
