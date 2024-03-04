const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const BlockChain = require('./blockchain/index');
const RabbitPubSub = require('./app/rabbitPubSub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');

const app = express();
const blockchain = new BlockChain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const rabbitUrl = "amqp://localhost";
const pubsub = new RabbitPubSub({
    blockchain, transactionPool, wallet,rabbitUrl});

const DEFAULT_PORT = 5000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

//#region  Endpoints

/**Traerme la cadena de bloques */
app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

/**Minar un bloque */
app.post('/api/mine', (req, res) => {
    const {data} = req.body;
    blockchain.addBlock({data});

    pubsub.publish({
        channel: 'BLOCKCHAIN',
        message: blockchain.chain
    });

    // the result, is that you'll receive the same blockchain
    // chain from json.
    res.redirect('/api/blocks');
});

/**hacer una transacción */
app.post('/api/transact', (req, res) => {
    const {amount, recipient} = req.body;

    let transaction = transactionPool
    .existingTransaction({inputAddress: wallet.publicKey});


    try {

        if (transaction) {
            transaction.update({
                senderWallet: wallet,
                recipient,
                amount
            });
        }
        else {
            transaction = wallet.createTransaction({recipient,amount});
        }
    } catch (error) {
        return res
        .status(400)
        .json({type:'error',message: error.message});
    }

    transactionPool.setTransaction(transaction);
    //console.log('transactionPool:',transactionPool);

    // mando un msj a rabbit con la transaccion p que le llegue a todos los nodos ->
    pubsub.broadcastTransaction(transaction);
    
    res.json({type:'success',transaction});
});

/**get the transaction pool map */
app.get('/api/transaction-pool-map', (req,res) => {
    res.json(transactionPool.transactionMap);
});

const syncWithRootState = ()  => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}
    , (error, response, body) => {
        if (!error && response.statusCode === 200) {

            const rootChain = JSON.parse(body);

            console.log('replace chain on  a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({url:`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`},
     (error,response,body) =>{
        if (!error && response.statusCode === 200) {

            const rootTransactionPoolMap = JSON.parse(body);

            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
};


//#endregion


let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

pubsub.connect()
    .then(() => {
        console.log('Connected to RabbitMQ.');
        app.listen(PORT, () => {
            console.log(`listening at localhost:${PORT}`);

            if (PORT !== DEFAULT_PORT) {
                syncWithRootState();
            }
        }
        );
    })
    .catch(error => {
        console.error('Error connecting to RabbitMQ:', error);
    });
