const fs = require('fs');

function getScanners() {
    const scanners = [];
    let current = [];

    fs.readFileSync('./data1.txt', 'utf8').split('\n').forEach((line) => {
        if (line === '') {
            return;
        }

        if (line.startsWith('--- scanner')) {
            if (current.length) {
                scanners.push(current);
                current = [];
            }
            return;
        }

        current.push(keyToPoint(line));
    });
    scanners.push(current);

    return scanners;
}

function getKey({ x, y, z }) {
    return [x, y, z].join(',');
}

function keyToPoint(key) {
    const [x, y, z] = key.split(',').map(x => parseInt(x));
    return { x, y, z };
}

function getVectorMap(beacons) {
    const vectors = new Map();

    beacons.forEach((beacon) => {
        beacons.forEach((beacon2) => {
            if (beacon === beacon2) {
                return;
            }

            const vector = getVector(beacon, beacon2);
            const key = getKey(vector);
            
            if (!vectors.has(key)) {
                vectors.set(key, []);
            }
            
            vectors.get(key).push(beacon, beacon2);
        });
    });

    return vectors;
}

function getVector(point1, point2) {
    return {
        x: point2.x - point1.x,
        y: point2.y - point1.y,
        z: point2.z - point1.z,
    };
}

// Prev impl.
// function rotateBy(coords, instructions) {
//     let output = { ...coords };
//     output = rotate(output, 'x', instructions.x);
//     output = rotate(output, 'y', instructions.y);
//     output = rotate(output, 'z', instructions.z);
//     return output;
// }

function rotateBy(coords, instructions) {
    let output = { ...coords };

    if (!Array.isArray(instructions)) {
        throw new Error(`Expected instructions to be an array.`);
    }

    instructions.forEach(inst => {
        let axis = null;
        if ('x' in inst) axis = 'x';
        if ('y' in inst) axis = 'y';
        if ('z' in inst) axis = 'z';

        if (axis) {
            output = rotate(output, axis, inst[axis]);
        }
    });

    return output;
}

function rotate(point, axis, degree) {
    const rad = degree * (Math.PI / 180); // x° × π/180
    
    if (axis === 'x') {        
        // | 1  0    0  |   | 1 |
        // | 0 cos -sin | * | 1 |
        // | 0 sin  cos |   | 0 |

        return {
            x: Math.round((1 * point.x) + (0 * point.y) + (0 * point.z)),
            y: Math.round((0 * point.x) + (Math.cos(rad) * point.y) + (-Math.sin(rad) * point.z)),
            z: Math.round((0 * point.x) + (Math.sin(rad) * point.y) + (Math.cos(rad) * point.z)),
        };
    }

    if (axis === 'y') {
        // | cos  sin  0  |   | 1 |
        // | 0     1   0  | * | 1 |
        // | -sin  0  cos |   | 0 |

        return {
            x: Math.round((Math.cos(rad) * point.x) + (Math.sin(rad) * point.y) + (0 * point.z)),
            y: Math.round((0 * point.x) + (1 * point.y) + (0 * point.z)),
            z: Math.round((-Math.sin(rad) * point.x) + (0 * point.y) + (Math.cos(rad) * point.z)),
        };
    }

    if (axis === 'z') {
        // | cos  -sin  0  |   | 1 |
        // | sin  cos   0  | * | 1 |
        // |  0    0    1  |   | 0 |

        return {
            x: Math.round((Math.cos(rad) * point.x) + (-Math.sin(rad) * point.y) + (0 * point.z)),
            y: Math.round((Math.sin(rad) * point.x) + (Math.cos(rad) * point.y) + (0 * point.z)),
            z: Math.round((0 * point.x) + (0 * point.y) + (1 * point.z)),
        };
    }

    throw new Error(`Unknown axis: "${axis}".`);
}

/**
 * Returns a list of possible rotations for each scanner.
 */
