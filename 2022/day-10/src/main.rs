use std::fs::File;
use std::io::{self, BufRead};

fn main() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    let mut signals = 0;

    let mut cycle = 0;
    let mut register_x = 1;

    for line in lines {
        let line = line.unwrap();

        if line == "noop" {
            next_cycle(&mut cycle, &mut signals, &mut register_x);
            continue;
        }

        // Expect that the only other command is `addx V`
        next_cycle(&mut cycle, &mut signals, &mut register_x);
        let value = &line[5..].parse::<i32>().unwrap();

        next_cycle(&mut cycle, &mut signals, &mut register_x);
        register_x += value;
    }

    println!("\nThe total signal strength is {}", signals);
}

fn next_cycle(cycle: &mut i32, signals: &mut i32, register_x: &mut i32) {
    // Part 2: Draw at the beginning of each cycle
    {
        let index = *cycle % 40;

        // Check if the sprite is visible by the current position.
        if *register_x - 1 <= index && index <= *register_x + 1 {
            print!("#");
        } else {
            print!(".");
        }

        if index == 39 {
            print!("\n");
        }
    }

    *cycle += 1;

    // Part 1: During each cycle
    if *cycle == 20 || *cycle % 40 == 20 {
        let signal = (*cycle) * (*register_x);
        *signals += signal;

        // println!("cycle={} x={} signal={}", cycle, register_x, signal);
    }
}
