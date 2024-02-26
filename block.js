const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

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
        
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        const { difficulty } = lastBlock;
        let nonce = 0;


        do {
            nonce++;
            timestamp = Date.now();
            hash = cryptoHash(
                timestamp,
                lastHash,
                data,
                nonce,
                difficulty
                );
        }  while(hash.substring(0,difficulty) !== '0'.repeat(difficulty))


        return new this({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash
        });
    }
}


module.exports = Block;