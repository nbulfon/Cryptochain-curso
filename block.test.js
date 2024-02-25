const Block = require("./block");
const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

describe('Block', () => {

    timestamp = 'a-date';
    lastHash = 'foo-hash',
    hash = 'bar-hash',
    data = ['blockchain', 'data']
    const block = new Block({
        timestamp,
        lastHash,
        hash,
        data
    });

    it('[Creacion del bloque]', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
    });

    describe('BLOQUE GENESIS', () => {
        const genesis_block = Block.genesis();

        console.log('bloque genesis: ', genesis_block);

        it('[Creacion del bloque genesis]', () => {
            expect(genesis_block instanceof Block)
            .toBe(true);
        });
        it('devolviendo la data del b.genesis', () => {
            expect(genesis_block).toEqual(GENESIS_DATA);
        });
    });

    describe('Mine block', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({lastBlock, data});

        it('returns a block instance', () => {
            expect(minedBlock instanceof Block)
            .toBe(true);
        });

        it('sets the ´lastHash´ to be the ´hash´ of the lastBlock', () => {
             expect(minedBlock.lastHash)
             .toEqual(lastBlock.hash);
        });

        it('sets the ´data´', () => {
            expect(minedBlock.data)
            .toEqual(data);
       });

       it('sets a ´timestamp´', () => {
        expect(minedBlock.timestamp)
        .not
        .toEqual(undefined);
    });
    it('creates a SHA-256 ´hash´ based on the proper inputs', () => {
        expect(minedBlock.hash)
        .toEqual
        (cryptoHash
            (minedBlock.timestamp, lastBlock.hash, data)
        );
    });
});
});