use std::fs::File;
use std::io::BufRead;
use std::collections::HashMap;

#[derive(Debug, PartialEq, Eq)]
enum NodeKind {
    File,
    Directory,
}

#[derive(Debug)]
struct Node {
    id: usize,
    parent: Option<usize>,
    name: Option<String>,
    children: HashMap<String, usize>,
    kind: NodeKind,
    size: Option<usize>,
}

#[derive(Debug)]
struct Tree {
    list: Vec<Node>,
}

impl Tree {
    fn new() -> Tree {
        let mut list = Vec::new();

        let root = Node {
            id: 0,
            parent: None,
            children: HashMap::new(),
            name: None,
            kind: NodeKind::Directory,
            size: None,
        };

        list.push(root);

        let tree = Tree {
            list,
        };

        return tree;
    }

    fn add(&mut self, parent: usize, name: String, kind: NodeKind, size: Option<usize>) -> usize {
        let id = self.list.len();

        let node = Node {
            id,
            parent: Some(parent),
            name: Some(name.clone()),
            children: HashMap::new(),
            kind,
            size,
        };

        self.list.push(node);
        assert_eq!(self.list.last().unwrap().id, id);

        self.list[parent].children.insert(name, id);

        return id;
    }

    fn get(&self, id: usize) -> &Node {
        return &self.list[id];
    }
}

fn main() {
    let file = File::open("./input.txt").unwrap();
    let lines = std::io::BufReader::new(file).lines();

    let mut tree = Tree::new();
    let mut cd = 0;

    for line in lines {
        let line = line.unwrap();

        if line.starts_with("$ ") {
            let mut cmd_iter = line[2..].split(" ");
            let cmd = cmd_iter.next().unwrap();
            let arg = match cmd_iter.next() {
                Some(arg) => arg,
                None => ""
            };

            // println!("cmd={} arg={}", cmd, arg);

            match cmd {
                "ls" => {
                    // no-op, next line will just read the output
                },
                "cd" => {
                    match arg {
                        "/" => {
                            cd = 0;
                        },
                        ".." => {
                            cd = tree.get(cd).parent.unwrap();
                        },
                        _ => {
                            cd = *tree.get(cd).children.get(arg).unwrap();
                        },
                    };
                },
                _ => panic!("Unexpected command: {}", cmd),
            };
        } else {
            let (type_or_size, name) = line.split_once(" ").unwrap();

            match type_or_size {
                "dir" => {
                    tree.add(cd, name.to_string(), NodeKind::Directory, None);
                },
                _ => {
                    tree.add(cd, name.to_string(), NodeKind::File, Some(type_or_size.parse::<usize>().unwrap()));
                },
            };
        }
    }

    let mut total = 0;
    let mut directories = Vec::new();

    let space_used = get_size_recur(&tree, 0, &mut total, &mut directories, 0);

    let space_max = 70_000_000;
    let space_required = 30_000_000;
    let space_left = space_max - space_used;

    let space_to_free = space_required - space_left;

    // println!("Space used {}", space_used);
    // println!("Space left {}", space_left);
    // println!("Space to free {}", space_to_free);
    
    println!("Total: {}", total);
    println!("Size of directory to delete: {}", find_directory_to_delete(&directories, &space_to_free));
}

fn get_size_recur(tree: &Tree, id: usize, total: &mut usize, list: &mut Vec<(String, usize)>, level: usize) -> usize {
    let mut size_of_current = 0;

    let node = tree.get(id);

    for (_name, child_id) in node.children.iter() {
        let child = tree.get(*child_id);

        if child.kind == NodeKind::Directory {
            size_of_current += get_size_recur(&tree, child.id, total, list, level + 1);
        } else {
            size_of_current += child.size.unwrap();
        }
    }

    if node.id != 0 {
        list.push((node.name.as_ref().unwrap().clone(), size_of_current));
    }
 
    if size_of_current <= 100_000 {
        *total += size_of_current;
    }

    return size_of_current;
}

fn find_directory_to_delete(directories: &Vec<(String, usize)>, min_size: &usize) -> usize {
    let mut target_size = usize::MAX;

    for (_name, size) in directories.iter() {
        if size >= min_size {
            if target_size > *size {
                target_size = *size;
            }
        }
    }

    return target_size;
}
