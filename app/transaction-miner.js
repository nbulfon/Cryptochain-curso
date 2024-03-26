const Transaction = require('../wallet/transaction');

class TransactionMiner {

    constructor ({blockchain, transactionPool, wallet, pubSub}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubSub = pubSub;
    }

    mineTransactions() {

        const validTransactions = this.transactionPool.validTransactions();

        // generate the miner's reward
        validTransactions.push(
            Transaction.rewardTransaction({minerWallet: this.wallet})
        );

        // add a block consisting of these transactions to the blockchain
        this.blockchain.addBlock({data: validTransactions});

        // broadcast the updated blockchain
        this.pubSub.broadcastChain();

        // clear the pool
        this.transactionPool.clear();
    }
   
}

module.exports = TransactionMiner;