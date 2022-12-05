use std::fs::File;
use std::io::{self, BufRead};

fn main() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    let mut stacks_part_1: Vec<Vec<char>> = vec![Vec::new(); 9];
    let mut stacks_part_2 = stacks_part_1.clone();

    let mut parsing = true;

    for (_, line) in lines.enumerate() {
        let line = line.unwrap();

        // Indicates the stack index - ignore
        if line.starts_with(" 1") {
            continue;
        }

        // Empty line indicates start of movement
        if line == "" {
            println!("Initial state:");
            for i in 0..stacks_part_1.len() {
                println!("{}: {:?}", i, stacks_part_1[i]);
            }
            println!("");

            stacks_part_2 = stacks_part_1.clone();
            parsing = false;

            continue;
        }

        if parsing {
            let chars: Vec<char> = line.chars().collect();

            for i in 0..9 {
                let value = chars.get(1 + i * 4);

                if value != None {
                    let value = value.unwrap();
                    if *value != ' ' {
                        stacks_part_1[i].insert(0, *value);
                    }
                }
            }
        } else {
            // Start applying the movement
            let parts: Vec<&str> = line.split(' ').collect();
            let amount: usize = parts[1].parse().unwrap();
            let origin: usize = parts[3].parse().unwrap();
            let destination: usize = parts[5].parse().unwrap();

            // println!("move={} from={} to={} - {:?} - {}", amount, origin, destination, parts, line);

            // Part 1
            for _ in 0..amount {
                let target = stacks_part_1[origin - 1].pop();
                if target != None {
                    stacks_part_1[destination - 1].push(target.unwrap());
                }
            }

            // Part 2
            {
                let add_pos = stacks_part_2[destination - 1].len();
                for _ in 0..amount {
                    let target = stacks_part_2[origin - 1].pop();
                    if target != None {
                        stacks_part_2[destination - 1].insert(add_pos, target.unwrap());
                    }
                }
            }
        }
    }

    {
        // Result for Part 1
        let mut result_part_1 = vec![];
        for i in 0..stacks_part_1.len() {
            let last = stacks_part_1[i].last().unwrap();
            if *last != ' ' {
                result_part_1.push(*last);
            }
        }

        println!("Result (Part 1): {} (expected: VCTFTJQCG)", result_part_1.into_iter().collect::<String>());
    }

    {
        // Result for Part 2
        let mut result_part_2 = vec![];
        for i in 0..stacks_part_2.len() {
            let last = stacks_part_2[i].last().unwrap();
            if *last != ' ' {
                result_part_2.push(*last);
            }
        }

        println!("Result (Part 2): {} (expected: GCFGLDNJZ)", result_part_2.into_iter().collect::<String>());
    }
}
