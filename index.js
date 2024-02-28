const express = require('express');
const bodyParser = require('body-parser');
const BlockChain = require('./blockchain');

const app = express();
const blockchain = new BlockChain();
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

    // the result, is that you'll receive the same blockchain
    // chain from json.
    res.redirect('/api/blocks');
});


//#endregion



const PORT = 5000;
app.listen(PORT, () => 
console.log(`listening at localhost:${PORT}`)
);

