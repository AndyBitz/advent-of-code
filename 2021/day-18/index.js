const assert = require('assert');

class Node {
    constructor({ parent, left, right }) {
        this.parent = parent || null;
        this.left = left;
        this.right = right;
    }

    static fromList(list, parent = null) {
        const [left, right] = list;
        const newNode = new Node({ parent });
        newNode.left = typeof left === 'number' ? left : Node.fromList(left, newNode);
        newNode.right = typeof right === 'number' ? right : Node.fromList(right, newNode);
        return newNode;
    }

    explode(level = 0) {
        const nextLevel = level + 1;

        if (level === 4) {
            if (typeof this.left === 'number' && typeof this.right === 'number') {
                // Find the next right regular number
                // - Going up in the same tree means to always check right
                // - If we were at the top, we need to go down to the left
                const update = (to) => {
                    const inverted = to === 'right' ? 'left' : 'right';

                    let current = this.parent;
                    let direction = to;
                    let previous = this;

                    while (current) {
                        if (current[direction] !== this && typeof current[direction] === 'number') {
                            current[direction] += this[to];
                            break;
                        }

                        const keptPrevious = previous;
                        previous = current;

                        if (current[direction] === keptPrevious) {
                            current = current.parent;
                        } else {
                            current = current[direction];
                            direction = inverted;
                        }
                    }
                };

                update('left');
                update('right');

                const originalDirection = this.parent.left === this
                    ? 'left'
                    : 'right';

                this.parent[originalDirection] = 0;

                return true;
            }

            return false;
        }

        if (typeof this.left !== 'number') {
            if (this.left.explode(nextLevel)) {
                return true;
            }
        }

        if (typeof this.right !== 'number') {
            if (this.right.explode(nextLevel)) {
                return true;
            }
        }

        return false;
    }

    // If any regular number is 10 or greater, the leftmost such regular number splits.

    // To split a regular number, replace it with a pair;
    // the left element of the pair should be the regular number divided by two
    // and rounded down, while the right element of the pair should be the regular number
    // divided by two and rounded up.
    // For example, 10 becomes [5,5], 11 becomes [5,6], 12 becomes [6,6], and so on.
    split() {
        const search = (direction) => {
            const value = this[direction];

            if (typeof value === 'number') {
                if (value >= 10) {
                    this[direction] = new Node({
                        parent: this,
                        left: Math.floor(value / 2),
                        right: Math.ceil(value / 2),
                    });
                    return true;
                }

                return false;
            } else {
                const result = value.split();
                if (result) {
                    return result;
                }
            }

            return false;
        };

        return search('left') || search('right') || false;
    }

    // 3 times the magnitude of its left element plus 2 times the magnitude of its right
    magnitude() {
        const left = typeof this.left === 'number'
            ? this.left
            : this.left.magnitude();
        const right = typeof this.right === 'number'
            ? this.right
            : this.right.magnitude();

        return 3 * left + 2 * right;
    }

    print(asArray = false) {
        if (asArray) {
            console.log(JSON.stringify(this.asArray()));
        } else {
            console.log(JSON.stringify(this.asJSON(), null, 2));
        }
    }

    asJSON() {
        return {
            left: typeof this.left === 'number' ? this.left : this.left.asJSON(),
            right: typeof this.right === 'number' ? this.right : this.right.asJSON(),
        };
    }

    asArray() {
        const { left, right } = this;
        return [
            typeof left === 'number' ? left : left.asArray(),
            typeof right === 'number' ? right : right.asArray(),
        ];
    }
    
    static addLists(list1, list2) {
        const node = Node.fromList(list1 && list2 ? [list1, list2] : list1 || list2);

        while (true) {
            if (node.explode()) {
                continue;
            }

            if (node.split()) {
                continue;
            }

            break;
        }

        return node;
    }
}

