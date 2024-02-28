const MINE_RATE = 1000; // 1 seg
const INITIAL_DIFFICULTY = 3;


/** aca armo el bloque genesis con los datos y lo exporto... */
const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '-----',
    hash: 'hash-one',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

module.exports = {GENESIS_DATA, MINE_RATE}