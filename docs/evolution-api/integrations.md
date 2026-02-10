# Integrations

Evolution API supports multiple third-party integrations for enhanced functionality and workflow automation.

## Available Integrations

### Typebot
- **Create Typebot** - Set up conversational flows
- **Start Typebot** - Initiate typebot sessions
- **Find/Fetch Typebot** - Retrieve typebot configurations
- **Update/Delete Typebot** - Manage typebot instances
- **Session Management** - Control typebot sessions
- **Settings** - Configure typebot behavior

### OpenAI
- **Create OpenAI Bot** - Set up AI-powered chatbots
- **Bot Management** - Find, update, delete bots
- **Credentials** - Manage OpenAI API credentials
- **Settings** - Configure bot behavior and responses
- **Sessions** - Monitor active AI conversations

### Evolution Bot
- **Create Evolution Bot** - Native Evolution API bot
- **Bot Management** - Full CRUD operations
- **Settings** - Configure bot parameters
- **Session Control** - Manage bot sessions

### Dify
- **Create Dify Bot** - Integrate with Dify platform
- **Bot Management** - Complete bot lifecycle
- **Settings** - Configure Dify integration
- **Status Management** - Control bot status

### Flowise
- **Create Flowise Bot** - Set up Flowise workflows
- **Bot Management** - Manage Flowise instances
- **Settings** - Configure Flowise parameters
- **Session Management** - Control workflow sessions

### Chatwoot
- **Set Chatwoot** - Configure Chatwoot integration
- **Find Chatwoot** - Retrieve Chatwoot settings

### Communication Integrations

#### Websocket
- **Set Websocket** - Configure WebSocket connections
- **Find Websocket** - Retrieve WebSocket settings

#### SQS (Amazon Simple Queue Service)
- **Set SQS** - Configure SQS integration
- **Find SQS** - Retrieve SQS settings

#### RabbitMQ
- **Set RabbitMQ** - Configure RabbitMQ messaging
- **Find RabbitMQ** - Retrieve RabbitMQ settings

## Common Integration Patterns

All integrations follow similar patterns:

### Authentication
- API key authentication via header
- Instance-specific configuration

### CRUD Operations
- **Create** - Set up new integration
- **Find/Fetch** - Retrieve configuration
- **Update** - Modify settings
- **Delete** - Remove integration

### Settings Management
- **Set Settings** - Configure integration parameters
- **Find Settings** - Retrieve current settings

### Session Control
- **Start/Stop** - Control integration sessions
- **Change Status** - Enable/disable integrations
- **Find Sessions** - Monitor active sessions

## Base URL Pattern

Most integration endpoints follow the pattern:
```
https://{server-url}/{integration-name}/{action}/{instance}
```

Examples:
- `/openai/create/{instance}`
- `/typebot/start/{instance}`
- `/chatwoot/set/{instance}`