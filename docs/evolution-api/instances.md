# Instances

Instance management endpoints for creating, managing, and controlling WhatsApp instances.

## Create Instance

**POST** `/instance/create`

### Description

Create a new WhatsApp instance with customizable settings for messaging, webhooks, and integrations.

### Authorization

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| apikey | string | header | Yes | Your authorization key header |

### Request Body

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| instanceName | string | Yes | Instance name |
| integration | enum | Yes | WhatsApp engine (`WHATSAPP-BAILEYS`, `WHATSAPP-BUSINESS`) |
| token | string | No | API key (Enter or leave empty to create dynamically) |
| qrcode | boolean | No | Create QR Code automatically after creation |
| number | string | No | Instance owner number with Country Code (e.g., 559999999999) |
| rejectCall | boolean | No | Reject WhatsApp calls automatically |
| msgCall | string | No | Message to be sent when a call is rejected automatically |
| groupsIgnore | boolean | No | Ignore group messages |
| alwaysOnline | boolean | No | Keep WhatsApp always online |
| readMessages | boolean | No | Send read receipts to received messages |
| readStatus | boolean | No | Show sent messages read status |
| syncFullHistory | boolean | No | Synchronize full WhatsApp history with EvolutionAPI |
| proxyHost | string | No | Proxy host |
| proxyPort | string | No | Proxy port |
| proxyProtocol | string | No | Proxy protocol |
| proxyUsername | string | No | Proxy username |
| proxyPassword | string | No | Proxy password |
| webhook | object | No | Webhook configuration |
| rabbitmq | object | No | RabbitMQ configuration |
| sqs | object | No | SQS configuration |
| chatwootAccountId | integer | No | Chatwoot account ID |
| chatwootToken | string | No | Chatwoot authentication token |
| chatwootUrl | string | No | Chatwoot server URL |
| chatwootSignMsg | boolean | No | Send message signature on Chatwoot |
| chatwootReopenConversation | boolean | No | Reopen conversation on Chatwoot |
| chatwootConversationPending | boolean | No | Chatwoot conversation pending setting |
| chatwootImportContacts | boolean | No | Import Chatwoot contacts |
| chatwootNameInbox | string | No | Name inbox chatwoot |
| chatwootMergeBrazilContacts | boolean | No | Merge Brazil contacts setting |
| chatwootImportMessages | boolean | No | Import chatwoot messages |
| chatwootDaysLimitImportMessages | integer | No | Limit message import chatwoot |
| chatwootOrganization | string | No | Evolution Bot organization |
| chatwootLogo | string | No | Chatwoot logo URL |

### Response

#### 201 - Created

**Content-Type:** `application/json`

| Field | Type | Description |
|-------|------|-------------|
| instance | object | Instance details |
| hash | object | API key information |
| settings | object | Instance settings |

### Example Request

```bash
curl --request POST \
  --url https://{server-url}/instance/create \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
    "instanceName": "my-instance",
    "integration": "WHATSAPP-BAILEYS",
    "qrcode": true,
    "number": "559999999999"
  }'
```

### Example Response

```json
{
  "instance": {
    "instanceName": "teste-docs",
    "instanceId": "af6c5b7c-ee27-4f94-9ea8-192393746ddd",
    "webhook_wa_business": null,
    "access_token_wa_business": "",
    "status": "created"
  },
  "hash": {
    "apikey": "123456"
  },
  "settings": {
    "reject_call": false,
    "msg_call": "",
    "groups_ignore": true,
    "always_online": false,
    "read_messages": false,
    "read_status": false,
    "sync_full_history": false
  }
}
```

## Fetch Instances

**GET** `/instance/fetchInstances`

### Description

Retrieve information about existing WhatsApp instances.

### Authorization

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| apikey | string | header | Yes | Your authorization key header |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instanceName | string | No | Name of the instance to be fetched |
| instanceId | string | No | ID of the instance to be fetched |

### Response

#### 200 - Success

**Content-Type:** `application/json`

| Field | Type | Description |
|-------|------|-------------|
| status | integer | The HTTP status of the response |
| error | string | The error message indicating the type of error |
| response | object | Response data containing instance information |

### Example Request

```bash
curl --request GET \
  --url https://{server-url}/instance/fetchInstances \
  --header 'apikey: <api-key>'
```

### Example Response

```json
[
  {
    "instance": {
      "instanceName": "example-name",
      "instanceId": "421a4121-a3d9-40cc-a8db-c3a1df353126",
      "owner": "553198296801@s.whatsapp.net",
      "profileName": "Guilherme Gomes",
      "profilePictureUrl": null,
      "profileStatus": "This is the profile status.",
      "status": "open",
      "serverUrl": "https://example.evolution-api.com",
      "apikey": "B3844804-481D-47A4-B69C-F14B4206EB56",
      "integration": {
        "integration": "WHATSAPP-BAILEYS",
        "webhook_wa_business": "https://example.evolution-api.com/webhook/whatsapp/db5e11d3-ded5-4d91-b3fb-48272688f206"
      }
    }
  },
  {
    "instance": {
      "instanceName": "teste-docs",
      "instanceId": "af6c5b7c-ee27-4f94-9ea8-192393746ddd",
      "status": "close",
      "serverUrl": "https://example.evolution-api.com",
      "apikey": "123456",
      "integration": {
        "token": "123456",
        "webhook_wa_business": "https://example.evolution-api.com/webhook/whatsapp/teste-docs"
      }
    }
  }
]
```

## Instance Connect

**GET** `/instance/connect/{instance}`

### Description

Connect to a WhatsApp instance and get pairing code for authentication.

### Authorization

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| apikey | string | header | Yes | Your authorization key header |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | Yes | Name of the instance to connect |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | string | No | Phone number (with country code) to be connected |

### Response

#### 200 - Success

**Content-Type:** `application/json`

| Field | Type | Description |
|-------|------|-------------|
| pairingCode | string | The unique code used for pairing a device or account |
| code | string | A specific code associated with the pairing process |
| count | integer | The count or number of attempts or instances related to the pairing process |

### Example Request

```bash
curl --request GET \
  --url https://{server-url}/instance/connect/{instance} \
  --header 'apikey: <api-key>'
```

### Example Response

```json
{
  "pairingCode": "WZYEH1YY",
  "code": "2@y8eK+bjtEjUWy9/FOM...",
  "count": 1
}
```