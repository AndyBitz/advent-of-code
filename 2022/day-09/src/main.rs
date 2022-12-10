use std::fs::File;
use std::io::{self, BufRead};
use std::collections::HashSet;

fn main() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    // Keep track of the current position of each knot
    let mut head = (0, 0);
    let mut knots = vec![(0, 0); 9];

    // Keep track of all positions that the tail visited
    let mut visited: HashSet<(i32, i32)> = HashSet::new();
    visited.insert(knots.last().unwrap().clone());

    let mut head_visited: HashSet<(i32, i32)> = HashSet::new();

    for line in lines {
        let line = line.unwrap();

        let cmd = &line[0..1];
        let moves = &line[2..].parse::<usize>().unwrap();

        for _ in 0..*moves {
            match cmd {
                "R" => {
                    head.1 += 1;
                },
                "L" => {
                    head.1 -= 1;
                },
                "U" => {
                    head.0 += 1;
                },
                "D" => {
                    head.0 -= 1;
                },
                _ => panic!("Unexpected command: {}", cmd),
            }

            for knot_index in 0..knots.len() {
                let leader = if knot_index == 0 { head } else { knots[knot_index - 1] };
                let follower = knots[knot_index];

                if !in_proximity(&leader, &follower) {
                    knots[knot_index] = next_tail(&leader, &follower);

                    // Change to `knot_index == 0` for Part 1 solution.
                    if knot_index == knots.len() - 1 {
                        visited.insert(knots[knot_index]);
                    }
                }
                
            }

            head_visited.insert(head);
        }
    }
    
    print_visited(&visited);

    println!("Visited places: {}", visited.len());
}

/// Returns the next position of the tail to move it closer to the head.
fn next_tail(head: &(i32, i32), tail: &(i32, i32)) -> (i32, i32) {
    let mut next_tail = (tail.0, tail.1);

    // Is it top or bottom?
    if head.0 != tail.0 {
        next_tail.0 += if head.0 > tail.0 { 1 } else { -1 };
    }

    // Is it left or right?
    if head.1 != tail.1 {
        next_tail.1 += if head.1 > tail.1 { 1 } else { -1 };
    }

    return next_tail;
}

/// Returns `true` when the tail is in the proximity of the head,
/// or if they're overlapping.
fn in_proximity(head: &(i32, i32), tail: &(i32, i32)) -> bool {
    let row_start = head.0 - 1;
    let col_start = head.1 - 1;

    for row in row_start..=(row_start + 2) {
        for col in col_start..=(col_start + 2) {
            if row == tail.0 && col == tail.1 {
                return true;
            }
        }
    }

    return false;
}

/// Prints a grid of all visited places.
fn print_visited(visited: &HashSet<(i32, i32)>) {
    let mut length = (0, 0);
    let mut height = (0, 0);

    for coords in visited {
        if coords.0 > height.0 {
            height.0 = coords.0;
        }

        if coords.0 < height.1 {
            height.1 = coords.0;
        }

        if coords.1 < length.0 {
            length.0 = coords.1;
        }

        if coords.1 > length.1 {
            length.1 = coords.1;
        }
    }

    // println!("height {:?} - length {:?}", height, length);

    for row in (height.1..=height.0).rev() {
        for col in length.0..=length.1 {
            if visited.contains(&(row, col)) {
                print!("#");
            } else {
                print!(".");
            }
        }

        print!("\n");
    }

    print!("\n");
}
