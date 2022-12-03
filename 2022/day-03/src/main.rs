use std::collections::HashMap;
use std::fs::File;
use std::io::{self, BufRead};

fn main() {
    part1();
    part2();
}

fn part1() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    let mut result = 0;

    let mut map = HashMap::new();
    for (value, char) in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".chars().enumerate() {
        map.insert(char, value);
    }
    
    for line in lines {
        let line = line.unwrap();
        let middle = line.len() / 2;
        let mut in_first = [0; 2 * 26];

        for (index, char) in line.chars().enumerate() {   
            let value = map.get(&char).unwrap();

            if index >= middle {
                if in_first[*value] > 0 {
                    result += value + 1;
                    in_first[*value] = 0;
                }
                continue;
            }

            in_first[*value] += 1;
        }

    }

    println!("Result - Part 1: {} (correct={})", result, result == 8123);
}

fn part2() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    let mut result = 0;

    let mut map = HashMap::new();
    for (value, char) in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".chars().enumerate() {
        map.insert(char, value);
    }

    let mut in_group = [0; 52];

    for (index, line) in lines.enumerate() {
        let line = line.unwrap();
        let mut seen = [0; 52];

        if index % 3 == 0 {
            // Reset in_group to start with the next group
            in_group = [0; 52];
        }

        for char in line.chars() {   
            let value = map.get(&char).unwrap();
            if seen[*value] > 0 {
                continue;
            }

            seen[*value] = 1;
            in_group[*value] += 1;

            if in_group[*value] == 3 {
                result += value + 1;
            }
        }
    }

    println!("Result - Part 2: {} (correct={})", result, result == 2620);
}
