use core::panic;
use std::fs::File;
use std::io::{self, BufRead};

// A = Rock
// B = Paper
// C = Scissors

// X = Rock     = 1
// Y = Paper    = 2
// Z = Scissors = 3

// 0 on loss
// 3 on tie
// 6 on win

// Me
//         Enemy
// Rock <- Paper <- Scissors <- Rock
// 1       2        3           1

#[derive(Debug)]
enum State {
    Loss = 0,
    Tie = 3,
    Win = 6,
}

fn main() {
    part1();
    part2();
}

fn part1() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    let mut total = 0;

    for line in lines {
        let line = line.unwrap();

        let enemy = match line.get(0..1).unwrap() {
            "A" => 1,
            "B" => 2,
            "C" => 3,
            _ => panic!("Unexpected enemy response.")
        };

        let own = match line.get(2..3).unwrap() {
            "X" => 1,
            "Y" => 2,
            "Z" => 3,
            _ => panic!("I am confused.")
        };

        let state = if own == enemy {
            State::Tie
        } else if enemy == 3 && own == 1 { // Scissor vs. Rock
            State::Win
        } else if enemy == 1 && own == 3 { // Rock vs. Scissor
            State::Loss
        } else if own > enemy {
            State::Win
        } else {
            State::Loss
        };

        let score = state as i32 + own;
        total += score;
    }

    println!("Final score: {}", total);
}

fn part2() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    let mut total = 0;

    for line in lines {
        let line = line.unwrap();

        let enemy = match line.chars().nth(0).unwrap() {
            'A' => 1,
            'B' => 2,
            'C' => 3,
            _ => panic!("Unexpected enemy response.")
        };

        let expected_state = match line.chars().nth(2).unwrap() {
            'X' => State::Loss,
            'Y' => State::Tie,
            'Z' => State::Win,
            _ => panic!("I am confused.")
        };

        let own = match expected_state {
            State::Loss => if (enemy - 1) == 0 { 3 } else { enemy - 1 },
            State::Win => if (enemy + 1) == 4 { 1 } else { enemy + 1},
            State::Tie => enemy,
        };

        let score = expected_state as i32 + own;
        total += score;
    }

    println!("Final score: {}", total);
}
