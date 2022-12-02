const fs = require('fs');

async function main() {
    const data = fs.readFileSync('./data.txt', 'utf8').split('\n').map(line => line.split('-'));

    const pathMap = data.reduce((all, [key, value]) => {
        all.set(key, all.get(key) || new Set());
        all.set(value, all.get(value) || new Set());
        all.get(key).add(value);
        all.get(value).add(key);
        return all;
    }, new Map());

    const terminatedPaths = [];
    
    const tryPath = (prevPath, next) => {
        const isNextLarge = next === next.toUpperCase();

        if (next === 'end') {
            prevPath.push('end');
            terminatedPaths.push(prevPath)
            return;
        }

        // If it is a small cave, and we already visited it, then it's ignored
        if (!isNextLarge && prevPath.includes(next)) {
            return;
        }

        const nextCaves = pathMap.get(next);
        if (nextCaves) {
            const newPath = [...prevPath, next]; // Do not push, copy the path instead.
            nextCaves.forEach(nextCave => tryPath(newPath, nextCave));
        }
    };

    pathMap.get('start').forEach(next => tryPath(['start'], next));

    console.log(terminatedPaths);
    console.log(terminatedPaths.length);
}

main().catch(console.error);
