use std::collections::{HashSet, HashMap};
use std::fs::File;
use std::io::{self, BufRead};

// - height map
// - local area from above
// - a is the lowest, z the highest
// - S is current position, which has a value of a
// - E is best signal, it has a value of z
// - can elevate only by one
// - elevation for target can much lower than current
// - can only move one square up, left, down, right

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
    let mut target = (0, 0);

    for (row, line) in lines.enumerate() {
        let mut squares = Vec::new();

        for (col, char) in line.unwrap().chars().into_iter().enumerate() {
            let value = match char {
                'S' => {
                    start = (row, col);
                    'a'
                },
                'E' => {
                    target = (row, col);
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
    println!("Destination at {:?}", target);

    print_grid(&grid);



    // function dijkstra(G, S)
    // for each vertex V in G
    //     distance[V] <- infinite
    //     previous[V] <- NULL
    //     If V != S, add V to Priority Queue Q
    // distance[S] <- 0
	
    // while Q IS NOT EMPTY
    //     U <- Extract MIN from Q
    //     for each unvisited neighbour V of U
    //         tempDistance <- distance[U] + edge_weight(U, V)
    //         if tempDistance < distance[V]
    //             distance[V] <- tempDistance
    //             previous[V] <- U
    // return distance[], previous[]

    // Queue to keep track of what has to be processed.
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

            let neighbour_distance = match distances.get(&neighbour) {
                Some(distance) => *distance,
                None => i32::MAX,
            };

            let temp_distance = parent_distance + 1;
            if neighbour_distance > temp_distance {
                distances.insert(neighbour, temp_distance);
                queue.push((temp_distance, neighbour));
            }
        }
    }

    println!("Visited {}", visited.len());

    // 526 is too high
    println!("Distance for target {}", distances.get(&target).unwrap());
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
    return  current > target || current == target || target == current + 1;
}
