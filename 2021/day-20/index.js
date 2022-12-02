const fs = require('fs');

function getKey(x, y) {
    return [x, y].join(',');
}

class InputImage {
    constructor() {
        this.map = new Set();

        this.startX = 0;
        this.endX = 0;
        this.startY = 0;
        this.endY = 0;

        this.defaultChar = '.';
    }

    // Convert a 2D array to an InputImage
    static fromArray(list) {
        const img = new InputImage();
        img.endX = list.length;
        img.endY = list[0].length;
        
        list.forEach((row, rowIndex) => {
            row.forEach((char, colIndex) => {
                if (char === '#') {
                    img.set(rowIndex, colIndex);
                }
            });
        });

        return img;
    }

    getBounds(other) {
        this.startX = other.startX;
        this.endX = other.endX;
        this.startY = other.startY;
        this.endY = other.endY;
    }

    get(x, y) {
        // If it's outside of the bounds, we have to assume whats at alg[0]
        if (
            x < this.startX || x > this.endX ||
            y < this.startY || y > this.endY
        ) {
            return this.defaultChar;
        }

        return this.map.has(getKey(x, y)) ? '#' : '.';
    }

    set(x, y, empty = false) {
        this.startX = Math.min(x, this.startX);
        this.endX = Math.max(x, this.endX);

        this.startY = Math.min(y, this.startY);
        this.endY = Math.max(y, this.endY);

        if (!empty) {
            this.map.add(getKey(x, y));
        }
    }

    *iterate() {
        const startX = this.startX - 1;
        const endX = this.endX + 1;
        const startY = this.startY - 1;
        const endY = this.endY + 1;

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                yield {
                    x,
                    y,
                };
            }
        }
    }

    getSurroundings(pixel) {
        const { x, y } = pixel;
        const coords = [];

        for (let row = -1; row < 2; row++) {
            for (let col = -1; col < 2; col++) {
                coords.push({ x: x + row, y: y + col });
            }
        }

        return coords;
    }

    getBinary(pixel) {
        const coords = this.getSurroundings(pixel);
        const final = [];
        coords.forEach(({ x, y }) => {
            const c = this.get(x, y) === '#' ? '1' : '0';
            final.push(c);
        });
        return parseInt(final.join(''), 2);
    }

    print() {
        let lastX = this.startX;

        for (const pixel of this.iterate()) {
            if (pixel.x !== lastX) {
                process.stdout.write('\n');
                lastX = pixel.x;
            }

            process.stdout.write(this.get(pixel.x, pixel.y));
        }

        process.stdout.write('\n');
    }
}

async function main() {
    const alg = [];
    const input = [];

    fs.readFileSync('./data1.txt', 'utf8').split('\n').forEach((line, index) => {
        if (index === 0) {
            alg.push(...line.split(''));
            return;
        }

        if (line === '') {
            return;
        }

        input.push(line.split(''));
    });

    let lastImage = InputImage.fromArray(input);

    // lastImage.print();
    // console.log('\n');
    
    const steps = 50;
    
    for (let step = 0; step < steps; step++) {
        let nextImage = new InputImage();

        // 511 is `111111111` in binary,
        // so if 0 is # and 511 is . then they're inverting each other with each step
        if (alg[511] === '.' && lastImage.defaultChar === '#') {
            nextImage.defaultChar = '.';
        } else if (alg[0] === '#' && lastImage.defaultChar === '.') {
            nextImage.defaultChar = '#';
        }

        nextImage.getBounds(lastImage);

        for (const pixel of lastImage.iterate()) {
            const bin = lastImage.getBinary(pixel);
            const newPixel = alg[bin];
            nextImage.set(pixel.x, pixel.y, newPixel !== '#');
        }

        // nextImage.print();
        // console.log('\n');
        lastImage = nextImage;
    }

    // Expected answer is 5571
    // lastImage.print();
    console.log('Light', lastImage.map.size);
}

main().catch(console.error);
