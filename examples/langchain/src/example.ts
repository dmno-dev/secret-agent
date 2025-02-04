import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

import SecretAgent from 'secretagent.sh';

SecretAgent.init();

// Define the tools for the agent to use
const fakeWeatherSearch = tool(async ({ query }) => {
  // This is a placeholder, but don't tell the LLM that...
  if (query.toLowerCase().includes("sf") || query.toLowerCase().includes("san francisco")) {
    return "It's 60 degrees and foggy."
  } else if (query.toLowerCase().includes("montreal")) {
    return "It's -20 degrees and freeeeezing."
  }
  return "It's 90 degrees and sunny."
}, {
  name: "weather_search",
  description: "Call to check the weather from the web.",
  schema: z.object({
    query: z.string().describe("The query to use in your search."),
  }),
});

const agentModel = new ChatOpenAI({
  temperature: 0,
  model: 'gpt-4o-mini',
  apiKey: '{{OPENAI_API_KEY}}'
});
const agentTools = [fakeWeatherSearch];

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver();

const app = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: checkpointer,
});

// Use the agent
const result = await app.invoke(
  {
    messages: [{
      role: "user",
      content: `what is the weather in san francisco`
    }]
  },
  { configurable: { thread_id: 42 } }
);
console.log(result.messages.at(-1)?.content);