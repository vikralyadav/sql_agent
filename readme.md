# SQL Agent

A LangChain-powered SQL agent that can answer natural language questions about data in a SQLite database using Google's Gemini Pro model and Ollama embeddings.

## Features

- Natural language queries to SQL database (Chinook DB)
- Integration with Google's Gemini-1.5-pro model
- Local embeddings generation using Ollama
- Human-in-the-loop approval for SQL queries
- Automatic database download and management

## Prerequisites

- Node.js
- Google Cloud API key for Gemini Pro
- Ollama installed locally
- Environment variables configured in `.env` file

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your Google API key:

```
GOOGLE_GENAI_API_KEY=your_api_key_here
```

## Usage

Run the agent with:

```bash
node agent.js
```

The agent will:
1. Download the Chinook SQLite database if not present locally
2. Initialize the SQL database connection
3. Process natural language queries using the Gemini Pro model
4. Generate embeddings using Ollama when needed
5. Present SQL queries for human approval before execution

## Dependencies

- @langchain/classic
- @langchain/community
- @langchain/core
- @langchain/google-genai
- @langchain/langgraph
- dotenv
- langchain
- ollama
- sqlite3
- typeorm
- zod

## Example Query

The agent can answer questions like:
```
"Which genre on average has the longest tracks?"
```

## License

ISC