import fetch from 'node-fetch';

async function testServer() {
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    console.log('Health check response:', await healthResponse.json());

    // Test chat endpoint
    console.log('\nTesting chat endpoint...');
    const chatResponse = await fetch('http://localhost:3001/poke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello! What can you do?',
      }),
    });
    console.log('Chat response:', await chatResponse.json());
  } catch (error) {
    console.error('Error testing server:', error);
  }
}

testServer();
