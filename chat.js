import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [websocket, setWebsocket] = useState(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onopen = () => console.log('WebSocket connection established');
        ws.onmessage = (e) => {
            setMessages((prevMessages) => [...prevMessages, e.data]);
        };
        setWebsocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    const handleSendMessage = async () => {
        if (message.trim()) {
            setMessages([...messages, message]);
            websocket.send(message);

            try {
                const response = await axios.post('YOUR_CLOUD_FUNCTION_URL', {
                    queryText: message
                });
                setMessages([...messages, response.data.responseText]);
            } catch (error) {
                console.error('Error sending message:', error);
            }

            setMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default Chat;