function legacy__getRotations() {
    const rotations = [];

    // For x positive (assume default)
    rotations.push(
        [], // x=0; y=0; z=0;
        [{ y: 90 }],
        [{ y: 180 }],
        [{ y: 270 }],
    );

    // For x negative
    rotations.push(
        [{ x: 180 }],
        [{ x: 180 }, { y: 90 }],
        [{ x: 180 }, { y: 180 }],
        [{ x: 180 }, { y: 270 }],
    );

    // For y positive
    rotations.push(
        [{ x: 90 }],
        [{ x: 90 }, { y: 90 }],
        [{ x: 90 }, { y: 180 }],
        [{ x: 90 }, { y: 270 }],
    );

    // For y negative
    rotations.push(
        [{ x: -90 }],
        [{ x: -90 }, { y: 90 }],
        [{ x: -90 }, { y: 180 }],
        [{ x: -90 }, { y: 270 }],
    );

    // For z positive
    rotations.push(
        [{ y: 90 }],
        [{ y: 90 }, { z: 90 }],
        [{ y: 90 }, { z: 180 }],
        [{ y: 90 }, { z: 270 }],
    );

    // For z nevative
    rotations.push(
        [{ y: -90 }],
        [{ y: -90 }, { z: 90 }],
        [{ y: -90 }, { z: 180 }],
        [{ y: -90 }, { z: 270 }],
    );

    return rotations;
}

function applyVector(point, vector) {
    return {
        x: point.x + vector.x,
        y: point.y + vector.y,
        z: point.z + vector.z,
    };
}

function getAllRotations() {
    const rotations = [];

    const axes = ['x', 'y', 'z'];
    const degrees = [0, 90, 180, 270];

    for (const axis1 of axes) {
        for (const degree1 of degrees) {
            rotations.push([
                { [axis1]: degree1 }
            ]);

            for (const axis2 of axes) {
                for (const degree2 of degrees) {
                    rotations.push([
                        { [axis1]: degree1 },
                        { [axis2]: degree2 },
                    ]);

                    for (const axis3 of axes) {
                        for (const degree3 of degrees) {
                            rotations.push([
                                { [axis1]: degree1 },
                                { [axis2]: degree2 },
                                { [axis3]: degree3 },
                            ]);
                        }
                    }
                    
                }            
            } 
            
        }
    }

    return rotations;
}

