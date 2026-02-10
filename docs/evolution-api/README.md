# Evolution API Documentation

This folder contains comprehensive documentation for the Evolution API v2, organized by API sections.

## API Sections

### Core API
- [Get Information](./get-information.md) - Basic API information endpoint
- [Instances](./instances.md) - Instance management endpoints (Create, Fetch, Connect)
- [Webhook](./webhook.md) - Webhook configuration endpoints (Set, Find)
- [Settings](./settings.md) - Settings management endpoints (Set, Find)

### Messaging
- [Send Message](./send-message.md) - Message sending endpoints (Text, Media, Interactive)
- [Chat Controller](./chat-controller.md) - Chat management endpoints (Contacts, Messages, Operations)

### Integrations
- [OpenAI](./openai.md) - OpenAI integration endpoints (Create Bot, Manage, Settings)
- [Integrations Overview](./integrations.md) - All available integrations (Typebot, Dify, Flowise, etc.)

### Additional Features
- [Additional Endpoints](./additional-endpoints.md) - Profile Settings, Group Controller, and more

## Quick Reference

### Most Common Endpoints

#### Instance Management
- `POST /instance/create` - Create new WhatsApp instance
- `GET /instance/fetchInstances` - List all instances
- `GET /instance/connect/{instance}` - Connect instance and get QR code

#### Messaging
- `POST /message/sendText/{instance}` - Send text messages
- `POST /message/sendMedia/{instance}` - Send media files
- `POST /chat/findContacts/{instance}` - Find contacts

#### Webhooks
- `POST /webhook/set/{instance}` - Configure webhooks
- `GET /webhook/find/{instance}` - Get webhook settings

#### AI Integration
- `POST /openai/create/{instance}` - Create OpenAI chatbot
- `POST /typebot/set/{instance}` - Set up Typebot flows

## Base URL

```
https://{server-url}/
```

## Authentication

Most endpoints require API key authentication. Check individual endpoint documentation for specific requirements.