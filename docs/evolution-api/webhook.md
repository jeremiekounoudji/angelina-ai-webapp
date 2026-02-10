# Webhook

Webhook configuration endpoints for setting up and managing webhook notifications.

## Set Webhook

**POST** `/webhook/set/{instance}`

### Description

Configure webhook settings for a specific instance to receive event notifications.

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
| enabled | boolean | Yes | Enable webhook to instance |
| url | string | Yes | Webhook URL |
| webhookByEvents | boolean | Yes | Enables Webhook by events |
| webhookBase64 | boolean | Yes | Sends files in base64 when available |
| events | enum<string>[] | Yes | Events to be sent to the Webhook (minimum length: 1) |

### Available Events

The `events` array can include various event types such as:
- `APPLICATION_STARTUP`
- And other webhook events (expand child attributes in the API docs for full list)

### Response

#### 201 - Created

**Content-Type:** `application/json`

| Field | Type | Description |
|-------|------|-------------|
| webhook | object | Webhook configuration details |

### Example Request

```bash
curl --request POST \
  --url https://{server-url}/webhook/set/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
    "enabled": true,
    "url": "https://example.com/webhook",
    "webhookByEvents": true,
    "webhookBase64": true,
    "events": ["APPLICATION_STARTUP"]
  }'
```

### Example Response

```json
{
  "webhook": {
    "instanceName": "teste-docs",
    "webhook": {
      "url": "https://example.com",
      "events": ["APPLICATION_STARTUP"],
      "enabled": true
    }
  }
}
```

## Find Webhook

**GET** `/webhook/find/{instance}`

### Description

Retrieve the current webhook configuration for a specific instance.

### Authorization

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| apikey | string | header | Yes | Your authorization key header |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | Yes | Name of the instance |

### Response

#### 200 - Success

**Content-Type:** `application/json`

| Field | Type | Description |
|-------|------|-------------|
| enabled | boolean | Indicates whether the webhook is enabled |
| url | string | The URL of the webhook |
| events | string[] | List of events the webhook is subscribed to |

### Example Request

```bash
curl --request GET \
  --url https://{server-url}/webhook/find/{instance} \
  --header 'apikey: <api-key>'
```

### Example Response

```json
{
  "enabled": true,
  "url": "https://example.com",
  "events": ["APPLICATION_STARTUP"]
}
```