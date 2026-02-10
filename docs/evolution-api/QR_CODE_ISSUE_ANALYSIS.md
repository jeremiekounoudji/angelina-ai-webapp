# Evolution API QR Code Generation Issue - Analysis & Solution

## Issue Summary

**GitHub Issue**: #2313 - "Railway, the QR Code is not generated in the instance"
**Status**: Open (Confirmed Bug)
**Affected Versions**: v2.2.3, v2.3.6, v2.3.7
**Deployment**: Railway (and potentially other cloud deployments)

## Problem Description

When creating a WhatsApp instance via Evolution API on Railway deployment, the QR code is not generated. The `/instance/connect/{instance}` endpoint returns:

```json
{
  "pairingCode": null,
  "code": null,
  "count": 0
}
```

The `count: 0` indicates that the QR code generation has not completed or failed silently.

## Root Cause

This is a **known bug in Evolution API** on Railway deployment. The issue appears to be related to:

1. **Timing Issue**: The QR code generation requires time to initialize after instance creation
2. **Deployment-Specific**: Occurs specifically on Railway and potentially other cloud deployments
3. **Not a Client Issue**: The API endpoint works correctly, but the backend QR code generation fails

## Related Issues

- **#2313**: Railway, the QR Code is not generated in the instance (Dec 13, 2025)
- **#2284**: evolution API v2.2.3 - QR CODE nao sendo gerado (Dec 4, 2025)
- **#2285**: Could not link the device via QR code (Dec 4, 2025)
- **#2295**: When i link my WhatsApp with the Qr code the session still loading on Logging and then terminates immediately

## Workaround Solutions

### Solution 1: Use Pairing Code Instead of QR Code (Recommended)

When QR code generation fails, fall back to the **pairing code method**:

```typescript
// First attempt: Get QR code
const response = await fetch(`${API_URL}/instance/connect/${instanceName}`, {
  headers: { 'apikey': API_KEY }
});

const data = await response.json();

// If QR code fails (count: 0), use pairing code instead
if (!data.code && !data.base64) {
  // Retry with phone number to get pairing code
  const pairingResponse = await fetch(
    `${API_URL}/instance/connect/${instanceName}?number=${phoneNumber}`,
    { headers: { 'apikey': API_KEY } }
  );
  
  const pairingData = await pairingResponse.json();
  // Use pairingData.pairingCode for manual entry
}
```

### Solution 2: Increase Retry Delay

The QR code may take longer to generate on Railway. Increase the retry delay:

```typescript
// Retry with longer delays (up to 30 seconds)
const maxRetries = 15;
const initialDelay = 2000; // Start with 2 seconds
const maxDelay = 3000; // Max 3 seconds between retries
```

### Solution 3: Use Different Integration

Try using `WHATSAPP-BUSINESS` integration instead of `WHATSAPP-BAILEYS`:

```typescript
const response = await fetch(`${API_URL}/instance/create`, {
  method: 'POST',
  headers: { 'apikey': API_KEY },
  body: JSON.stringify({
    instanceName: 'my-instance',
    integration: 'WHATSAPP-BUSINESS', // Try this instead
    qrcode: true
  })
});
```

**Note**: This may require additional WhatsApp Business API credentials.

## Implementation in Angelina AI

The `useWhatsAppConnect` hook now implements **Solution 1** with automatic fallback:

1. **Primary Method**: Attempts to get QR code (without phone number)
2. **Retry Logic**: Retries up to 10 times with exponential backoff
3. **Fallback Method**: If QR code fails, automatically switches to pairing code method
4. **User Experience**: Shows both QR code (if available) and pairing code as alternatives

### Code Changes

```typescript
const getConnectionCodeWithRetry = async (
  instanceName: string,
  phoneNumber: string,
  maxRetries: number = 10,
  initialDelay: number = 1000
): Promise<ConnectionResponse> => {
  // Try QR code first
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await getConnectionCode(instanceName);
    
    if (response.code || response.base64) {
      return response; // QR code generated successfully
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Fallback: Use pairing code method
  const pairingResponse = await getConnectionCode(instanceName, phoneNumber);
  return pairingResponse;
};
```

## UI/UX Considerations

The WhatsApp connection modal now displays:

1. **QR Code** (if available) - Primary method
2. **Pairing Code** (always available) - Manual entry alternative
3. **Instructions** - Clear steps for both methods
4. **Status Indicator** - Shows connection progress

## Testing Recommendations

1. Test with actual WhatsApp account on Railway deployment
2. Verify pairing code method works as fallback
3. Monitor connection status polling
4. Test with different phone number formats
5. Verify database storage of instance data

## Future Improvements

1. Monitor Evolution API updates for QR code fix
2. Consider implementing webhook-based connection status updates
3. Add support for multiple connection methods
4. Implement connection retry logic with exponential backoff
5. Add analytics to track which connection method succeeds

## References

- Evolution API GitHub: https://github.com/EvolutionAPI/evolution-api
- Issue #2313: https://github.com/EvolutionAPI/evolution-api/issues/2313
- Issue #2284: https://github.com/EvolutionAPI/evolution-api/issues/2284
- Issue #2285: https://github.com/EvolutionAPI/evolution-api/issues/2285
