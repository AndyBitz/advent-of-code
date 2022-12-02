const fs = require('fs');

async function main() {
    let template = [];
    const rules = new Map();

    fs.readFileSync('./data.txt', 'utf8').split('\n').forEach(line => {
        if (line === '') {
            return;
        }

        if (line.includes('->')) {
            const [pair, insert] = line.split(' -> ');
            rules.set(pair, insert);
            return;
        }

        template = line.split('');
    });

    const steps = 20;

    for (let i = 0; i < steps; i++) {
        template = getNextTemplate(rules, template);
        console.log(`After step ${i + 1}`, template.slice(0, 20).join(''));
    }

    const charsWithCount = template.reduce((map, char) => {
        if (!map.has(char)) {
            map.set(char, 0);
        }
        map.set(char, map.get(char) + 1);
        return map;
    }, new Map());

    const sortedChars = Array.from(charsWithCount).sort((a, b) => {
        return b[1] - a[1];
    });

    const mostCommon = sortedChars[0];
    const leastCommon = sortedChars[sortedChars.length - 1];
    console.log(`Subtract (Part 1): ${mostCommon[1] - leastCommon[1]}`);
}

function getNextTemplate(rules, template) {
    const nextTemplate = [];

    template.forEach((char, charIndex) => {
        const nextChar = template[charIndex + 1];
        if (!nextChar) {
            nextTemplate.push(char);
            return;
        }

        const pair = `${char}${nextChar}`;
        const toInsert = rules.get(pair);
        if (!pair) throw new Error(`No pair for ${pair}.`);

        nextTemplate.push(char, toInsert);
    });

    return nextTemplate;
}

main().catch(console.error);

