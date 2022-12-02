const fs = require('fs');

const format = new Intl.NumberFormat('en-US').format;

async function getProgramm(file) {
    const instructions = [];

    fs.readFileSync(file, 'utf8').split('\n').forEach(line => {
        let [inst, target, extra] = line.split(' ');

        if (extra && !Number.isNaN(parseInt(extra))) {
            extra = parseInt(extra);
        }

        instructions.push([inst, target, extra ?? null]);
    });

    return instructions;
}

async function runProgramm(programm, inputs) {
    // Initalize the registers
    const registers = {
        w: 0,
        x: 0,
        y: 0,
        z: 0,
    };

    programm.forEach(([inst, arg1, arg2]) => {
        const value1 = registers[arg1];
        const value2 = arg2 !== null
            ? (typeof arg2 === 'string' ? registers[arg2] : arg2)
            : null;

        if (inst === 'inp') {
            registers[arg1] = inputs.shift();
            return;
        }

        if (inst === 'add') {
            registers[arg1] = value1 + value2;
            return;
        }

        if (inst === 'mul') {
            registers[arg1] = value1 * value2;
            return;
        }

        if (inst === 'div') {
            if (value2 === 0) {
                throw new Error(`Tried to run "div ${value1} ${value2}" (${inst} ${arg1} ${arg2})`);
            }

            const result = value1 / value2;
            const rounded = result > 0 ? Math.floor(result) : Math.ceil(result);
            registers[arg1] = rounded;
            return;
        }

        if (inst === 'mod') {
            if (value1 < 0) {
                throw new Error(`Tried to run "mod ${value1} ${value2}" (${inst} ${arg1} ${arg2})`);
            }

            if (value2 <= 0) {
                throw new Error(`Tried to run "mod ${value1} ${value2}" (${inst} ${arg1} ${arg2})`);
            }

            registers[arg1] = value1 % value2;
            return;
        }

        if (inst === 'eql') {
            registers[arg1] = value1 === value2 ? 1 : 0;
            return;
        }

        throw new Error(`Unexpected instruction: "${inst}".`);
    });

    return {
        registers,
        inputs,
    };
}

async function exec(programm, inputs) {
    try {
        const result = await runProgramm(programm, inputs);

        if (result.registers.z === 0) {
            return true;
        }
    } catch (error) {
        return false;
    }

    return false;
}

async function main() {
    const inst = await getProgramm(`./data.txt`);
    let iter = 0;

    const prefix = parseInt(process.argv[3]);

    const textStart = `${prefix}9999999999999`;
    const textEnd = `${prefix}1111111111111`;

    const start = parseInt(textStart);
    const end = parseInt(textEnd);

    for (let i = start; i >= end; i--) {
        const digits = i.toString().split('');

        if (digits.includes('0') || digits.length !== 14) {
            continue;
        }

        if (iter % 1_000_000 === 0) {
            console.log(prefix, 'Completed iterations:', format(iter));
        }

        const inputs = digits.map(x => parseInt(x));
        const result = await exec(inst, inputs);

        if (result) {
            console.log(prefix, 'Found number:', i);
            break;
        }

        iter += 1;
    }

    console.log(prefix, 'Done.');
}

/**
 * Launch child processes and assign them a 
 */
async function launcher() {
    const { fork } = require('child_process');
    const children = new Map();

    for (let i = 1; i < 10; i++) {
        const child = fork(__filename, ['child', i]);
        children.set(i, child);

        child.on('exit', (code) => {
            children.delete(i);
        });
    }
}

if (process.argv[2] === 'child') {
    main().catch(console.error);
} else {
    launcher().catch(console.error);
}
