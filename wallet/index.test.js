const Wallet = require("./index");
const Transaction = require('./transaction');
const { verifySignature } = require('../util');
const Blockchain = require('../blockchain/index');
const BlockChain = require("../blockchain/index");
const { STARTING_BALANCE } = require("../config");

describe('Wallet', () => {
    let wallet;
    
    beforeEach( () => {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet)
        .toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        //console.log('wallet-publicKey',wallet.publicKey);

        expect(wallet)
        .toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'foobar';
    
        it('verifies a signature', () => {
          expect(
            verifySignature({
              publicKey: wallet.publicKey,
              data,
              signature: wallet.sign(data)
            })
          ).toBe(true);
        });
    
        it('does not verify an invalid signature', () => {
          expect(
            verifySignature({
              publicKey: wallet.publicKey,
              data,
              signature: new Wallet().sign(data)
            })
          ).toBe(false);
        });
    });

    describe('createTransaction', () => {
      describe('and the amount exceeds the balance', () => {
        it('throws an error', () => {
          expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' }))
            .toThrow('Amount exceeds balance');
        });
      });
  
      describe('and the amount is valid', () => {
        let transaction, amount, recipient;
  
        beforeEach(() => {
          amount = 50;
          recipient = 'foo-recipient';
          transaction = wallet.createTransaction({ amount, recipient });
        });
  
        it('creates an instance of `Transaction`', () => {
          expect(transaction instanceof Transaction)
          .toBe(true);
        });
  
        it('matches the transaction input with the wallet', () => {
          expect(transaction.input.address)
          .toEqual(wallet.publicKey);
        });
  
        it('outputs the amount to the recipient', () => {
          expect(transaction.outputMap[recipient])
          .toEqual(amount);
        });
      });
  
      describe('and a chain is passed', () => {
        it('calls `Wallet.calculateBalance`', () => {
          const calculateBalanceMock = jest.fn();
  
          const originalCalculateBalance = Wallet.calculateBalance;
  
          Wallet.calculateBalance = calculateBalanceMock;
  
          wallet.createTransaction({
            recipient: 'foo',
            amount: 10,
            chain: new Blockchain().chain
          });
  
          expect(calculateBalanceMock).toHaveBeenCalled();
  
          Wallet.calculateBalance = originalCalculateBalance;
        });
      });
    });

    describe('calculateBalance()', () => {
      let blockchain;

      beforeEach( () => {
        blockchain = new BlockChain();
      })


      describe('and there are no outputs for the wallet', () => {
        it('returns the `STARTING_BALANCE`', () =>{

          expect(  Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey
          })).toEqual(STARTING_BALANCE);

        });
      });
      describe('amd there are outputs for the wallet', () => {
        let transactionOne, transactionTwo;

        beforeEach( () =>{
          transactionOne = new Wallet().createTransaction({
            recipient: wallet.publicKey,
            amount: 50
          });

          transactionTwo = new Wallet().createTransaction({
            recipient: wallet.publicKey,
            amount: 60
          });

          blockchain.addBlock({
            data: [transactionOne,transactionTwo]
          });

          it('adds the sum of all outputs to the wallet balance', () =>{

            expect(Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey
            }))
            .toEqual(
              STARTING_BALANCE 
              + transactionOne.outputMap[wallet.publicKey] 
              + transactionTwo.outputMap[wallet.publicKey]
            );
          });
        });
      });
    });
});