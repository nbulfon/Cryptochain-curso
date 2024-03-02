// //const redis = require('redis');
// const amqp = require("amqplib/callback_api");
// const RabbitPubSub = require("./rabbitPubSub");

// const CHANNELS = {
//   TEST: 'TEST',
//   BLOCKCHAIN: 'BLOCKCHAIN',
//   TRANSACTION: 'TRANSACTION'
// };

// class PubSub {
//     constructor({ blockchain, transactionPool, rabbitUrl }) {
//         this.blockchain = blockchain;
//         this.transactionPool = transactionPool;
    
//         // Crear las promesas para obtener los canales
//         const subscriberPromise = RabbitPubSub.createRabbitClient(rabbitUrl);
//         const publisherPromise = RabbitPubSub.createRabbitClient(rabbitUrl);
    
//         // Esperar a que ambas promesas se resuelvan
//         Promise.all([subscriberPromise, publisherPromise])
//           .then(([subscriberChannel, publisherChannel]) => {
//             this.subscriber = subscriberChannel;
//             this.publisher = publisherChannel;
    
//             this.setupSubscriber();
    
//             this.subscriber.on('message', (channel, message) => {
//               this.handleMessage(channel, message);
//             });
//           })
//           .catch(error => {
//             console.error('Error connecting to RabbitMQ:', error);
//           });
//       }
//   handleMessage(channel, message) {
//     console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

//     const parsedMessage = JSON.parse(message);

//     switch(channel) {
//       case CHANNELS.BLOCKCHAIN:
//         this.blockchain.replaceChain(parsedMessage, true, () => {
//           this.transactionPool.clearBlockchainTransactions({
//             chain: parsedMessage
//           });
//         });
//         break;
//       case CHANNELS.TRANSACTION:
//         this.transactionPool.setTransaction(parsedMessage);
//         break;
//       default:
//         return;
//     }
//   }

//   /** Este método configura la cola y consume los mensajes de la cola especificada. */
//   setupSubscriber() {
//     let queueName = 'technical';
//     this.subscriber.assertQueue(queueName, { durable: false });
//     this.subscriber.consume(queueName, (msg) => {
//       console.log(`Received: ${msg.content.toString()}`);
//       this.subscriber.ack(msg);
//     });
//   }

//   subscribeToChannels() {

//     //console.log('SUSCRIBER LOG', this.subscriber);
    
//     Object.values(CHANNELS).forEach(channel => {
//       this.subscriber.subscribe(channel);
//     });
//   }

//   publish({ channel, message }) {
//     this.publisher.publish(channel, JSON.stringify(message));
//   }
  

//   broadcastChain() {
//     this.publish({
//       channel: CHANNELS.BLOCKCHAIN,
//       message: JSON.stringify(this.blockchain.chain)
//     });
//   }

//   broadcastTransaction(transaction) {
//     this.publish({
//       channel: CHANNELS.TRANSACTION,
//       message: JSON.stringify(transaction)
//     });
//   }
// }

// module.exports = PubSub;