use std::io::BufRead;
use std::collections::{HashMap, HashSet};

// - vulcano errupts in 30 minutes
// - network of pipes and pressure release valves
// - report is the flow rate of each valve (pressure per minute) (if open)
// - starting at valve AA
// - takes 1 minute to open a valve
// - takes 1 minute to go from on to the next

// - we don't have to open a valve to continue to the enxt
// - what's the most pressure that can be released in 30min?

#[derive(Debug)]
struct Valve {
    rate: i64,
    targets: Vec<String>,
}

fn main() {
    let file = std::fs::File::open("./example.txt").unwrap();
    let lines = std::io::BufReader::new(file).lines();

    let mut valves = HashMap::new();

    for line in lines {
        let line = line.unwrap();

        let (current, targets) = line.split_once("; ").unwrap();
        let name = &current[6..8];
        let rate = &current[23..].parse::<i64>().unwrap();

        let targets = if targets.starts_with("tunnels") {
            &targets[23..]
        } else {
            &targets[22..]
        };

        let targets: Vec<String> = targets
            .split(", ")
            .into_iter()
            .map(|s| s.to_string())
            .collect();

        valves.insert(name.to_string(), Valve {
            rate: *rate,
            targets
        });
    }

    // println!("{:?}", valves);

    let start = "AA".to_string();

    // - time
    // - rate
}
