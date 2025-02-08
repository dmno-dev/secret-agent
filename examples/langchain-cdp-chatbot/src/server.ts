import { HumanMessage } from '@langchain/core/messages';
import 'dmno/auto-inject-globals';
import express from 'express';
import { initializeAgent } from './chatbot';

const app = express();
app.use(express.json());

const port = process.env.PORT || 3001;

// Initialize the agent
let agent: any;
let config: any;

async function setup() {
  const result = await initializeAgent();
  agent = result.agent;
  config = result.config;
}

// Set up the agent
setup().catch((error) => {
  console.error('Failed to initialize agent:', error);
  process.exit(1);
});

// Chat endpoint
app.post('/poke', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid request body. Expected { text: string }',
      });
    }

    // Use the agent to process the message
    const stream = await agent.stream({ messages: [new HumanMessage(text)] }, config);

    let response = '';
    for await (const chunk of stream) {
      if ('agent' in chunk) {
        response += chunk.agent.messages[0].content;
      } else if ('tools' in chunk) {
        response += chunk.tools.messages[0].content;
      }
    }

    return res.json({ text: response });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
