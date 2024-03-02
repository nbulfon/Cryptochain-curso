const amqp = require("amqplib/callback_api");

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

const crypto = require('crypto');

function generateUniqueId() {
    const ipAddress = obtainIpAddress(); // Función para obtener la dirección IP del nodo
    const randomValue = Math.random().toString();
    const combinedData = ipAddress + randomValue;
    return crypto.createHash('sha256').update(combinedData).digest('hex');
}
const os = require('os');

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
    constructor(rabbitUrl) { 
        this.RABBIT_URL = rabbitUrl;
        this.subscriber = null;
        this.publisher = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            amqp.connect(this.RABBIT_URL, (err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                connection.createChannel((err, channel) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.subscriber = channel;
                    this.publisher = channel;
                    resolve();
                });
            });
        });
    }

    publish({ channel, message }) {
        if (!this.publisher) {
            console.error('Canal de publicador no inicializado.');
            return;
        }
    
        // Agregar el identificador único del publicador en los headers del mensaje
        const msgOptions = {
            headers: {
                publisherId: MY_PUBLISHER_ID // Aquí debes reemplazar MY_PUBLISHER_ID con el identificador único de tu publicador
            }
        };
    
        let queueName = channel;
        let messageString = typeof message === 'object' ? JSON.stringify(message) : message.toString();
    
        // Publicar el mensaje con las opciones adicionales
        this.publisher.sendToQueue(queueName, Buffer.from(messageString), msgOptions);
    
        console.log(`Mensaje enviado: ${messageString}`);
    }

    subscribeToChannel(channel, callback) {
        if (!this.subscriber) {
            console.error('Subscriber channel not initialized.');
            return;
        }
        this.subscriber.assertQueue(channel, { durable: false });
        this.subscriber.consume(channel, (msg) => {
            // Verificar si el mensaje proviene del mismo publicador
            if (msg.properties.headers.publisherId === MY_PUBLISHER_ID) {
                console.log("Mensaje descartado: proviene del mismo publicador");
                this.subscriber.ack(msg);
                return;
            }
        
            console.log(`Received: ${msg.content.toString()}`);
            callback(msg.content.toString());
            this.subscriber.ack(msg);
        });
    }
}

module.exports = RabbitPubSub;