async function main() {
    // Parse the input and treat scanner 0 as the center
    const scanners = getScanners();
    const [origin] = scanners;

    const scannerPositions = new Map();
    scannerPositions.set(0, { x: 0, y: 0, z: 0 });

    // Find all vectors of the `origin` so that we can compare
    // the others to it.
    const maps = new Map();
    maps.set(0, getVectorMap(origin));

    // TODO: This can be improved, right now it goes through all possible rotations
    // that are valid, but some rotations yield the same result, so the number
    // of rotations can be reduced through some math somehow.
    const rotations = getAllRotations();

    const beaconsPerScanner = new Map();
    beaconsPerScanner.set(0, origin);

    const foundBeacons = new Set();
    origin.forEach(beacon => {
        foundBeacons.add(getKey(beacon));
    });

    // Go through each scanner
    let iterations = 0;

    while (maps.size !== scanners.length) {
        iterations += 1;

        if (iterations >= 10) {
            console.log(maps.size, scanners.length);
            throw new Error(`Too many iterations.`);
        }

        scanners.forEach((beacons, scannerIndex) => {
            if (maps.has(scannerIndex)) {
                return;
            }

            console.log(`Try scanner ${scannerIndex}.`);

            const currentVectors = getVectorMap(beacons);

            const rotationResult = (() => {
                // Find the correct rotation by matching with the previous
                // vector map.
                for (const [prevScanner, prevVectorMap] of maps) {
                    for (const rotation of rotations) {
                        const matchMap = new Map();

                        for (const [key, points] of currentVectors) {
                            const vector = keyToPoint(key);
                            const rotatedVector = rotateBy(vector, rotation);
                            const rotatedKey = getKey(rotatedVector);

                            // Need to compare to all other scanner maps
                            // to find the correct scanner it overlaps with.
                            if (prevVectorMap.has(rotatedKey)) {
                                matchMap.set(
                                    rotatedKey,
                                    points.map(point => rotateBy(point, rotation))
                                );
                            }
                        }

                        if (matchMap.size >= 6) {
                            return {
                                rotation,
                                matchMap,
                                prevVectorMap,
                                prevScanner
                            };
                        }
                    }
                }

                return null;
            })();

            if (!rotationResult) {
                // throw new Error('Could not find the rotation.');
                return; // Do not fail, but retry afterwards again when more scanners were found.
            }

            const { rotation, matchMap, prevVectorMap } = rotationResult;

            // This vector can be applied to all beacons
            // It is also the position of the scanner relative to scanner 0.
            const transformVector = (() => {
                let final = null;
                const verifySet = new Set();

                for (const [vectorKey, points] of matchMap) {
                    points.forEach((point, index) => {
                        const prevPoint = prevVectorMap.get(vectorKey)[index];
                        const vector = getVector(point, prevPoint); // TODO: Does order matter?
                        if (!final) final = vector;
                        verifySet.add(getKey(vector));
                    });
                }

                if (verifySet.size !== 1) {
                    throw new Error(`Failed to find transform vector.`);
                }

                return final;
            })();

            scannerPositions.set(scannerIndex, transformVector);
            const newBeacons = [];

            for (const beacon of beacons) {
                const beaconA = rotateBy(beacon, rotation);
                const beaconB = applyVector(beaconA, transformVector);
                const key = getKey(beaconB);
                foundBeacons.add(key);
                newBeacons.push(beaconB);
            }

            beaconsPerScanner.set(scannerIndex, newBeacons);
            maps.set(scannerIndex, getVectorMap(newBeacons));

            console.log(`Finished scanner ${scannerIndex}.`);
        });
    }

    // console.log('foundBeacons', foundBeacons);
    console.log('foundBeacons.size', foundBeacons.size);
    console.log('scannerPositions', scannerPositions);

    let longestDistance = 0;
    scannerPositions.forEach((point) => {
        scannerPositions.forEach((point2) => {
            if (point === point2) {
                return;
            }

            const dist = getManhattenDistance(point, point2);
            longestDistance = Math.max(dist, longestDistance);
        });
    });

    console.log({ longestDistance });

    // console.log(beaconsPerScanner);

    // console.log({ origin, scanners, vectorMap });
}

// 1105
// -92

// -92 + x = 1105
// x = 1105 - (-92) = 1197

// 1105 + x = -92
// x = -92 - 1105 = -1197


function getManhattenDistance(pointA, pointB) {
    let total = 0;
    
    for (const axis of ['x', 'y', 'z']) {
        total += Math.abs(pointA[axis] - pointB[axis]);
    }

    return total;
}

// (() => {
//     let rotations = getAllRotations();

//     const original = '-660,-479,-426';
//     const expected = '479,426,-660';
//     const point = keyToPoint(original);
//     console.log('point', point);

//     rotations = [];
//     rotations.push([ { x: 0 }, { z: 90 }, { x: 90 } ]);

//     for (const rotation of rotations) {
//         const after = rotateBy(point, rotation);
//         const key = getKey(after);
//         console.log(key, rotation);

//         if (key === expected) {
//             console.log('Found rotation', rotation);
//         }
//     }
    
//     // const otherRotations = getAllRotations();
//     // let currentPoint = { ...point };
//     // for (const rotation of otherRotations) {
//     //     const afterRotation = rotateBy(currentPoint, rotation);
//     //     const key = getKey(afterRotation);

//     //     if (key === expected) {
//     //         console.log('Found rotation', key);
//     //     }

//     //     currentPoint = afterRotation;
//     // }
// })();

main().catch(console.error);
