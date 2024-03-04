const Transaction = require('./transaction');

/**
* In the context of blockchain, a transaction pool, sometimes referred
*  to as a mempool (memory pool), is a temporary holding area for valid
*  but unconfirmed transactions. When a user initiates a transaction,
*  such as sending cryptocurrency from one address to another,
*  that transaction is broadcast to the network and added to the
*  transaction pool of each node it reaches. */
class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  clear() {
    this.transactionMap = {};
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  setMap(transactionMap) {
    this.transactionMap = transactionMap;
  }

  existingTransaction({ inputAddress }) {
    const transactions = Object.values(this.transactionMap);

    return transactions.find(
        transaction => transaction.input.address === inputAddress
        );
  }

  validTransactions() {
    return Object.values(this.transactionMap).filter(
      transaction => Transaction.validTransaction(transaction)
    );
  }

  clearBlockchainTransactions({ chain }) {
    for (let i=1; i<chain.length; i++) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }
}

module.exports = TransactionPool;