async function main() {
    await tests();

    const { input } = require('./data1.json');
    // const input = [
    //     [[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]
    //     ,[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]
    //     ,[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]
    //     ,[[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]
    //     ,[7,[5,[[3,8],[1,4]]]]
    //     ,[[2,[2,2]],[8,[8,1]]]
    //     ,[2,9]
    //     ,[1,[[[9,3],9],[[9,0],[0,7]]]]
    //     ,[[[5,[7,4]],7],1]
    //     ,[[[[4,2],2],6],[8,7]]
    // ];

    const finalNode = input.reduce((last, next) => {
        return Node.addLists(last ? last.asArray() : last, next);
    }, null);

    // 149 is too low
    // 2121 is too low

    // finalNode.print();
    // console.log('Expected: [[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]');
    process.stdout.write('Received: ');
    finalNode.print(true);

    console.log('Magnitude', finalNode.magnitude());

    let maxMagnitude = 0;
    
    // Part 2: Try every number with each other in both orders
    input.forEach((first, indexFirst) => {
        input.forEach((second, indexSecond) => {
            if (indexFirst === indexSecond) {
                return;
            }

            const result = Node.addLists(first, second);
            maxMagnitude = Math.max(result.magnitude(), maxMagnitude);
        });
    });

    console.log({ maxMagnitude });
}

async function tests() {
    const node = Node.fromList([[[[7,8],[6,6]],[[6,0],[7,7]]],[[[7,8],[8,8]],[[7,9],[0,6]]]]);
    assert(node.magnitude() === 3993);
    
    const matchesExplode = [
        {
            input: [[[[[9,8],1],2],3],4],
            output: [[[[0,9],2],3],4]
        },
        {
            input: [7,[6,[5,[4,[3,2]]]]],
            output: [7,[6,[5,[7,0]]]]
        },
        {
            input: [[6,[5,[4,[3,2]]]],1],
            output: [[6,[5,[7,0]]],3]
        },
        {
            input: [[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]],
            output: [[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]
        },
        {
            input: [[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]],
            output: [[3,[2,[8,0]]],[9,[5,[7,0]]]]
        },
        {
            input: [[[[[1,1],[2,2]],[3,3]],[4,4]], [5,5]],
            output: [[[[0,[3,2]],[3,3]],[4,4]],[5,5]]
        },
        {
            input: [[[[0,[3,2]],[3,3]],[4,4]],[5,5]],
            output: [[[[3,0],[5,3]],[4,4]],[5,5]]
        }
    ];
    
    // const node = Node.fromList(matchesExplode[5].input);
    // node.print();
    // node.print(true);
    // node.explode();
    // node.print(true);
    // if (1) process.exit(0);

    matchesExplode.forEach((match, index) => {
        const node = Node.fromList(match.input);
        node.explode();

        const actual = JSON.stringify(node.asArray());
        const expected = JSON.stringify(match.output);

        assert(
            expected === actual,
            `Failed match at index "${index}".\nExpected: ${expected}\nReceived: ${actual}`
        );
    });

    const matchesSplit = [
        {
            input: [[[[0,7],4],[15,[0,13]]],[1,1]],
            output: [[[[0,7],4],[[7,8],[0,13]]],[1,1]]
        },
        {
            input: [[[[0,7],4],[[7,8],[0,13]]],[1,1]],
            output: [[[[0,7],4],[[7,8],[0,[6,7]]]],[1,1]]
        }
    ];

    matchesSplit.forEach((match, index) => {
        const node = Node.fromList(match.input);
        node.split();

        const actual = JSON.stringify(node.asArray());
        const expected = JSON.stringify(match.output);
        
        assert(
            expected === actual,
            `Failed match at index "${index}".\nExpected: ${expected}\nReceived: ${actual}`
        );
    });
    
    {
        const node = Node.fromList([[[[6,6],[7,6]],[[7,7],[7,0]]],[[[7,7],[7,7]],[[7,8],[9,9]]]]);
        const expected = 4140;
        const actual = node.magnitude();
        assert(expected === actual, `Wrong magnitude:\nExpected: ${expected}\nReceived: ${actual}`);
    }
}

main().catch(console.error);
