const startsPuzzel = {
    player1: 6,
    player2: 4,
};

const startsExample = {
    player1: 4,
    player2: 8,
};

const starts = startsPuzzel;
// const starts = startsExample;

function *getPossible() {
    for (let i = 1; i < 4; i++) {
        for (let j = 1; j < 4; j++) {
            for (let k = 1; k < 4; k++) {
                yield [i, j, k];
            }
        }
    }
}

class State {
    constructor() {
        this.positions = new Map();

        for (let i = 1; i <= 10; i++) {
            for (let j = 1; j <= 10; j++) {
                this.positions.set([i, j].join(','), new Map());
            }
        }
    }

    add(pos1, pos2, score1, score2, amount = 1) {
        const posKey = [pos1, pos2].join(',');
        const scoreKey = [score1, score2].join(',');
        if (!this.positions.get(posKey).has(scoreKey)) {
            this.positions.get(posKey).set(scoreKey, 0);
        }

        this.positions.get(posKey).set(
            scoreKey,
            this.positions.get(posKey).get(scoreKey) + amount
        );
    }

    *iterate() {
        for (const [position, scores] of this.positions) {
            const [pos1, pos2] = position.split(',').map(x => parseInt(x));
            for (const [score, games] of scores) {
                const [score1, score2] = score.split(',').map(x => parseInt(x));

                if (score1 >= 21 || score2 >= 21) {
                    continue;
                }

                yield {
                    pos1,
                    pos2,
                    score1,
                    score2,
                    games,
                };
            }
        }
    }
}

async function main() {
    let round = 0;
    let state = new State();
    state.add(starts.player1, starts.player2, 0, 0);

    let wins = [0, 0];

    while (true) {
        const player = round % 2;
        const nextState = new State();
        let newGames = false;

        for (const game of state.iterate()) {
            for (const die of getPossible()) {
                const sum = die[0] + die[1] + die[2];

                let pos1 = game.pos1;
                let pos2 = game.pos2;
                let score1 = game.score1;
                let score2 = game.score2;

                if (player === 0) {
                    pos1 = (pos1 + sum) % 10;
                    if (pos1 === 0) pos1 = 10;
                    score1 += pos1;
                } else {
                    pos2 = (pos2 + sum) % 10;
                    if (pos2 === 0) pos2 = 10;
                    score2 += pos2;
                }

                if (score1 >= 21) {
                    wins[0] += game.games;
                } else if (score2 >= 21) {
                    wins[1] += game.games;
                } else {
                    nextState.add(pos1, pos2, score1, score2, game.games);
                    newGames = true;
                }
            }
        }

        state = nextState;
        round += 1;

        if (!newGames) {
            break;
        }
    }

    console.log({ wins, round });
}

async function main1() {
    let points1 = 0;
    let points2 = 0;

    let pos1 = starts.player1;
    let pos2 = starts.player2;

    let rolls = 0;
    let dice = 100;
    let rounds = 0;

    const roll = () => {
        rolls += 1;
        dice += 1;
        if (dice > 100) {
            dice = 1;
        }
        return dice;
    };

    while (true) {
        debugger;
        let moveBy = roll() + roll() + roll();
        
        if (rounds % 2 === 0) {
            pos1 = (pos1 + moveBy) % 10;
            if (pos1 === 0) pos1 = 10;
            points1 += pos1;
        } else {
            pos2 = (pos2 + moveBy) % 10;
            if (pos2 === 0) pos2 = 10;
            points2 += pos2;
        }

        rounds += 1;

        if (points1 >= 1000 || points2 >= 1000) {
            break;
        }
    }

    const minPoints = Math.min(points1, points2);
    const final = minPoints * rolls;
    console.log({ final, rounds, rolls, points1, points2 });
}

main().catch(console.error);
