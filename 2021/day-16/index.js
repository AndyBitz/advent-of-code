// const input = 'D2FE28';
// const input = '38006F45291200'; // Length Type ID = 0
// const input = 'EE00D40C823060'; // Length Type ID = 1
// const input = '8A004A801A8002F478'; // Sum of versions = 16
// const input = '620080001611562C8802118E34'; // Sum of versions = 12
// const input = 'C0015000016115A2E0802F182340'; // Sum of versions = 23
// const input = '9C0141080250320F1802104A08'; // 1
// const input = 'D8005AC2A8F0'; // 1
// const input = 'F600BC2D8F'; // 0
// const input = '9C005AC2F8F0'; // 0
// const input = 'CE00C43D881120'; // Result is 9
// const input = '880086C3E88112'; // Result is 7
// const input = 'C200B40A82'; // Result is 3
// const input = '04005AC33890'; // Result is 54
// const input = '32F5DF3B128';

// Puzzle
const input = '220D4B80491FE6FBDCDA61F23F1D9B763004A7C128012F9DA88CE27B000B30F4804D49CD515380352100763DC5E8EC000844338B10B667A1E60094B7BE8D600ACE774DF39DD364979F67A9AC0D1802B2A41401354F6BF1DC0627B15EC5CCC01694F5BABFC00964E93C95CF080263F0046741A740A76B704300824926693274BE7CC880267D00464852484A5F74520005D65A1EAD2334A700BA4EA41256E4BBBD8DC0999FC3A97286C20164B4FF14A93FD2947494E683E752E49B2737DF7C4080181973496509A5B9A8D37B7C300434016920D9EAEF16AEC0A4AB7DF5B1C01C933B9AAF19E1818027A00A80021F1FA0E43400043E174638572B984B066401D3E802735A4A9ECE371789685AB3E0E800725333EFFBB4B8D131A9F39ED413A1720058F339EE32052D48EC4E5EC3A6006CC2B4BE6FF3F40017A0E4D522226009CA676A7600980021F1921446700042A23C368B713CC015E007324A38DF30BB30533D001200F3E7AC33A00A4F73149558E7B98A4AACC402660803D1EA1045C1006E2CC668EC200F4568A5104802B7D004A53819327531FE607E118803B260F371D02CAEA3486050004EE3006A1E463858600F46D8531E08010987B1BE251002013445345C600B4F67617400D14F61867B39AA38018F8C05E430163C6004980126005B801CC0417080106005000CB4002D7A801AA0062007BC0019608018A004A002B880057CEF5604016827238DFDCC8048B9AF135802400087C32893120401C8D90463E280513D62991EE5CA543A6B75892CB639D503004F00353100662FC498AA00084C6485B1D25044C0139975D004A5EB5E52AC7233294006867F9EE6BA2115E47D7867458401424E354B36CDAFCAB34CBC2008BF2F2BA5CC646E57D4C62E41279E7F37961ACC015B005A5EFF884CBDFF10F9BFF438C014A007D67AE0529DED3901D9CD50B5C0108B13BAFD6070';

let counter = 1;

class Node {
    constructor({ version, type, value, children, lengthTypeId }) {
        this.id = (counter++).toString(16);
        this.version = version;
        this.type = type;
        this.lengthTypeId = lengthTypeId ?? undefined;
        this.value = value;
        this.originalFollowingBits = null;
        this.followingBits = null;
        this.numberOfSubPackets = null;
        this.children = children || [];
    }
}

