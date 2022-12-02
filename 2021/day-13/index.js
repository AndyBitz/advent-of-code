const fs = require('fs');

async function main() {
    const coordinates = [];
    const instructions = [];

    let sheetX = 0;
    let sheetY = 0;

    fs.readFileSync('./data2.txt', 'utf8').split('\n').forEach((line) => {
        if (!line) {
            return;
        }

        if (line.startsWith('fold along')) {
            const [direction, value] = line.slice(11).split('=');
            instructions.push({ direction, value: parseInt(value) });
            return;
        }

        const [_x, _y] = line.split(',');
        const x = parseInt(_x);
        const y = parseInt(_y);
        sheetX = Math.max(sheetX, x + 1);
        sheetY = Math.max(sheetY, y + 1);
        coordinates.push([x, y]);
    });

    let sheet = [...Array(sheetY)].map(() => [...Array(sheetX)].map(() => '.'));
    coordinates.forEach(([x, y]) => {
        sheet[y][x] = '#';
    });

    for (const inst of instructions) {
        const nextSheet = foldSheetAt(sheet, inst.direction, inst.value);
        // printSheet('After cut', nextSheet);
        sheet = nextSheet;
    }

    printSheet('Final', sheet, null, null, true);

    const dots = sheet.reduce((dots, row) => {
        return dots + row.reduce((tot, char) => char === '#' ? tot + 1 : tot, 0);
    }, 0);

    console.log({ dots });
}

function foldSheetAt(sheet, direction, at) {
    // printSheet('Prepare cut', sheet, direction, at);

    const sheet1 = [];
    const sheet2 = [];

    // Cut the sheet in line and put one in sheet1 and the other in sheet2
    sheet.forEach((row, rowIndex) => {
        if (direction === 'y') {
            if (rowIndex < at) {
                // Put in sheet 1
                sheet1.push([...row]);
            }

            if (rowIndex > at) {
                // Put in sheet 2
                sheet2.push([...row]);
            }

            return;
        } else {
            sheet1.push(row.slice(0, at));
            sheet2.push(row.slice(at + 1));
        }
    });

    // printSheet('Sheet 1', sheet1);
    // printSheet('Sheet 2', sheet2);

    // Can one sheet be bigger than the other?
    if (sheet1.length < sheet2.length) throw new Error('sheet2 is higher');
    if (sheet1[0].length < sheet2[0].length) throw new Error('sheet2 is broader');

    // Put sheet 2 on sheet 1 in reverse order depending on the direction
    sheet2.forEach((row, rowIndex) => {
        const rowOnFirst = direction === 'y' ? (sheet1.length - 1) - rowIndex : rowIndex;

        row.forEach((char, charIndex) => {
            if (char === '#') {
                const colOnFirst = direction === 'x' ? (sheet1[0].length - 1) - charIndex : charIndex;
                sheet1[rowOnFirst][colOnFirst] = '#';
            }
        });
    });

    return sheet1;
}

function printSheet(title, sheet, direction, at, dotsOnly = false) {
    console.log(title, direction ? `(Cutting at ${direction}=${at})` : '');
    sheet.forEach((row, rowIndex) => {
        if (direction === 'y' && rowIndex === at) {
            process.stdout.write('-'.repeat(row.length));
            process.stdout.write('\n');
            return
        }

        row.forEach((char, charIndex) => {
            if (direction === 'x' && charIndex === at) {
                process.stdout.write('|');
                return;
            }

            if (dotsOnly) {
                process.stdout.write(char === '#' ? char : ' ');
            } else {
                process.stdout.write(char);
            }
        });

        process.stdout.write('\n');
    });
    console.log('');
}

main().catch(console.error);
