# Send Message

Message sending endpoints for various types of WhatsApp messages including text, media, location, contacts, and more.

## Send Plain Text

**POST** `/message/sendText/{instance}`

### Description

Send a plain text message to a WhatsApp number with optional features like mentions, link preview, and quoted messages.

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
| number | string | Yes | Number to receive the message (with country code) |
| text | string | Yes | Text message to send |
| delay | integer | No | Presence time in milliseconds before sending message |
| linkPreview | boolean | No | Shows a preview of the target website if there's a link within the message |
| mentionsEveryOne | boolean | No | Mentioned everyone when the message send |
| mentioned | enum<string>[] | No | Numbers to mention |
| quoted | object | No | Message to quote/reply to |

### Quoted Message Object

The `quoted` object structure:
```json
{
  "key": {
    "id": "message_id"
  },
  "message": {
    "conversation": "original_message_text"
  }
}
```

### Response

#### 201 - Created

**Content-Type:** `application/json`

| Field | Type | Description |
|-------|------|-------------|
| key | object | Message key information |
| message | object | Message content details |
| messageTimestamp | string | The timestamp of the message |
| status | string | The status of the message |

### Example Request

```bash
curl --request POST \
  --url https://{server-url}/message/sendText/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
    "number": "5511999999999",
    "text": "Hello! This is a test message.",
    "delay": 1000,
    "linkPreview": true,
    "mentionsEveryOne": false,
    "mentioned": ["5511888888888"]
  }'
```

### Example Response

```json
{
  "key": {
    "remoteJid": "553198296801@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE594145F4C59B4"
  },
  "message": {
    "extendedTextMessage": {
      "text": "Olá!"
    }
  },
  "messageTimestamp": "1717689097",
  "status": "PENDING"
}
```