const fs = require('fs');

async function main() {
    const data = fs.readFileSync('./data1.txt', 'utf8').split('\n').map(line => line.split('-'));

    const pathMap = data.reduce((all, [key, value]) => {
        all.set(key, all.get(key) || new Set());
        all.set(value, all.get(value) || new Set());
        all.get(key).add(value);
        all.get(value).add(key);
        return all;
    }, new Map());

    const terminatedPaths = [];

    const tryPath = (_pathInfo, next) => {      
        if  (next === 'start') {
            return; // Ignore
        }
          
        if (next === 'end') {
            _pathInfo.prevPath.push('end');
            terminatedPaths.push(_pathInfo);
            return;
        }

        // Copy the info
        const pathInfo = {
            prevPath: [..._pathInfo.prevPath],
            smallCaveTwice: _pathInfo.smallCaveTwice,
            smallCaves: new Set(_pathInfo.smallCaves),
        };

        const isNextLarge = next === next.toUpperCase();

        // This small cave was already visited, and we already visited another small cave twice
        if (
            !isNextLarge &&
            pathInfo.smallCaveTwice &&
            pathInfo.smallCaves.has(next)
        ) {
            return;
        }

        const nextCaves = pathMap.get(next);
        if (nextCaves) {
            pathInfo.prevPath.push(next);

            if (!isNextLarge) {
                if (pathInfo.smallCaves.has(next)) {
                    pathInfo.smallCaveTwice = next;
                }
    
                pathInfo.smallCaves.add(next);
            }

            nextCaves.forEach(nextCave => tryPath(pathInfo, nextCave));
        }
    };

    pathMap.get('start').forEach(next => tryPath({
        prevPath: ['start'],
        smallCaveTwice: null,
        smallCaves: new Set(),
    }, next));

    // terminatedPaths.forEach(pathInfo => {
    //     console.log(pathInfo.prevPath.join(','));
    // });

    // console.log('pathMap', pathMap);
    console.log(terminatedPaths.length);
}

main().catch(console.error);
