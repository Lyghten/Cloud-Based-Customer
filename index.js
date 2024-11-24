const functions = require('@google-cloud/functions-framework');
const {google} = require('googleapis');
const axios = require('axios');
const admin = require('firebase-admin');

// Initialize Firebase
admin.initializeApp();

// Dialogflow Agent Query
async function queryDialogflow(text) {
    const dialogflow = google.dialogflow('v2');
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath('your-project-id', 'session-id');

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: text,
                languageCode: 'en',
            },
        },
    };

    const [response] = await sessionClient.detectIntent(request);
    return response.queryResult;
}

// Cloud Function for processing customer queries
functions.http('customerSupportQuery', async (req, res) => {
    const {queryText} = req.body;

    if (!queryText) {
        return res.status(400).send('Query text is required');
    }

    try {
        // Query Dialogflow for intent detection
        const dialogflowResponse = await queryDialogflow(queryText);

        // Example: If intent is to get order status, route to the virtual agent
        if (dialogflowResponse.intent.displayName === 'OrderStatus') {
            return res.json({responseText: 'Your order is being processed.'});
        }

        // Otherwise, route to a human agent
        return res.json({responseText: 'Connecting you to an agent...'});
    } catch (err) {
        console.error('Error processing query:', err);
        return res.status(500).send('Internal Server Error');
    }
});
