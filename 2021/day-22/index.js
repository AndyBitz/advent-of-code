const fs = require('fs');

function getKey({ x, y, z }) {
    return [x, y, z].join(',');
}

class Cube {
    constructor() {
        this.range = {
            x: [-50, 50],
            y: [-50, 50],
            z: [-50, 50]
        };

        this.on = new Set();
    }

    updateRange(point) {
        const { x, y, z } = point;

        this.range.x[0] = Math.min(this.range.x[0], x);
        this.range.x[1] = Math.max(this.range.x[1], x);

        this.range.y[0] = Math.min(this.range.y[0], y);
        this.range.y[1] = Math.max(this.range.y[1], y);

        this.range.z[0] = Math.min(this.range.z[0], z);
        this.range.z[1] = Math.max(this.range.z[1], z);
    }

    isOn(point) {
        return this.on.has(getKey(point));
    }

    toggle(point, on) {
        this.updateRange(point);

        if (typeof on === 'boolean') {
            if (on) {
                this.on.add(getKey(point));
            } else {
                this.on.delete(getKey(point));
            }

            return;
        }

        if (this.isOn(point)) {
            this.on.delete(getKey(point));
        } else {
            this.on.add(getKey(point));
        }
    }

    count() {
        return this.on.size;
    }
}

function getCoords(range) {
    const final = [];

    const [xStart, xEnd] = range.x;
    const [yStart, yEnd] = range.y;
    const [zStart, zEnd] = range.z;

    for (let x = xStart; x <= xEnd; x++) {
        for (let y = yStart; y <= yEnd; y++) {
            for (let z = zStart; z <= zEnd; z++) {
                final.push({ x, y, z });
            }
        }
    }

    return final;
}

function inRange(input, range) {
    return (
        input.x[0] >= range.x[0] && input.x[1] <= range.x[1] &&
        input.y[0] >= range.y[0] && input.y[1] <= range.y[1] &&
        input.z[0] >= range.z[0] && input.z[1] <= range.z[1]
    );
}

async function part1(instructions) {
    const cube = new Cube();

    instructions.forEach(cmd => {
        if (!inRange(cmd.space, { x: [-50, 50], y: [-50, 50], z: [-50, 50] })) {
            return;
        }

        for (const point of getCoords(cmd.space)) {
            cube.toggle(point, cmd.on);
        }
    });

    console.log('Part 1 - On:', cube.count());
}

class Cube2 {
    constructor() {
        this.segments = new Map();
    }

    getSegmentKey(space) {
        const key = [];

        for (const axis of ['x', 'y', 'z']) {
            key.push(`${axis}=${space[axis].join('..')}`);
        }

        return key.join(',');
    }

    keyToSegment(key) {
        return key.split(',').map(axisAndRange => {
            const [axis, range] = axisAndRange.split('=');
            return { axis, range: range.split('..').map(x => parseInt(x)) };
        }).reduce((final, next) => {
            final[next.axis] = next.range;
            return final;
        }, {});
    }

    isOverlapping(a, b) {
        return (
            (a.x[0] <= b.x[1] && a.x[1] >= b.x[0]) &&
            (a.y[0] <= b.y[1] && a.y[1] >= b.y[0]) &&
            (a.z[0] <= b.z[1] && a.z[1] >= b.z[0])
        );
    }

    split(intruder, native) {
        const spaces = [];

        // Must split up the `native` cube into 6 pieces,
        // and one piece must match the overlap of the `intruder`.


        return spaces;
    }

    toggle(space, on) {
        const nextSegments = new Map();
        const overlaps = [];

        for (const [_segment, state] of this.segments) {
            const segment = this.keyToSegment(_segment);
            if (this.isOverlapping(space, segment)) {
                overlaps.push(segment);
                const splits = this.split(space, segment);
                // Split up the `segment`, and only add the non-overlapping back to `nextSegments`

            } else {
                nextSegments.set(_segment, state);
            }
        }

        if (on) {
            // No need to consider `on=false`, because those segments would
            // have been removed before.
            nextSegments.set(this.getSegmentKey(space), on);
        }

        this.segments = nextSegments;
    }

    count() {
        // Sum volumes
        return 0;
    }
}

function split(intruder, native) {
    const spaces = []; // Must be 5 at most

    const overlapping = {
        x: [],
        y: [],
        z: [],
    };

    for (const axis of ['x', 'y', 'z']) {
        if (native[axis][0] >= intruder[axis][1] || native[axis][1] >= intruder[axis][0]) {
            const pairs = [];

            let start = native[axis][0]; // Must start here
            let end = native[axis][1];

            if (intruder[axis][0] >= native[axis][0]) {
                end = intruder[axis][0] - 1;
                pairs.push([start, end]);
                start = end + 1;
                end = native[axis][1];
            }

            if (native[axis][1] >= intruder[axis][1]) {
                end = intruder[axis][1];
                pairs.push([start, end]);
                start = end + 1;
                end = native[axis][1];
            }

            pairs.push([start, end]);

            overlapping[axis] = pairs;
        }
    }

    //     3 4 5 6
    // 1 2 3
    //           6 7 8

    console.log(overlapping);

    return spaces;
}

