const BlockChain = require('./blockchain');
const Block = require('./block');

/** En js , cada 'describe()' es un test. */

describe('Blockchain', () => {
    const blockchain = new BlockChain();

    beforeEach(() => {
        blockchain = new BlockChain();
    });

    it('contains a ´chain´ Array instance', () => {
        expect(blockchain.chain instanceof Array)
        .toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0])
        .toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'foo-data';
        blockchain.addBlock({data: newData});

        expect(blockchain.chain[blockchain.chain.length -1].data)
        .toEqual(newData);
    });

    describe('isValidChain()', () => {

        describe('when the chain does not start with the genesis block', () =>{
            it('returns false', () => {
                blockchain.chain[0] = {data: 'fake-genesis'};
                expect(BlockChain.isValidChain(blockchain.chain))
                .toBe(false);
            });
        });

        describe('when the chain starts whith the genesis block and has multiple blocks', () => {
            
            beforeEach(() => {
                blockchain.addBlock({data: 'Bears'});
                blockchain.addBlock({data: 'Beets'});
                blockchain.addBlock({data: 'Office man'});
            });

            describe('and a lastHash reference has changed', () => {
                it('returns false', () => {

                    blockchain.chain[2].lastHash = 'broken-lastHash';
                    expect(BlockChain.isValidChain(blockchain.chain))
                    .toBe(false);
                });
            });

            describe('and the chain contains a block with an invalid field', () =>{
                it('returns false', () => {

                    blockchain.chain[2].lastHash = 'some-bad-and-evil-data';
                    expect(BlockChain.isValidChain(blockchain.chain))
                    .toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks', () =>{
                it('returns true', () => {
                    expect(BlockChain.isValidChain(blockchain.chain))
                    .toBe(true);
                });
            });
        });
    });
});