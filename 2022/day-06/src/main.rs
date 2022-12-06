use std::fs::File;
use std::collections::HashSet;
use std::io::{self, Read};

fn main() {
    let file = File::open("./input.txt").unwrap();
    let bytes = io::BufReader::new(file).bytes();

    let check_len = (4, 1282);
    // let check_len = (14, 3513);

    let mut last = vec![];
    let mut index = 0;

    for byte in bytes {
        index += 1;
        
        let char: char = byte.unwrap().try_into().unwrap();
        last.push(char);

        if last.len() == check_len.0 + 1 {
            last.remove(0);
        }

        let uniq: HashSet<&char> = last.iter().collect();

        if uniq.len() == check_len.0 {
            println!("First unique set of {} at {} (correct={})", check_len.0, index, index == check_len.1);
            break;
        }
    }
}
