use std::io::{BufRead};
use std::collections::HashSet;

fn main() {
    let file = std::fs::File::open("./input.txt").unwrap();
    let lines = std::io::BufReader::new(file).lines();

    let mut forest = Vec::new();

    for (_, line) in lines.enumerate() {
        let mut row = Vec::new();

        for (_, char) in line.unwrap().chars().enumerate() {
            row.push(char.to_string().parse::<usize>().unwrap());
        }

        forest.push(row);
    }

    let row_size = forest.len();
    let col_size = forest[0].len();

    let mut visible: HashSet<(usize, usize)> = HashSet::new();

    let check = |
        forest: &Vec<Vec<usize>>,
        coords: (usize, usize),
        visible: &mut HashSet<(usize, usize)>,
        last_max: &mut Option<usize>,
    | {
        let next_value = forest[coords.0][coords.1];

        if *last_max == None {
            *last_max = Some(next_value);
            visible.insert(coords);
            return;
        }

        if next_value > last_max.unwrap() {
            *last_max = Some(next_value);
            visible.insert(coords);
            return;
        }
    };

    // Walk down each column
    for col in 0..col_size {
        let mut last_max: Option<usize> = None;

        for row in 0..row_size {            
            check(&forest, (row, col), &mut visible, &mut last_max);
        }
    }

    // Walk up each column
    for col in (0..col_size).rev() {
        let mut last_max: Option<usize> = None;

        for row in (0..row_size).rev() {
            check(&forest, (row, col), &mut visible, &mut last_max);
        }
    }

    // Walk right each row
    for row in 0..row_size {
        let mut last_max: Option<usize> = None;

        for col in 0..col_size {
            check(&forest, (row, col), &mut visible, &mut last_max);
        }
    }

    // Walk left each row
    for row in (0..row_size).rev() {
        let mut last_max: Option<usize> = None;

        for col in (0..col_size).rev() {
            check(&forest, (row, col), &mut visible, &mut last_max);
        }
    }

    // Find the most scenic tree
    let mut best_tree = ((0, 0), 0);
    for row in 0..row_size {
        for col in 0..col_size {
            let score = get_tree_score(&forest, &(row, col));
            if score > best_tree.1 {
                best_tree.0 = (row, col);
                best_tree.1 = score;
            }
        }
    }

    // Visualize the forest
    for row in 0..row_size {
        for col in 0..col_size {
            if visible.contains(&(row, col)) {
                print!("X");
            } else {
                print!("-");
            }
        }
        print!("\n");
    }

    println!("Visible Trees: {} (correct={})", visible.len(), visible.len() == 1672);
    println!("Most scenic tree: {:?} (correct={})", best_tree, best_tree.1 == 327180);
}

fn get_tree_score(forest: &Vec<Vec<usize>>, tree: &(usize, usize)) -> usize {
    let mut scores = [0; 4];
    let height = forest[tree.0][tree.1];

    // Walk up
    for row in (0..(tree.0)).rev() {
        scores[0] += 1;
        if forest[row][tree.1] >= height { break; }
    }

    // Walk down
    for row in (tree.0 + 1)..forest.len() {
        scores[1] += 1;
        if forest[row][tree.1] >= height { break; }
    }

    // Walk right
    for col in (tree.1 + 1)..forest[0].len() {
        scores[2] += 1;
        if forest[tree.0][col] >= height { break; }
    }

    // Walk left
    for col in (0..(tree.1)).rev() {
        scores[3] += 1;
        if forest[tree.0][col] >= height { break; }
    }

    let mut total = 1;
    for score in scores {
        total *= score
    }

    return total;
}
