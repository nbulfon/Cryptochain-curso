const BlockChain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('./crypto-hash');

/** En js , cada 'describe()' es un test. */

describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new BlockChain();
        newChain = new BlockChain();
        originalChain = blockchain.chain;
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

    /** test para ver que la cadena sea la valida */
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

            describe('and the chain contains a block with a jumped difficulty', () => {
                it('returns false', () =>{

                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty -3;
                    const hash = cryptoHash(
                        timestamp,
                        lastHash,
                        difficulty,
                        nonce,
                        data
                    );
                    const badBlock = new Block({
                        timestamp,
                        lastHash,
                        hash,
                        nonce,
                        difficulty,
                        data
                    });

                    blockchain.chain.push(badBlock);
                    
                    expect(BlockChain.isValidChain(blockchain.chain))
                    .toBe(false);

                
                });
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns true', () => {
                  expect(BlockChain.isValidChain(blockchain.chain))
                  .toBe(true);
                });
              });
        });
    });

    /** test para reemplazar la cadena por la valida */
    describe('replaceChain()', () => {

        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('when the chain is not longer', () => {

            beforeEach (() => {
                newChain.chain[0] = {new:'chain'};
                blockchain.replaceChain(newChain.chain);
            });
            it('does not replace the chain', () => {
                expect(blockchain.chain)
                .toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errorMock)
                .toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer', () => {

            beforeEach(() => {
                newChain.addBlock({data: 'Bears'});
                newChain.addBlock({data: 'Beets'});
                newChain.addBlock({data: 'Office man'});
            });

            describe('and the chain is invalid', () => {

                beforeEach(() => {
                    newChain.chain[2].hash = 'some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                });
                it('does not replace the chain', () => {
                    expect(blockchain.chain)
                    .toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock)
                    .toHaveBeenCalled();
                });
            });
            describe('and the chain is valid', () => {

                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });
                
                it('replaces the chain', () => {
                    expect(blockchain.chain)
                    .toEqual(newChain.chain);
                });
                it ('logs about the chain replacement',() => {
                    expect(logMock)
                    .toHaveBeenCalled();
                });
            });
        });
    });
});