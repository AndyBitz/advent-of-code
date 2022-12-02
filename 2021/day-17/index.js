// Puzzle input
const target = { x: { min: 117, max: 164 }, y: { min: -140, max: -89 }};

// Example input, target area: x=20..30, y=-10..-5
// const target = { x: { min: 20, max: 30 }, y: { min: -10, max: -5} }; // optimal 6,9 with max at y=45

async function main() {
    // The probe's x position increases by its x velocity.
    // The probe's y position increases by its y velocity.

    // Due to drag, the probe's x velocity changes by 1 toward the value 0;
    // that is, it decreases by 1 if it is greater than 0, increases by 1 if it is less than 0, or does not change if it is already 0.

    // Due to gravity, the probe's y velocity decreases by 1.

    let maxY = 0;
    let lastVelocity = null;
    
    let velocity = { x: 0, y: 0 };
    let probeAt = { x: 0, y: 0 };

    let possibleValues = 0;

    for (let x = -1000; x < 1000; x++) {
        for (let y = -1000; y < 1000; y++) {
            const initial = { x, y };
            velocity = { x, y };
            let maxYInStep = 0;
            probeAt = { x: 0, y: 0 };
            
            for (let step = 0; step < 1000; step++) {
                probeAt.x += velocity.x;
                probeAt.y += velocity.y;
        
                maxYInStep = Math.max(maxYInStep, probeAt.y);
        
                // Drag
                if (velocity.x > 0) {
                    velocity.x -= 1;
                } else if (velocity.x < 0) {
                    velocity.x += 1;
                }
        
                velocity.y -= 1; // Gravity
        
                // Check if it's in
                if (
                    probeAt.x >= target.x.min &&
                    probeAt.x <= target.x.max &&
                    probeAt.y >= target.y.min &&
                    probeAt.y <= target.y.max
                ) {
                    // console.log('Probe is in', { probeAt, maxY });
                    possibleValues += 1;
                    
                    if (maxYInStep > maxY) {
                        lastVelocity = initial;
                        maxY = maxYInStep;
                    }

                    break;
                }
            }
        }
    }

    console.log({ maxY, lastVelocity, possibleValues });
}

main().catch(console.error);