// console.log(split({
//     x: [2, 5],
//     y: [2, 5],
//     z: [2, 5]
// }, {
//     x: [0, 3],
//     y: [0, 3],
//     z: [0, 3]
// }));

// console.log(split({
//     x: [1, 1],
//     y: [1, 1],
//     z: [1, 1]
// }, {
//     x: [0, 3],
//     y: [0, 3],
//     z: [0, 3]
// }));

// console.log(split({
//     x: [15, 15],
//     y: [5, 15],
//     z: [5, 15]
// }, {
//     x: [10, 20],
//     y: [10, 20],
//     z: [10, 20]
// }))

function getSegmentKey(space) {
    const key = [];

    for (const axis of ['x', 'y', 'z']) {
        key.push(`${axis}=${space[axis].join('..')}`);
    }

    return key.join(',');
}

function keyToSegment(key) {
    return key.split(',').map(axisAndRange => {
        const [axis, range] = axisAndRange.split('=');
        return { axis, range: range.split('..').map(x => parseInt(x)) };
    }).reduce((final, next) => {
        final[next.axis] = next.range;
        return final;
    }, {});
}

function getVolume(space) {
    const a = space.x[1] - space.x[0];
    const b = space.y[1] - space.y[0];
    const c = space.z[1] - space.z[0];
    return a * b * c;
}

function getIntersection(intruder, native) {
    if (
        (intruder.x[0] <= native.x[1] && intruder.x[1] >= native.x[0]) &&
        (intruder.y[0] <= native.y[1] && intruder.y[1] >= native.y[0]) &&
        (intruder.z[0] <= native.z[1] && intruder.z[1] >= native.z[0])
    ) {
        const space = {
            x: undefined,
            y: undefined,
            z: undefined,
        };

        for (const axis of ['x', 'y', 'z']) {
            let start = Math.max(intruder[axis][0], native[axis][0]);
            let end = Math.min(intruder[axis][1], native[axis][1]);

            // If `intruder` is completely inside of `native`
            if (native[axis][0] <= intruder[axis][0] && intruder[axis][1] <= native[axis][1]) {
                ([start, end] = intruder[axis]); // TODO: Does this work?
            }

            space[axis] = [start, end];
        }

        return space;
    }

    return null;
}

// console.log('here', getVolume(getIntersection({
//     x: [5, 15],
//     y: [5, 15],
//     z: [5, 15],
// }, {
//     x: [10, 20],
//     y: [10, 20],
//     z: [10, 20]
// })));

// TODO
async function part2(instructions) {
    const spaces = [];
    let on = 0;

    instructions.forEach(cmd => {
        const newSpaces = [];
        newSpaces.push([cmd.space, cmd.on]);

        on += getVolume(cmd.space);

        spaces.forEach(([space, state]) => {
            const inter = getIntersection(cmd.space, space);
            if (!inter) {
                return;
            }

            // console.log('intersection', {
            //     inter,
            //     interV: getVolume(inter),
            //     space,
            //     spaceV: getVolume(space),
            //     intruder: cmd.space,
            //     intruderV: getVolume(cmd.space),
            // });

            // 1. If `space` is on, and `cmd.space` is off,
            //    then add `inter` as off.
            if (state && !cmd.on) {
                on -= getVolume(inter);
                newSpaces.push([inter, false]);
                return;
            }

            // 2. If `space` is on, and `cmd.space` is on,
            //    then add `inter` as off to not count twice.
            if (state && cmd.on) {
                on -= getVolume(inter);
                newSpaces.push([inter, false]);
                return;
            }

            // 3. If `space` is off, and `cmd.space` is on,
            //    then there is no need to add `inter`, because just adding `cmd.space` will turn the correct section on again.

            // 4. If `space` is off, and `cmd.space` is off,
            //    then there is no need to add anything, because it won't be counted.
        });

        spaces.push(...newSpaces);
    });

    // console.log(JSON.stringify(spaces, null, 2));

    // const vol = spaces.reduce((vol, [space, state]) => {
    //     return vol + (getVolume(space) * (state ? 1 : -1));
    // }, 0);

    // 39764557678665 is too low
    // 1458991274581394 is too high
    console.log('Part 2 - On:', on);
    console.log('correct', on === 2758514936282235); // for data2.txt
}

async function main() {
    const instructions = [];

    fs.readFileSync('./data2.txt', 'utf8').split('\n').forEach((line) => {
        const [state, grid] = line.split(' ');

        const space = grid.split(',').map(area => {
            const [axis, range] = area.split('=');            
            return {
                axis,
                range: range.split('..').map(x => parseInt(x)),
            }
        });

        instructions.push({
            on: state === 'on',
            space: space.reduce((final, item) => {
                final[item.axis] = item.range;
                return final;
            }, {}),
        });
    });

    // await part1(instructions);
    await part2(instructions);
}

main().catch(console.error);
