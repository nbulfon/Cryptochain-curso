const { GENESIS_DATA, MINE_RATE} = require("./config");
const cryptoHash = require("./crypto-hash");
const hexToBinary = require('hex-to-binary');

/** Clase bloque */
class Block {
    constructor( {timestamp, lastHash, hash, data, nonce, difficulty} ){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }   

    static genesis() {
        return new this(GENESIS_DATA);
    }

    /** function para minar un bloque
    * ¡! The higher this difficulty gets, the more computational power it will
    * take for a miner to actually add a block to the chain, because they're
    * going to have to generate more and more valid hashes in order to find
    * that block. 
    */
    static mineBlock({lastBlock, data}) {
        
        const lastHash = lastBlock.hash;
        let hash, timestamp;
        let { difficulty } = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({
                originalBlock: lastBlock,
                timestamp
            });
            hash = cryptoHash(
                timestamp,
                lastHash,
                data,
                nonce,
                difficulty
                );
        }  while(
            hexToBinary(hash).substring(0,difficulty) !== '0'.repeat(difficulty))


        return new this({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash
        });
    }

    static adjustDifficulty({originalBlock, timestamp}) {
        const {difficulty} = originalBlock;

        if (difficulty < 1) return 1;

        if ((timestamp - originalBlock.timestamp) > MINE_RATE ) {
            return difficulty - 1;
        }
        

        return difficulty + 1;
    }
}


module.exports = Block;