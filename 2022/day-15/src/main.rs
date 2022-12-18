use std::io::BufRead;

#[derive(Debug)]
struct Sensor {
    pos: (i64, i64),
    distance: i64,
}

fn main() {
    let file = std::fs::File::open("./input.txt").unwrap();
    let lines = std::io::BufReader::new(file).lines();

    // Example
    // let line = 11;
    // let cutoff = 20;

    // Actual
    let line = 2_000_000;
    let cutoff = 4_000_000;

    let mut sensors = Vec::new();

    for line in lines {
        let line = line.unwrap();
        let (sensor, beacon) = line.split_once(":").unwrap();

        let sensor = &sensor[10..];
        let beacon = &beacon[22..];

        let sensor_parts = sensor.split_once(", ").unwrap();
        let beacon_parts = beacon.split_once(", ").unwrap();

        let sensor = (
            sensor_parts.1[2..].parse::<i64>().unwrap(),
            sensor_parts.0[2..].parse::<i64>().unwrap()
        );

        let beacon = (
            beacon_parts.1[2..].parse::<i64>().unwrap(),
            beacon_parts.0[2..].parse::<i64>().unwrap()
        );

        let row_start = std::cmp::min(sensor.0, beacon.0);
        let row_end = std::cmp::max(sensor.0, beacon.0);

        let col_start = std::cmp::min(sensor.1, beacon.1);
        let col_end = std::cmp::max(sensor.1, beacon.1);

        let distance = (row_end - row_start) + (col_end - col_start);

        sensors.push(Sensor {
            pos: sensor,
            distance,
        });
    }

    let mut sections = Vec::new();

    for sensor in &sensors {
        match get_line_intersection(line, sensor) {
            Some(inter) => sections.push(inter),
            None => {},
        };
    }

    sections.sort();
    let sections = merge(sections).0;

    let mut verified = 0;
    for section in &sections {
        verified += section.1 - section.0;
    }

    // Result for Part 1: 5_166_077
    println!("Line {} has {} fields that are not an option.", line, verified);

    // Part 2 - Go over each line until the cutoff
    'outer: for line in 0..=cutoff {
        let mut sections = Vec::new(); 

        for sensor in &sensors {
            match get_line_intersection(line, sensor) {
                Some(inter) => {
                    // Save the section, but already do the cutoff
                    let start = std::cmp::max(0, inter.0);
                    let end = std::cmp::min(cutoff, inter.1);

                    if end >= start {
                        sections.push((start, end));
                    }
                },
                None => {},
            };
        }

        sections.sort();

        let mut last_index = 0;        
        let sections = merge(sections).0;

        for index in 0..=sections.len() {
            let next = match sections.get(index) {
                Some(s) => s.clone(),
                None => (cutoff, cutoff)
            };

            if last_index + 2 == next.0 {
                last_index += 1;
                break;
            }

            last_index = next.1;
        }

        if last_index != cutoff {
            // Part 2: 13_071_206_703_981
            let tuning_frequency = (4_000_000 * last_index) + line;
            println!("Tuning frequency: {}", tuning_frequency);
            break 'outer;
        }
    }
}

fn get_line_intersection(line: i64, sensor: &Sensor) -> Option<(i64, i64)> {
    let top = sensor.pos.0 - sensor.distance;
    let bottom = sensor.pos.0 + sensor.distance;

    if line < top || line > bottom {
        return None; // Does not intersect.
    }

    // Check the distance from the sensor to the line,
    // what's left can be used as boundary for the columns.
    let start = std::cmp::min(line, sensor.pos.0);
    let end = std::cmp::max(line, sensor.pos.0);

    let distance_left = sensor.distance - (end - start);
    return Some((sensor.pos.1 - distance_left, sensor.pos.1 + distance_left));
}

fn merge(sections: Vec<(i64, i64)>) -> (Vec<(i64, i64)>, usize) {
    let mut merged = Vec::new();
    let mut counter = 0;

    let mut first = sections[0];

    for section in sections[1..].into_iter() {
        if first.1 >= section.0 {
            first.1 = std::cmp::max(first.1, section.1);
        } else {
            merged.push(section.clone());
            counter += 1;
        }
    }

    if counter > 0 {
       merged = merge(merged).0;
    }

    merged.push(first);
    merged.sort();

    return (merged, counter);
}
