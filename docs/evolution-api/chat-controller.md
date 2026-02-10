# Chat Controller

Chat management endpoints for handling WhatsApp conversations, contacts, messages, and chat operations.

## Find Contacts

**POST** `/chat/findContacts/{instance}`

### Description

Search and retrieve contacts from the WhatsApp instance based on specified criteria.

### Authorization

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| apikey | string | header | Yes | Your authorization key header |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | Yes | Name instance |

### Request Body

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| where | object | Yes | Search criteria for finding contacts |

### Where Object Structure

The `where` object can contain various search parameters:
```json
{
  "id": "contact_id_or_phone_number"
}
```

### Example Request

```bash
curl --request POST \
  --url https://{server-url}/chat/findContacts/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
    "where": {
      "id": "5511999999999@s.whatsapp.net"
    }
  }'
```

## Other Chat Controller Endpoints

The Chat Controller section includes many other important endpoints:

### Message Management
- **POST** `Check is WhatsApp` - Verify if a number is on WhatsApp
- **POST** `Mark Message As Read` - Mark messages as read
- **POST** `Mark Message As Unread` - Mark messages as unread
- **DEL** `Delete Message for Everyone` - Delete messages for all participants
- **POST** `Update Message` - Edit/update sent messages

### Chat Operations
- **POST** `Archive Chat` - Archive chat conversations
- **POST** `Send Presence` - Send typing/online presence indicators
- **POST** `Update Block Status` - Block/unblock contacts

### Data Retrieval
- **POST** `Fetch Profile Picture URL` - Get profile picture URLs
- **POST** `Get Base64` - Convert media to base64 format
- **POST** `Find Messages` - Search for messages in chats
- **POST** `Find Status Message` - Find WhatsApp status messages
- **POST** `Find Chats` - Search for chat conversations

Each endpoint follows similar patterns with:
- API key authentication
- Instance path parameter
- JSON request bodies with specific parameters
- Structured JSON responses

For detailed parameters and examples of each endpoint, refer to the Evolution API documentation at the specific endpoint URLs.