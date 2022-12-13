use std::collections::{HashSet, HashMap};
use std::fs::File;
use std::io::{self, BufRead};

struct Node {
    text: char,
    value: usize,
    coords: (usize, usize),
}

fn main() {
    let file = File::open("./input.txt").unwrap();
    let lines = io::BufReader::new(file).lines();

    let mut levels = HashMap::new();
    
    let mut grid = Vec::new();

    let mut start = (0, 0);
    // let mut target = (0, 0); // Part 1

    for (row, line) in lines.enumerate() {
        let mut squares = Vec::new();

        for (col, char) in line.unwrap().chars().into_iter().enumerate() {
            let value = match char {
                'S' => {
                    // start = (row, col); // Part 1
                    'a'
                },
                'E' => {
                    // target = (row, col); // Part 1
                    start = (row, col); // Part 2
                    'z'
                },
                c => c,
            };

            squares.push(Node {
                text: value,
                value: value as usize,
                coords: (row, col),
            });

            levels.insert((row, col), 0);
        }

        grid.push(squares);
    }

    println!("Starting at {:?}", start);

    print_grid(&grid);

    // Queue to keep track of what has to be processed.
    // First part is the distance, which is used as priority.
    // The lowest value should be processed next to find the shortest path.
    // Second part are the coordinates of the node.
    let mut queue: Vec<(i32, (usize, usize))> = Vec::new();
    queue.push((0, start));

    // Keep track of which nodes where already processed.
    let mut visited: HashSet<(usize, usize)> = HashSet::new();

    // Keep track of all the dinstances each node has.
    let mut distances = HashMap::new();
    distances.insert(start, 0);

    loop {
        if queue.len() == 0 {
            break;
        }

        queue.sort();

        let next_node = queue.remove(0).1;
        let parent_distance = distances.get(&next_node).unwrap().clone();
        visited.insert(next_node);

        for neighbour in get_surroundings(&next_node, &grid) {
            if visited.contains(&neighbour) {
                continue;
            }

            // Use `i32::MAX` aka Infinity if we didn't process the node yet.
            // Otherwise we'll use the distance that was calculated before.
            let neighbour_distance = match distances.get(&neighbour) {
                Some(distance) => *distance,
                None => i32::MAX,
            };

            // Caclulate the new distance from the parent to the current node.
            let temp_distance = parent_distance + 1;

            // If the new distance is lower than the previous one,
            // we update the node and add the node to the queue to keep walking
            if neighbour_distance > temp_distance {
                distances.insert(neighbour, temp_distance);
                queue.push((temp_distance, neighbour));
            }
        }
    }

    println!("Visited {}", visited.len());

    // Part 1: 472 
    // println!("Distance for target {}", distances.get(&target).unwrap());

    // Find the `a` node with the lowest distances
    let mut lowest = i32::MAX;
    for row in grid {
        for col in row {
            if col.text == 'a' {
                let distance = distances.get(&col.coords);
                if distance == None {
                    continue;
                }

                let distance = distance.unwrap();
                if lowest > *distance {
                    lowest = *distance;
                }
            }
        }
    }

    // Part 2: 465
    println!("Shortest path from any a {}", lowest);
}

fn print_grid(grid: &Vec<Vec<Node>>) {
    for row in grid {
        for square in row {
            print!("{}", square.text);
        }
        print!("\n");
    }
}

/**
 * Returns the surrounding squares that can be accessed from one square.
 * Can be viewed as the children of one Node.
 */
fn get_surroundings(coords: &(usize, usize), grid: &Vec<Vec<Node>>) -> Vec<(usize, usize)> {
    let mut surroundings = Vec::new();

    // Up - cannot be lower than 0
    if coords.0 > 0 {
        surroundings.push((coords.0 - 1, coords.1));
    }

    // Down - cannot be more than `grid.len()` 
    if (grid.len() - 1) > coords.0 {
        surroundings.push((coords.0 + 1, coords.1));
    }

    // Left - cannot be lower than 0
    if coords.1 > 0 {
        surroundings.push((coords.0, coords.1 - 1));
    }

    // Right - cannot be more than `grid[0].len()`
    if (grid[0].len() - 1) > coords.1 {
        surroundings.push((coords.0, coords.1 + 1));
    }

    let mut accessible = Vec::new(); 
    for surrounding in surroundings {
        if can_access(coords, &surrounding, grid) {
            accessible.push(surrounding);
        }
    }

    return accessible;
}

/**
 * Compares the value of two nodes and returns `true` if the `current` node
 * can access the `target` node.
 */
fn can_access(current: &(usize, usize), target: &(usize, usize), grid: &Vec<Vec<Node>>) -> bool {
    let current = grid[current.0][current.1].value;
    let target = grid[target.0][target.1].value;
    // Part 1
    // return  current > target || current == target || target == current + 1;

    // Part 2
    return target > current || current == target || target + 1 == current;
}
