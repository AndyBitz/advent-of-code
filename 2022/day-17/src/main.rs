use std::io::Read;

// - in narrow chamber
// - rocks with specifc shape fall down
// - rocks fall in the order shown
// - need to find out where they'll fall
// - # is rock and . is empty space
// - jet patterns move the rocks into a direction
// - < means push to leaft, > means push to right
// - jet pattern repeats itself once done
// - champer is exactly 7 units wide
// - when a rock appears:
//      - left edge is two units away
//      - its bottom edge is three units above the highest rock in the room
//        (or the room if there isn't one)
// - jet movement will not happen if it gets pushed into a wall, rock, or floor
// - check how tall the tower is after 2022 iterations

fn get_rock() -> Vec<Vec<char>> {

}

// Rocks:
// ####

// .#.
// ###
// .#.

// ..#
// ..#
// ###

// #
// #
// #
// #

// ##
// ##

fn main() {
    let file = std::fs::File::open("./example.txt").unwrap();
    let mut jets: Vec<char> = std::io::BufReader::new(file).bytes()
        .into_iter().map(|b| b.unwrap() as char).collect();

    // Start the empty chamber, which is 7 wide, and 3 heigh
    let mut chamber = vec![vec!['.'; 7]; 3];

    println!("jets {:?}", jets);

    loop {
        break;
    }
}
