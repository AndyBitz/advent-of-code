const fs = require('fs');

async function main() {
    const riskMap = fs.readFileSync('./data1.txt', 'utf8')
        .split('\n')
        .map(line => line.split('').map(char => parseInt(char)));

    const initialX = riskMap[0].length - 1;
    const initialY = riskMap.length - 1;

    riskMap.forEach((row, rowIndex) => {
        const sequence = [...row];
        for (let i = 0; i < initialY; i++) {
            const n = sequence.slice(-(initialX + 1)).map(v => v + 1 > 9 ? 1 : v + 1);
            sequence.push(...n);
        }

        row.push(...sequence.slice(initialX + 1, (initialX + 1) * 5))

        for (let i = 1; i < 5; i++) {
            const startAt = i * (initialX + 1);
            const endAt = startAt + ((initialX + 1) * 5);
            const index = (i * (initialX + 1)) + rowIndex;            
            riskMap[index] = sequence.slice(startAt, endAt);
        }
    });

    const unvisited = new Set();
    const distances = new Map();

    riskMap.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
            const coords = [rowIndex, colIndex].join(',');
            unvisited.add(coords);
        });
    });

    const endNode = [riskMap.length - 1, riskMap[0].length - 1];
    let current = [0, 0];
    distances.set(current.join(','), 0);

    // We'll need to iterate over distances,
    // so we'll keep this copy that already excludes the visited ones
    // to iterate faster over it.
    const dinstancesWithoutVisited = new Map(distances);

    console.log({ endNode });
    let counter = 0;

    while (true) {
        counter += 1;
        
        // For the current node, consider all of its unvisited neighbors and
        // calculate their tentative distances through the current node.
        const neighbors = getNeighbors(current, riskMap);
        const currentDistance = distances.get(current.join(',')) ?? Infinity;

        neighbors.forEach((neighbor) => {
            const txt = neighbor.join(',');
            
            if (!unvisited.has(txt)) {
                return;
            }

            const [y, x] = neighbor;

            // Compare the newly calculated tentative distance
            // to the current assigned value and assign the smaller one.
            const distance = riskMap[y][x];
            const newDistance = distance + currentDistance;
            const currentValue = distances.get(txt) ?? Infinity;

            if (newDistance < currentValue) {
                distances.set(txt, newDistance);
                dinstancesWithoutVisited.set(txt, newDistance);
            }
        });

        // Remove the current node from the unvisited set
        const currentTxt = current.join(',');
        unvisited.delete(currentTxt);
        dinstancesWithoutVisited.delete(currentTxt);

        // console.log({ distances });
        
        // If the destination node has been marked visited, then stop. 
        if (current.join(',') === endNode.join(',')) {
            break;
        }

        // Otherwise, select the unvisited node that is marked with
        // the smallest tentative distance, set it as the new current node,
        // and go back to step 3.
        const smallestUnvisited = getSmallestUnvisited(dinstancesWithoutVisited);
        if (!smallestUnvisited) {
            throw new Error('No options left.');
        }
        current = smallestUnvisited;
    }

    const distance = distances.get(current.join(','));
    console.log({ distance });

    /*
    const findPath = (path) => {
        const last = path[path.length - 1];
        const neighbors = getNeighbors(last, riskMap);

        let nextNeighbor = null;
        let nextNeighborDist = Infinity;

        neighbors.forEach((coords) => {
            const txt = coords.join(',');            
            if (distances.get(txt) < nextNeighborDist) {
                nextNeighbor = coords;
                nextNeighborDist = distances.get(txt);
            }
        });

        path.push(nextNeighbor);
        
        if (nextNeighborDist === 0) {
            return path;
        }

        return findPath(path);
    };

    // TODO: This is wrong
    const path = findPath([current]);

    printMap(riskMap, path);
    */
}

function getSmallestUnvisited(distances) {
    let shortestAt = null;
    let shortestDistance = Infinity;

    for (const [coords, distance] of distances) {
        if (distance < shortestDistance) {
            shortestDistance = distance;
            shortestAt = coords;
        }
    }

    return shortestAt?.split(',').map(x => parseInt(x));
}

function getNeighbors([y, x], map) {
    const neighbors = [];
    const maxY = map.length - 1;
    const maxX = map[0].length - 1;

    // Top
    if (0 <= y - 1) {
        neighbors.push([y - 1, x]);
    }

    // Bottom
    if (maxY >= y + 1) {
        neighbors.push([y + 1, x]);
    }

    // Left
    if (0 <= x - 1) {
        neighbors.push([y, x - 1]);
    }

    // Right
    if (maxX >= x + 1) {
        neighbors.push([y, x + 1]);
    }

    return neighbors;
}

function printMap(map, highlightPath = null) {
    const highlightSet = new Set();
    highlightPath?.forEach((coords) => {
        highlightSet.add(coords.join(','));
    });
    
    map.forEach((row, rowIndex) => {
        row.forEach((char, colIndex) => {
            if (highlightSet.has([rowIndex, colIndex].join(','))) {
                // Yellow
                process.stdout.write(`\x1b[33m${char}\x1b[0m`);
            } else {
                process.stdout.write(`${char}`);
            }
        });
        process.stdout.write('\n');
    });
    process.stdout.write('\n');
}

console.time('Exec');
main().catch(console.error).then(() => {
    console.timeEnd('Exec');
});
