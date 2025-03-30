import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:5000/ws');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
});

ws.on('message', function incoming(data) {
  console.log('Received message:', JSON.parse(data.toString()));
  setTimeout(() => process.exit(0), 1000);
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
  process.exit(1);
});

// Exit after 5 seconds if no response
setTimeout(() => {
  console.log('No response received, exiting...');
  process.exit(1);
}, 5000);
