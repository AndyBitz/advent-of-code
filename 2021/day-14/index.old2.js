const fs = require('fs');

async function main() {
    const rules = new Map();

    let template = {
        repeats: new Map(),
        chain: [],
    };

    fs.readFileSync('./data.txt', 'utf8').split('\n').forEach(line => {
        if (line === '') {
            return;
        }

        if (line.includes('->')) {
            const [pair, insert] = line.split(' -> ');
            rules.set(pair, insert);
            return;
        }

        template = {
            repeats: new Map(),
            chain: line.split('').filter(c => c !== ' '),
        };
    });

    // console.log(templateToString({
    //     repeats: new Map([[17, 1]]),
    //     chain: 'NBBNBNBBCCNBCNCCNBBNBBBNBBNBBCBHCBHHNHCBBCBHCB'.split(''),
    // }).split('').reduce((out, next, index) => `${out}${index % 3 === 0 ? ' ' : ''}${next || ''}`, ''));
    // console.log(``)

    // return;

    // console.log(template);

    const steps = 10;

    for (let step = 0; step < steps; step++) {
        template = getNextTemplate(rules, template);
        // console.log(`After step ${step + 1}`, templateToString(template));
        // console.log(template);
        // console.log('');
    }

    console.log(templateToString(template));

    const charsWithCount = new Map();
    for (const { char } of iterateWithNext(template)) {
        charsWithCount.set(char, (charsWithCount.get(char) || 0) + 1);
    }

    const sortedChars = Array.from(charsWithCount).sort((a, b) => {
        return b[1] - a[1];
    });

    const mostCommon = sortedChars[0];
    const leastCommon = sortedChars[sortedChars.length - 1];
    console.log(`Subtract (Part 1): ${mostCommon[1] - leastCommon[1]}`);
    console.log(sortedChars);
}

function templateToString(template) {
    let str = '';
    
    for (const pair of iterateWithNext(template)) {
        str += pair.char;
    }

    return str;
}

// Iterate over the chain by considering the repeats
function *iterateWithNext(template) {
    let index = 0;

    while (true) {        
        const char = template.chain[index];
        const nextChar = template.chain[index + 1];

        if (!char) {
            break;
        }

        const repeats = template.repeats.get(index);

        if (!nextChar) {
            yield { index, char };
            break;
        }

        if (repeats) {
            const nextChars = template.chain.slice(index, index + 3);

            // Repeat the next 3 chars
            for (let i = 0; i < (repeats + 1); i++) {
                for (const charIndex in nextChars) {
                    yield {
                        index,
                        char: nextChars[charIndex],
                        nextChar: nextChars[charIndex % nextChars.length]
                    }
                }
            }

            // Skip the next two, since they were part of the repeat
            index += 3;
        } else {
            yield {
                index,
                char,
                nextChar,
            };

            index += 1;
        }
    }
}

function getNextTemplate(rules, template) {
    const nextChain = [];
    const nextRepeats = new Map();
    let wasLastRepeat = false;

    for (const pair of iterateWithNext(template)) {
        if (!pair.nextChar) {
            nextChain.push(pair.char);
            continue;
        }

        const text = `${pair.char}${pair.nextChar}`;

        const next = rules.get(text);
        const nextText = `${pair.char}${next}${pair.nextChar}`;

        if (nextChain.slice(-3).join('') === nextText) {
            const repeatIndex = nextChain.length - 3;
            nextRepeats.set(repeatIndex, (nextRepeats.get(repeatIndex) || 0) + 1);
            wasLastRepeat = true;
        } else {
            if (wasLastRepeat) {
                nextChain.push(next);
            } else {
                nextChain.push(pair.char, next);
            }

            wasLastRepeat = false;
        }
    }

    return { chain: nextChain, repeats: nextRepeats };
}

main().catch(console.error);