async function main() {
    // - the first three bits encode the packet version
    // - and the next three bits encode the packet type ID
    // - most significant bit first

    // - Packets with type ID 4 represent a literal value. Literal value packets encode a single binary number

    // - padded with leading zeroes until its length is a multiple of four bits

    // - An operator packet contains one or more packets

    const nodes = [];
    let currentNodes = [];

    let version = null;
    let type = null;
    let lengthTypeId = null;

    let unusedBits = [];
    let lastPayloadBits = [];

    input.split('').forEach(char => {
        const int = parseInt(char, 16);
        const binary = int.toString(2).padStart(4, '0');
        let canSkip = false;
        
        binary.split('').forEach(bit => {
            const lastNode = currentNodes[currentNodes.length - 1];

            if (canSkip) {
                return;
            }

            unusedBits.push(bit);

            if (version === null && unusedBits.length === 3) {
                version = parseInt(unusedBits.join(''), 2);
                unusedBits = [];
            }

            if (type === null && unusedBits.length === 3) {
                type = parseInt(unusedBits.join(''), 2);
                unusedBits = [];
            }

            if (version !== null && type !== null && type !== 4 && lengthTypeId === null && unusedBits.length === 1) {
                lengthTypeId = parseInt(unusedBits.join(''), 2);
                unusedBits = [];
            }

            // Literal
            if (version !== null && type === 4 && unusedBits.length === 5) {
                const isDone = unusedBits[0] === '0';
                lastPayloadBits.push(...unusedBits.slice(1));

                if (isDone) {
                    const number = parseInt(lastPayloadBits.join(''), 2);

                    const newNode = new Node({
                        version,
                        type,
                        value: number
                    });

                    if (lastNode) {
                        lastNode.children.push(newNode);
                    } else {
                        nodes.push(newNode);
                    }

                    // Reset
                    lastPayloadBits = [];
                    version = null;
                    type = null;
                    lengthTypeId = null;

                    // Only set when the byte is not yet completed
                    canSkip = true;

                    if (lastNode && typeof lastNode.followingBits === 'number') {
                        canSkip = false;
                    }
                    if (lastNode && typeof lastNode.numberOfSubPackets === 'number') {
                        canSkip = false;
                    }
                }

                unusedBits = [];
            }

            // Operator
            if (lengthTypeId === 0 && unusedBits.length === 15) {
                const followingBits = parseInt(unusedBits.join(''), 2);

                const newNode = new Node({
                    version,
                    type,
                    lengthTypeId,
                });

                if (newNode.id === '10') {
                    debugger;
                }

                newNode.originalFollowingBits = followingBits
                newNode.followingBits = followingBits;
                currentNodes.push(newNode);

                if (lastNode) {
                    lastNode.children.push(newNode);
                } else {
                    nodes.push(newNode);
                }

                lastPayloadBits = [];
                version = null;
                type = null;
                lengthTypeId = null;
    
                unusedBits = [];
            }

            // Operator
            if (lengthTypeId === 1 && unusedBits.length === 11) {
                const numberOfSubPackets = parseInt(unusedBits.join(''), 2);

                const newNode = new Node({
                    version,
                    type,
                    lengthTypeId,
                });

                newNode.numberOfSubPackets = numberOfSubPackets;
                currentNodes.push(newNode);

                if (lastNode) {
                    lastNode.children.push(newNode);
                } else {
                    nodes.push(newNode);
                }

                lastPayloadBits = [];
                version = null;
                type = null;
                lengthTypeId = null;
    
                unusedBits = [];
            }

            currentNodes = currentNodes.filter(last => {
                // Closes operator(s) for lengthTypeId = 0
                if (typeof last.followingBits === 'number') {
                    last.followingBits -= 1;
                    if (last.followingBits === -1) {
                        delete last.followingBits;
                        return false;
                    }
                }

                // Closes operator for lengthTypeId = 1
                if (last.numberOfSubPackets === last.children.length) {
                    delete last.followingBits;
                    return false;
                }

                return true;
            });
        });
    });

    const rootNode = new Node({
        version: null,
        type: 0,
        children: nodes,
    });

    console.log(JSON.stringify(nodes, null, 2));
    console.log(`Version sum:`, sumVersions(rootNode));
    console.log(`Values resolved:`, getValue(rootNode));
}

function getValue(node) {
    const type = node.type

    if (type === 4) {
        return node.value;
    }

    const childValues = node.children.map(child => getValue(child));

    if (type === 0) {
        return childValues.reduce((t, v) => t + v, 0); 
    }

    if (type === 1) {
        return childValues.reduce((t, v) => t * v, 1);
    }

    if (type === 2) {
        return Math.min(...childValues);
    }

    if (type === 3) {
        return Math.max(...childValues);
    }

    const [first, second] = childValues;
    if (childValues.length !== 2) {
        console.log({ node });
        throw new Error(`Expected 2 children, but got ${childValues.length} instead.`);
    }

    if (type === 5) {
        // Greater Than
        return first > second ? 1 : 0;
    }
    
    if (type === 6) {
        // Less Than
        return first < second ? 1 : 0;
    }

    if (type === 7) {
        // Equal to
        return first === second ? 1 : 0;
    }

    throw new Error(`Unexpected type: ${type}`);
}

function sumVersions(node) {
    let sum = 0;
    sum += node.version || 0;

    node?.children.forEach(childNode => {
        sum += sumVersions(childNode);
    });

    return sum;
}

main().catch(console.error);
