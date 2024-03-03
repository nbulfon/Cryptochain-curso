const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const BlockChain = require('./blockchain/index');
const RabbitPubSub = require('./app/rabbitPubSub');

const app = express();
const blockchain = new BlockChain();
const transactionPool = 0;
const rabbitUrl = "amqp://localhost";
const pubsub = new RabbitPubSub(rabbitUrl);

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

const syncChains = ()  => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}
    , (error, response, body) => {
        if (!error && response.statusCode === 200) {

            const rootChain = JSON.parse(body);

            console.log('replace chain on  a sync with', rootChain);
            blockchain.replaceChain(rootChain);
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
                syncChains();
            }
        }
        );
    })
    .catch(error => {
        console.error('Error connecting to RabbitMQ:', error);
    });
