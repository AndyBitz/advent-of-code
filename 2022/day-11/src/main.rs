use std::fs::File;
use std::io::{self, BufRead};

fn lcm(a: u64, b: u64) -> u64 {
    (a * b) / gcd(a, b)
}

fn gcd(a: u64, b: u64) -> u64 {
    if b == 0 {
        a
    } else {
        gcd(b, a % b)
    }
}

#[derive(Clone, Copy, Debug)]
enum Operation {
    Add,
    Multiply,
}

#[derive(Clone, Copy, Debug)]
enum RHS {
    Old,
    Value(u64),
}

#[derive(Debug)]
struct Monkey {
    items_held: usize,

    items: Vec<u64>,

    operation: Operation,
    operation_rhs: RHS,

    test_divisor: u64,
    target_true: usize,
    target_false: usize,
}

impl Monkey {
    fn inspect(&mut self, total: usize, lcm: u64) -> Vec<Vec<u64>> {
        let mut push_result = vec![Vec::new(); total];

        for _ in 0..self.items.len() {
            self.items_held += 1;
            
            let item = self.items.remove(0);
            let item = self.operation(item, lcm); // Increase worry level

            // Part 1: Uncomment the divide by 3 part
            // let item = item / 3; // Always divided by 3 before check

            let target = self.get_target(item);
            push_result[target].push(item);
        }

        return push_result;
    }

    fn operation(&self, item: u64, lcm: u64) -> u64 {
        let value = match self.operation_rhs {
            RHS::Old => item,
            RHS::Value(val) => val,
        };

        return match self.operation {
            Operation::Add => (item + value) % lcm,
            Operation::Multiply => (item * value) % lcm,
        };
    }

    fn get_target(&self, item: u64) -> usize {
        return if item % self.test_divisor == 0 {
            self.target_true
        } else {
            self.target_false
        }
    }
}

fn main() {
    let file = File::open("./input.txt").unwrap();
    let mut lines = io::BufReader::new(file).lines();

    let mut monkeys: Vec<Monkey> = Vec::new();

    loop {
        lines.next(); // Ignore "Monkey"

        // Get Starting Items
        let line = lines.next().unwrap().unwrap();

        let mut items: Vec<u64> = Vec::new();

        for number in line[18..].split(", ") {
            items.push(number.parse::<u64>().unwrap());
        }

        // Get Operation
        let line = lines.next().unwrap().unwrap();

        let operator = &line[23..=23];
        let term = &line[25..];

        let operation_rhs = match term {
            "old" => {
                RHS::Old
            },
            _ => {
                RHS::Value(term.parse::<u64>().unwrap())
            },
        };

        let operation = match operator {
            "*" => {
                Operation::Multiply
            },
            "+" => {
                Operation::Add
            },
            _ => panic!("Unexpected operator: {}", operator),
        };

        // Get Test
        let line = lines.next().unwrap().unwrap();
        let test_divisor = line[21..].parse::<u64>().unwrap();

        // Get `true`
        let line = lines.next().unwrap().unwrap();
        let target_true = line[29..].parse::<usize>().unwrap();
        
        // Get `false`
        let line = lines.next().unwrap().unwrap();
        let target_false = line[30..].parse::<usize>().unwrap();

        // Add the monkey
        monkeys.push(Monkey {
            items_held: 0,
            items,
            operation,
            operation_rhs,
            test_divisor,
            target_false,
            target_true,
        });

        match lines.next() {
            None => break, // Exit the loop when no more lines are left
            _ => (), // Should be an empty string
        }
    }

    // Find the Least Common Multiple for the "Operation" step.
    // We need to find the LCM for all test divisors,
    // so that the result of the Operation step will not grow too large.
    let mut last_lcm = monkeys[0].test_divisor;
    for index in 1..monkeys.len() {
        last_lcm = lcm(last_lcm, monkeys[index].test_divisor);
    }

    // Start the stuff-slinging simian shenanigans
    // Part 1: 20
    // Part 2: 10_000
    for _round in 0..10_000 {    
        let monkey_len = monkeys.len();

        for index in 0..monkey_len {
            for (index, items) in monkeys[index].inspect(monkey_len, last_lcm).iter().enumerate() {
                let monkey = &mut monkeys[index];
                for item in items {
                    monkey.items.push(item.clone());
                }
            }
        }
    }

    let mut sorted: Vec<usize> = monkeys.iter().map(|m| m.items_held).collect();
    sorted.sort();
    sorted.reverse();

    let total = sorted[0] * sorted[1];
    println!("Level of monkey business: {}", total);
}
