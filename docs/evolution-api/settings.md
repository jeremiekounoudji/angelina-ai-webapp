# Settings

Settings management endpoints for configuring instance-specific settings and preferences.

## Set Settings

**POST** `/settings/set/{instance}`

### Description

Configure various settings for a WhatsApp instance including call handling, message behavior, and other preferences.

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

Common settings include:
- `rejectCall` - Automatically reject incoming calls
- `msgCall` - Message to send when rejecting calls
- `groupsIgnore` - Ignore group messages
- `alwaysOnline` - Keep instance always online
- `readMessages` - Send read receipts
- `readStatus` - Show read status for sent messages
- `syncFullHistory` - Sync complete chat history

### Example Request

```bash
curl --request POST \
  --url https://{server-url}/settings/set/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
    "rejectCall": true,
    "msgCall": "Sorry, I cannot take calls right now.",
    "groupsIgnore": false,
    "alwaysOnline": true,
    "readMessages": true,
    "readStatus": true,
    "syncFullHistory": false
  }'
```

## Find Settings

**GET** `/settings/find/{instance}`

### Description

Retrieve current settings configuration for a specific instance.

### Authorization

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| apikey | string | header | Yes | Your authorization key header |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | Yes | Name of the instance |

### Example Request

```bash
curl --request GET \
  --url https://{server-url}/settings/find/{instance} \
  --header 'apikey: <api-key>'
```