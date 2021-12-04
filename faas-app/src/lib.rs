use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn console_log(s: &str);
}

#[wasm_bindgen]
pub fn hello(name: &str) {
    let greet = format!("hello, {}", name);
    console_log(&greet);
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
