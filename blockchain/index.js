const Block = require('./block');
const { cryptoHash } = require('../util');

class BlockChain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock( {data} ) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });
        this.chain.push(newBlock);
    }

    /** onSuccess == callback function */
    replaceChain(chain, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!BlockChain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        if (onSuccess) onSuccess();
        
        console.log('replacing chain with: ',chain);
        this.chain = chain;
    }

    static isValidChain(chain) {
        /** importante: comparo los objetos en un JSON.stringify
        * dado que, en Js sino, siempre me va a devolver false,
        * por ser instancias diferentes.
        */
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        // arranco el for en 1 p/sckippear el bloque genesis
        for (let i=1; i < chain.length; i++) {

            const {timestamp, lastHash, hash, nonce, difficulty, data} = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;


            if (lastHash !== actualLastHash) {
                return false;
            }

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            
            if (hash !== validatedHash) {
                return false;
            }

            if ( Math.abs(lastDifficulty - difficulty) > 1) {
                return false;
            }
        }

        return true;
    }
}
module.exports = BlockChain;