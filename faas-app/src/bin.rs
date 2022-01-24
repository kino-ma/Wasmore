use std::env;
use std::io::stdin;

use faas_lib as lib;

fn main() {
    let input = stdin();

    let output: String = match env::args().nth(1).unwrap().as_str() {
        "light" => {
            let mut buf = String::new();
            input.read_line(&mut buf).expect("failed to read input");
            let arg = buf
                .trim()
                .parse::<isize>()
                .expect("Invalid input (it must be a number)");
            let output = lib::light_task(arg);
            output.to_string()
        }

        "heavy" => {
            let mut buf = String::new();
            input.read_line(&mut buf).expect("failed to read input");
            let arg = buf
                .trim()
                .parse::<isize>()
                .expect("Invalid input (it must be a number)");
            let output = lib::heavy_task(arg);
            output.to_string()
        }

        "hello" => {
            let mut buf = String::new();
            input.read_line(&mut buf).expect("failed to read input");
            lib::hello(&buf)
        }

        _ => {
            panic!("unexpected input")
        }
    };

    print!("{}", output);
}
