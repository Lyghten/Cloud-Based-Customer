const {PubSub} = require('@google-cloud/pubsub');
const WebSocket = require('ws');
const pubSubClient = new PubSub();
const wss = new WebSocket.Server({ port: 8080 });

const topicName = 'customer-support-queries';
const subscriptionName = 'support-agents';

wss.on('connection', ws => {
    console.log('New client connected');
    ws.on('message', message => {
        console.log('Received message:', message);
        ws.send('Message received, routing to agent...');
    });
});

async function subscribeMessages() {
    const [subscription] = await pubSubClient.subscription(subscriptionName).get();
    subscription.on('message', message => {
        console.log('Received message:', message.data.toString());
        // Send message to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.data.toString());
            }
        });
        message.ack();
    });
}

subscribeMessages();
