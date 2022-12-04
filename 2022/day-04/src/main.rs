use std::fs::File;
use std::io::{self, BufRead};

fn main() {
    part1();
}

fn parse_line(line: &String) -> ((i32, i32), (i32, i32)) {
    let mut range_a = (0, 0);
    let mut range_b = (0, 0);

    let mut split = line.split(",");
    let a = split.next().unwrap();
    let b = split.next().unwrap();

    let mut a_split = a.split('-');
    range_a.0 = a_split.next().unwrap().parse::<i32>().unwrap();
    range_a.1 = a_split.next().unwrap().parse::<i32>().unwrap();

    let mut b_split = b.split('-');
    range_b.0 = b_split.next().unwrap().parse::<i32>().unwrap();
    range_b.1 = b_split.next().unwrap().parse::<i32>().unwrap();

    return (range_a, range_b);
}

/// Checks if b is within a.
fn is_within(a: (i32, i32), b: (i32, i32)) -> bool {
    return a.0 <= b.0 && a.1 >= b.1;
}

/// Checks if a overlaps with
fn is_overlapping(a: (i32, i32), b: (i32, i32)) -> bool {
    return a.0 <= b.1 && b.0 <= a.1;
}

fn part1() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    let mut overlaps = 0;
    let mut contained = 0;

    for line in lines {
        let line = line.unwrap();
        let (range_a, range_b) = parse_line(&line);

        if is_within(range_a, range_b) || is_within(range_b, range_a) {
            contained += 1;
        }

        if is_overlapping(range_a, range_b) || is_overlapping(range_b, range_a) {
            overlaps += 1;
        }
    }

    println!("Result - Part 1: {} (correct={})", contained, contained == 584);
    println!("Result - Part 2: {} (correct={})", overlaps, overlaps == 933);
}
