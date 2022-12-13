use std::{io::BufRead, cmp::Ordering};

#[derive(Debug)]
enum Container {
    Value(usize),
    List(Vec<Container>),
}

fn main() {
    let file = std::fs::File::open("./input.txt").unwrap();
    let mut lines = std::io::BufReader::new(file).lines();

    let mut sum = 0;
    let mut index = 0;

    let mut list: Vec<(usize, Container)> = Vec::new();

    loop {
        let first = lines.next().unwrap().unwrap();
        let second = lines.next().unwrap().unwrap();

        let first = parse_line(first);
        let second = parse_line(second);

        index += 1;

        let result = compare(&first, &second).unwrap();
        // println!("Pair {} is {}", index, result);

        if result {
            sum += index;
        }

        list.push((list.len(), first));
        list.push((list.len(), second));

        match lines.next() {
            Some(_) => {},
            None => break,
        };
    }

    let sep_one_id = list.len();
    list.push((list.len(), parse_line("[[2]]".to_string())));

    let sep_two_id = list.len();
    list.push((list.len(), parse_line("[[6]]".to_string())));

    list.sort_by(|a, b| {
        if compare(&a.1, &b.1).unwrap() {
            return Ordering::Less;
        }

        return Ordering::Greater;
    });

    let mut decoder_key = 1;
    for (index, row) in list.iter().enumerate() {        
        if row.0 == sep_one_id || row.0 == sep_two_id {
            decoder_key *= index + 1;
        }
    }

    // for row in list {
    //     println!("Row: {:?}", row);
    // }

    println!("Decoder Key: {}", decoder_key); // Answer: 20592
    println!("Sum in indices from pairs in the right order: {}", sum); // Answer: 5252
}

fn compare(left: &Container, right: &Container) -> Option<bool> {
    match &left {
        Container::List(left_list) => {
            match &right {
                Container::List(right_list) => {
                    let size = if left_list.len() > right_list.len() { left_list.len() } else { right_list.len() };

                    for i in 0..size {
                        let left_value = left_list.get(i);
                        let right_value = right_list.get(i);

                        if left_value.is_none() && right_value.is_none() {
                            return None;
                        }

                        if left_value.is_some() && right_value.is_none() {
                            return Some(false);
                        }

                        if left_value.is_none() {
                            return Some(true);
                        }

                        let comp_value = compare(left_value.unwrap(), right_value.unwrap());
                        if comp_value.is_some() {
                            return comp_value;
                        }
                    }

                    return None;
                },
                Container::Value(right_value) => {
                    return compare(
                        left,
                        &Container::List(vec![Container::Value(*right_value)])
                    );
                },
            }
        },
        Container::Value(left_value) => {
            match &right {
                Container::List(_right_list) => {
                    return compare(
                        &Container::List(vec![Container::Value(*left_value)]),
                        right
                    );
                },
                Container::Value(right_value) => {
                    if right_value > left_value {
                        return Some(true);
                    }

                    if left_value > right_value {
                        return Some(false);
                    }

                    return None;
                },
            }
        },
    }
}

fn parse_line(line: String) -> Container {
    let mut stack = Vec::new();
    let mut current = Vec::new();
    let mut temp = Vec::new(); // Keep track of the current number chars

    for char in line.chars() {
        match char {
            '[' => {
                stack.push(current);
                current = Vec::new();
            },
            ']' => {
                if temp.len() > 0 {
                    let n = temp.iter().collect::<String>().parse::<usize>().unwrap();
                    current.push(Container::Value(n));
                    temp = Vec::new();
                }

                let mut last = stack.pop().unwrap();
                last.push(Container::List(current));
                current = last;
            },
            ',' => {
                if temp.len() > 0 {
                    let n = temp.iter().collect::<String>().parse::<usize>().unwrap();
                    current.push(Container::Value(n));
                    temp = Vec::new();
                }
            },
            n => {
                temp.push(n);
            }
        }
    }

    return Container::List(current);
}
