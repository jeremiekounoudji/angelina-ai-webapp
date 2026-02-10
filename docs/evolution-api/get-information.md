# Get Information

Basic API information endpoint to check if the Evolution API is working and get version details.

## Endpoint

**GET** `/`

## Description

Get information about your EvolutionAPI instance, including status, version, and documentation links.

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | Yes | ID of the instance to connect |

## Response

### 200 - Success

**Content-Type:** `application/json`

| Field | Type | Description |
|-------|------|-------------|
| status | integer | The HTTP status of the response |
| message | string | Descriptive message about the current state of the API |
| version | string | The current version of the API |
| swagger | string | URL to the API's Swagger documentation |
| manager | string | URL to the API manager |
| documentation | string | URL to the detailed API documentation |

### Example Response

```json
{
  "status": 200,
  "message": "Welcome to the Evolution API, it is working!",
  "version": "1.7.4",
  "swagger": "http://example.evolution-api.com/docs",
  "manager": "http://example.evolution-api.com/manager",
  "documentation": "https://doc.evolution-api.com"
}
```

## Example Request

```bash
curl --request GET \
  --url https://{server-url}/
```