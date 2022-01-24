#[cfg(feature = "wasm")]
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
