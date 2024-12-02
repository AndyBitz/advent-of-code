use std::io::BufRead;

const SIZE: usize = 8000;

fn main() {
    let file = std::fs::File::open("./input.txt").unwrap();
    let lines = std::io::BufReader::new(file).lines();

    let mut grid = vec![vec!['.'; SIZE]; SIZE];
    let mut max_height = 0;

    // Apply all the scan lines to the grid
    for line in lines {
        let line = line.unwrap();

        let mut pairs: Vec<(usize, usize)> = line.split(" -> ").map(|pair| {
            let (n1, n2) = pair.split_once(",").unwrap();
            // Swap, because first one col, and second one is row
            return (n2.parse::<usize>().unwrap(), n1.parse::<usize>().unwrap());
        }).collect();

        let mut last = pairs.remove(0);
        grid[last.0][last.1] = '#';

        for pair in pairs {
            grid[pair.0][pair.1] = '#';

            // Walk on the row
            if last.1 == pair.1 {
                let start = if last.0 < pair.0 { last.0 } else { pair.0 };
                let end = if last.0 > pair.0 { last.0 } else { pair.0 };

                for row in start..end {
                    grid[row][pair.1] = '#';
                }
            }

            // Walk the column
            if last.0 == last.0 {
                let start = if last.1 < pair.1 { last.1 } else { pair.1 };
                let end = if last.1 > pair.1 { last.1 } else { pair.1 };

                for col in start..end {
                    grid[pair.0][col] = '#';
                }
            }

            if pair.0 > max_height {
                max_height = pair.0;
            }

            last = pair;
        }
    }

    for col in 0..grid[max_height + 2].len() {
        grid[max_height + 2][col] = '#';
    }

    // Let the sand drop
    let mut sand_still = 0;
    let mut sand_pos = (0, 500);

    let animate = true;

    loop {
        if animate {
            std::thread::sleep(std::time::Duration::from_millis(50));
            print_grid(&grid, &sand_pos, true);
        }

        // Check if bottom is out of bound
        if sand_pos.0 + 1 >= SIZE {
            break;
        }

        // Check below
        if grid[sand_pos.0 + 1][sand_pos.1] == '.' {
            sand_pos.0 += 1;
            continue;
        }

        // Check if left is out of bound
        if sand_pos.1 == 0 {
            break;
        }

        // Check bottom left
        if grid[sand_pos.0 + 1][sand_pos.1 - 1] == '.' {
            sand_pos.0 += 1;
            sand_pos.1 -= 1;
            continue;
        }

        // Check if right is out of bound
        if sand_pos.1 + 1 >= SIZE {
            break;
        }

        // Check bottom right
        if grid[sand_pos.0 + 1][sand_pos.1 + 1] == '.' {
            sand_pos.0 += 1;
            sand_pos.1 += 1;
            continue;
        }

        // Sand stopped, new sand will be dropped
        grid[sand_pos.0][sand_pos.1] = 'o';
        sand_still += 1;

        if sand_pos.0 == 0 && sand_pos.1 == 500 {
            break;
        }
        
        sand_pos = (0, 500);
    }

    if animate {
        print_grid(&grid, &sand_pos, false);
    }

    // Part 1: 838
    // Part 2: 27539
    println!("Amount of filled tiles: {}", sand_still);
}

fn print_grid(grid: &Vec<Vec<char>>, sand: &(usize, usize), reset: bool) {
    let mut output = Vec::new();
    
    for row in 0..40 {
        for col in 400..600 {
            if row == sand.0 && col == sand.1 {
                output.push("o".to_string());
            } else {
                output.push(format!("{}", grid[row][col]).to_string());
            }
        }
        output.push("\n".to_string());
    }

    print!("{}", output.join(""));

    if reset {
        print!("\x1b[40A");
    }
}
