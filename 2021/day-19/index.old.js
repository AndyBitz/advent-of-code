const fs = require('fs');

async function main() {
    const parsed = [];
    let current = [];

    fs.readFileSync('./data2.txt', 'utf8').split('\n').forEach(line => {
        if (line === '') {
            return;
        }

        if (line.startsWith('--- scanner ')) {
            if (current.length) {
                parsed.push(current);
            }
            current = [];
            return;
        }

        const [x, y, z] = line.split(',').map(x => parseInt(x));
        current.push({ x, y, z });
    });
    parsed.push(current);
    current = null;

    const [originScanner, ...scanners] = parsed;

    const beacons = new Map();

    // Add all beacons from the 1st scanner
    originScanner.forEach(beacon => {
        beacons.set(getKey(beacon), beacon);
    });
    
    // Create a map of all vectors
    const vectors = new Map();

    const updateVectors = () => {
        for (const beacon of beacons.values()) {
            for (const beacon2 of beacons.values()) {
                if (beacon === beacon2) {
                    continue;
                }
    
                const vector = getVector(beacon, beacon2);
                const key = getKey(vector);
                vectors.set(key, vector);
            }
        }
    };
    
    updateVectors(); // Initialize `vectors`

    console.log('vectors', vectors);
    console.log('beacons', beacons);
    
    scanners.slice(0, 1).forEach((scanner) => {
        for (const beacon of scanner) {            
            for (const orientation of getAllOrientations()) {
                for (const mirror of [false, true]) {
                    let matches = 0;

                    scanner.forEach(relativeBeacon => {
                        if (beacon === relativeBeacon) {
                            return;
                        }

                        const vectorA = getVector(beacon, relativeBeacon);
                        const vectorB = rotateBy(vectorA, orientation);
                        const vectorC = mirror ? mirrorPoint(vectorB) : vectorB;
                        const key = getKey(vectorC);

                        if (vectors.has(key)) {
                            matches += 1;
                        }
                    });

                    // 11, because we check vectors, not points (True?)
                    if (matches >= 1) {
                        // We now know the rotation, next we need to find the transformation vector
                        const positions = scanner.map(b => {
                            const pointA = rotateBy(b, orientation);
                            const pointB = mirror ? mirrorPoint(pointA) : pointA;
                            return pointB;
                        });

                        console.log({ scanner, positions: positions.map(x => getKey(x)), orientation, mirror });
    
                        // Go through each new position, and 
                        for (const pos of positions) {
                            for (const beacon of beacons.values()) {
                                const vector = getVector(pos, beacon);
                                let matchedBeacons = 0;

                                scanner.forEach((relativeBeacon) => {
                                    const projected = applyVector(relativeBeacon, vector);
                                    // console.log(projected);
                                    const key = getKey(projected);
                                    if (beacons.has(key)) {
                                        matchedBeacons += 1;
                                    }
                                });

                                console.log({ matchedBeacons });
                            }
                        }

                        // updateVectors();

                        // return;
                        console.log('\n');
                    }
                }
            }
        }
    });

    console.log(`Beacons: ${beacons.size}`);
    // console.log(beacons);
}

function getRotationPresets() {
    const presets = [];
    presets.push({ axis: 'x', degree: 0 });

    for (const axis of ['x', 'y', 'z']) {
        for (const degree of [0, 90, 180, 270]) {
            presets.push({ axis, degree });
        }
    }

    return presets;
}

function getVector(start, end) {
    return {
        x: start.x - end.x,
        y: start.y - end.y,
        z: start.z - end.z,
    };
}

function applyVector(point, vector) {
    return {
        x: point.x + vector.x,
        y: point.y + vector.y,
        z: point.z + vector.z,
    };
}

function mirrorPoint({ x, y, z }) {
    return {
        x: x > 0 ? -x : x,
        y: y > 0 ? -y : y,
        z: z > 0 ? -z : z,
    };
}

function getKey({ x, y, z }) {
    return [x, y, z].join(',');
}

// It's possible for a scanner to have 24 different orientations
function getAllOrientations() {
    const unique = new Map();

    const axisList = [
        ['x'],
        ['y'],
        ['z'],
        ['x', 'y'],
        ['x', 'z'],
        ['y', 'z'],
        ['x', 'y', 'z']
    ];

    for (let degree of [0, 90, 180, 270]) {
        for (const axes of axisList) {
            const result = { x: 0, y: 0, z: 0 };
            axes.forEach(axis => {
                result[axis] = degree;
            });
            unique.set(getKey(result), result);
        }
    }

    return Array.from(unique.values());
}

function getAllRotations(origin) {
    const unique = new Map();
    unique.set(getKey(origin), origin);

    for (const axis of ['x', 'y', 'z']) {
        for (const degree of [0, 90, 180, 270]) {
            const r1 = rotate(origin, axis, degree);
            unique.set(getKey(r1), r1);
        }
    }

    return Array.from(unique.values());
}

function rotateBy(coords, instructions) {
    let output = { ...coords };
    output = rotate(output, 'x', instructions.x);
    output = rotate(output, 'y', instructions.y);
    output = rotate(output, 'z', instructions.z);
    return output;
}

function rotate({ x, y, z }, axis, degree) {
    if (degree === 0) {
        return { x, y, z };
    }

    const rad = degree * (Math.PI / 180); // x° × π/180

    if (axis === 'x') {
        return {
            x: x,
            y: Math.round(y * Math.cos(rad) - z * Math.sin(rad)),
            z: Math.round(y * Math.sin(rad) - z * Math.cos(rad)),
        };
    }

    if (axis === 'z') {
        return {
            x: Math.round(x * Math.cos(rad) - y * Math.sin(rad)),
            y: Math.round(x * Math.sin(rad) - y * Math.cos(rad)),
            z: z,
        };
    }

    if (axis === 'y') {
        return {
            x: Math.round(x * Math.cos(rad) - z * Math.sin(rad)),
            y: y,
            z: Math.round(x * Math.sin(rad) - z * Math.cos(rad)),
        };
    }

    return { x, y, z };
}

main().catch(console.error);
