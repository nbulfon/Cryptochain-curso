const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST'
};

/** clase que modela todo lo relacionado al publisher y al suscriber mediante Redis. */
class PubSub {
    constructor() {

        /**
        * The reason we want both a publisher and a subscriber in one class,
        * is that we want the pub sub instance to be able to play both roles
        * in our application. It can be a publisher when it wants to broadcast a
        * message to all the interested parties in the network. Likewise, as a subscriber,
        * it should be listening on specific channels for new messages.
        */


        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscriber.subscribe(CHANNELS.TEST);

        this.subscriber.on(
            'message',
            (channel,message) => this.handleMessage(channel,message)
            );
    }


    handleMessage(channel, message) {

        console.log(`Message received. Channel: ${channel}. Message: ${message}`);
    }
}




const testPubSub = new PubSub();
setTimeout(() => {
    testPubSub.publisher.publish(CHANNELS.TEST, 'foo');
}, 1000);