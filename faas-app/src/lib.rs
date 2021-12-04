use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hello(name: &str) -> String {
    format!("hello, {}", name)
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
