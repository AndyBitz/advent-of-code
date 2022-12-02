const fs = require('fs');



async function main() {
    const rules = new Map();

    let countsPerChar = new Map();
    let pairCount = new Map();
    let leftOver = [];

    fs.readFileSync('./data1.txt', 'utf8').split('\n').forEach(line => {
        if (line === '') {
            return;
        }

        if (line.includes('->')) {
            const [pair, insert] = line.split(' -> ');
            rules.set(pair, insert);
            return;
        }

        line.split('').forEach((char, charIndex, line) => {
            countsPerChar.set(char, (countsPerChar.get(char) || 0) + 1);

            const nextChar = line[charIndex + 1];
            if (!nextChar) {
                leftOver.push(char);
                return;
            }

            const pair = `${char}${nextChar}`;
            pairCount.set(pair, (pairCount.get(pair) || 0) + 1);
        });
    });
    
    const steps = 40;
    for (let step = 0; step < steps; step++) {
        let nextPairCount = new Map();
        let nextCountsPerChar = new Map();

        pairCount.forEach((count, pair) => {
            const [char1, char2] = pair.split('');
            const inBetween = rules.get(pair);
            const pair1 = [char1, inBetween];

            const nextPairs = [
                pair1,
                [inBetween, char2]
            ];

            pair1.forEach((char) => {
                nextCountsPerChar.set(char, (nextCountsPerChar.get(char) || 0) + count);
            });

            nextPairs.forEach(nextPair => {
                const nextPairStr = nextPair.join('');
                nextPairCount.set(nextPairStr, (nextPairCount.get(nextPairStr) || 0) + count);
            });
        });

        leftOver.forEach(char => {
            nextCountsPerChar.set(char, (nextCountsPerChar.get(char) || 0) + 1);
        });

        countsPerChar = nextCountsPerChar;
        pairCount = nextPairCount;
    }

    const sortedChars = Array.from(countsPerChar).sort((a, b) => {
        return b[1] - a[1];
    });

    const mostCommon = sortedChars[0];
    const leastCommon = sortedChars[sortedChars.length - 1];
    const result = mostCommon[1] - leastCommon[1];

    console.log({ sortedChars, result });
}

main().catch(console.console);
