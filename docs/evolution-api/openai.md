# OpenAI Integration

OpenAI integration endpoints for creating and managing AI-powered chatbots using OpenAI's GPT models.

## Create OpenAI Bot

**POST** `/openai/create/{instance}`

### Description

Create an OpenAI-powered chatbot for a WhatsApp instance with customizable behavior, triggers, and responses.

### Authorization

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| apikey | string | header | Yes | Your authorization key header |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | Yes | Name of the instance |

### Request Body

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | boolean | Yes | Indicates whether the bot is enabled |
| openaiCredsId | string | Yes | ID of the OpenAI credentials |
| botType | string | Yes | Type of the bot (e.g., 'assistant') |
| assistantId | string | Yes | Unique identifier for the assistant |
| functionUrl | string | Yes | URL for additional bot functionality |
| model | string | Yes | Model to be used (e.g., 'gpt-4o') |
| systemMessages | string[] | Yes | Messages to define system behavior |
| assistantMessages | string[] | Yes | Predefined assistant messages |
| userMessages | string[] | Yes | Predefined user messages |
| maxTokens | integer | Yes | Maximum number of tokens per interaction |
| triggerType | string | Yes | Type of trigger for the bot |
| triggerOperator | string | Yes | Operator for trigger evaluation |
| triggerValue | string | Yes | Value to trigger the bot |
| expire | integer | Yes | Expiration time in seconds |
| keywordFinish | string | Yes | Keyword to terminate the bot interaction |
| delayMessage | integer | Yes | Delay before the bot responds, in milliseconds |
| unknownMessage | string | Yes | Message to display for unrecognized input |
| listeningFromMe | boolean | Yes | Indicates if the bot listens to messages from the user |
| stopBotFromMe | boolean | Yes | Indicates if the bot can be stopped by the user |
| keepOpen | boolean | Yes | Indicates if the bot session remains open |
| debounceTime | integer | Yes | Debounce time for message processing |
| ignoreJids | string[] | Yes | List of JIDs to ignore |

### Example Request

```bash
curl --request POST \
  --url https://{server-url}/openai/create/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
    "enabled": true,
    "openaiCredsId": "creds_123",
    "botType": "assistant",
    "assistantId": "asst_123",
    "functionUrl": "https://example.com/functions",
    "model": "gpt-4o",
    "systemMessages": ["You are a helpful restaurant assistant"],
    "assistantMessages": ["Hello! How can I help you today?"],
    "userMessages": ["Hi", "Hello"],
    "maxTokens": 1000,
    "triggerType": "keyword",
    "triggerOperator": "equals",
    "triggerValue": "start",
    "expire": 3600,
    "keywordFinish": "stop",
    "delayMessage": 1000,
    "unknownMessage": "I dont understand. Please try again.",
    "listeningFromMe": false,
    "stopBotFromMe": true,
    "keepOpen": true,
    "debounceTime": 500,
    "ignoreJids": []
  }'
```

## Other OpenAI Endpoints

The OpenAI integration includes several other endpoints:

### Bot Management
- **GET** `Find OpenAI Bot` - Retrieve specific bot configuration
- **GET** `Find OpenAI Bots` - List all OpenAI bots
- **PUT** `Update Bot` - Update bot configuration
- **DEL** `Delete OpenAI Bot` - Remove bot

### Credentials Management
- **GET** `Find OpenAI Creds` - Get OpenAI credentials
- **POST** `Creds config OpenAI` - Configure OpenAI credentials
- **DEL** `Delete OpenAI Bot` - Delete credentials

### Settings & Sessions
- **POST** `Settings config OpenAI` - Configure bot settings
- **GET** `Find settings OpenAI` - Get current settings
- **POST** `Change status OpenAI` - Enable/disable bot
- **GET** `Find sessions OpenAI` - Get active sessions

Each endpoint follows similar authentication and parameter patterns for comprehensive OpenAI bot management.