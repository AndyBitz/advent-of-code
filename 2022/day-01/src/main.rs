use std::fs::File;
use std::io::{self, BufRead};

// - puzzle input is calories that each elf caries
// - inventory separated by empty line
// - each line is one food item, the calories of it

fn main() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    let mut top_three = [0, 0, 0];
    let mut current = 0;
    
    for line in lines {
        let line = line.unwrap();

        if line == "" {
            for (i, v) in top_three.iter().enumerate() {
                if current > *v {
                    top_three[i] = current;
                    top_three.sort();
                    break;
                }
            }

            current = 0;
            continue;
        }

        let number = i32::from_str_radix(&line, 10).unwrap();
        current += number;
    }

    let mut top_total = 0;
    for v in top_three {
        top_total += v;
    }

    println!("One Elf carries {} calories.", top_three.last().unwrap());

    println!("Top 3: {:?}", top_three);
    println!("Top 3 total: {}", top_total);
}
