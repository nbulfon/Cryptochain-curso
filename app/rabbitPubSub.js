const amqp = require("amqplib/callback_api");
const crypto = require('crypto');
const os = require('os');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

function generateUniqueId() {
    const ipAddress = obtainIpAddress(); // Función para obtener la dirección IP del nodo
    const randomValue = Math.random().toString();
    const combinedData = ipAddress + randomValue;
    return crypto.createHash('sha256').update(combinedData).digest('hex');
}

function obtainIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const key in interfaces) {
        for (const iface of interfaces[key]) {
            // Consideramos solo IPv4 y que no sea una dirección de loopback
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // Por defecto, si no se encuentra ninguna IP válida
}

const MY_PUBLISHER_ID = generateUniqueId();

class RabbitPubSub {
    constructor({blockchain, transactionPool,wallet, rabbitUrl}) { 
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.rabbitUrl = rabbitUrl;
        this.publisher = null;
        this.subscriber = null;
        this.connect();
    }

    connect() {
        return new Promise((resolve, reject) => {
            amqp.connect(this.rabbitUrl, (err, connection) => {
                if (err) {
                    console.error('Error connecting to RabbitMQ:', err);
                    reject(err);
                    return;
                }
                connection.createChannel((err, channel) => {
                    if (err) {
                        console.error('Error creating RabbitMQ channel:', err);
                        reject(err);
                        return;
                    }
                    this.subscriber = channel;
                    this.publisher = channel;
                    this.setupSubscriber();
                    this.subscribeToChannels();
                    resolve();
                });
            });
        });
    }

    handleMessage(channel, message) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
    
        const parsedMessage = JSON.parse(message);
    
        switch(channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMessage, true, () => {
              this.transactionPool.clearBlockchainTransactions({
                chain: parsedMessage
              });
            });
            break;
          case CHANNELS.TRANSACTION:
            if (!this.transactionPool.existingTransaction({
                inputAddress: this.wallet.publicKey
              })) {
                this.transactionPool.setTransaction(parsedMessage);
              }
            break;
          default:
            return;
        }
    }

    setupSubscriber() {
        let queueName = 'technical';
        this.subscriber.assertQueue(queueName, { durable: false });
        this.subscriber.consume(queueName, (msg) => {
            // Verificar si el mensaje proviene del mismo publicador
            if (msg.properties.headers.publisherId === MY_PUBLISHER_ID) {
                console.log("Mensaje descartado: proviene del mismo publicador");
                this.subscriber.ack(msg);
                return;
            }
        
            console.log(`Received: ${msg.content.toString()}`);
            this.handleMessage(msg.fields.routingKey, msg.content.toString());
            this.subscriber.ack(msg);
        });
    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            const queueName = channel;
            this.subscriber.assertQueue(queueName, { durable: false });
            this.subscriber.bindQueue(queueName, 'fanout_cryptochain', ''); // Enlazar la cola al intercambio fanout
        });
    }
    
    publish({ channel, message }) {
        if (!this.publisher) {
            console.error('Publisher channel not initialized.');
            return;
        }
        let queueName = channel;
        let messageString = typeof message === 'object' ? JSON.stringify(message) : message.toString();
        this.publisher.sendToQueue(queueName, Buffer.from(messageString), {
            headers: {
                publisherId: MY_PUBLISHER_ID
            }
        });
        console.log(`Message sent: ${messageString}`);
    }

    /** 
    * Esta función envía la cadena de bloques completa
    *  a todos los nodos de la red, lo que les permite actualizar
    *  su copia local de la cadena de bloques 
    * para reflejar la última versión de la cadena. */
    broadcastChain() {
        this.publish({
          channel: CHANNELS.BLOCKCHAIN,
          message: JSON.stringify(this.blockchain.chain)
        });
    }

    /**
    * Esta función envía una transacción a todos los nodos
    * de la red para que la agreguen a sus respectivas pools
    * de transacciones pendientes o las validen. */
    broadcastTransaction(transaction) {
        this.publish({
          channel: CHANNELS.TRANSACTION,
          message: JSON.stringify(transaction)
        })
    }
}

module.exports = RabbitPubSub;
