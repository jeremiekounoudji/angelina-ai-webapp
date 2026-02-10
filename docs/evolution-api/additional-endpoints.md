# Additional Endpoints

This document covers additional important endpoints that are part of the Evolution API.

## Profile Settings

Profile management endpoints for WhatsApp business and personal profiles.

### Available Endpoints
- **POST** `Fetch Business Profile` - Get business profile information
- **POST** `Fetch Profile` - Get personal profile details
- **POST** `Update Profile Name` - Change profile display name
- **POST** `Update Profile Status` - Update profile status message
- **POST** `Update Profile Picture` - Change profile picture
- **DEL** `Remove Profile Picture` - Delete profile picture
- **GET** `Fetch Privacy Settings` - Get current privacy settings
- **POST** `Update Privacy Settings` - Modify privacy preferences

## Group Controller

Comprehensive group management functionality for WhatsApp groups.

### Group Management
- **POST** `Create Group` - Create new WhatsApp groups
- **POST** `Update Group Picture` - Change group profile picture
- **POST** `Update Group Subject` - Modify group name
- **POST** `Update Group Description` - Update group description

### Invite Management
- **GET** `Fetch Invite Code` - Get group invite link
- **POST** `Revoke Invite Code` - Invalidate current invite link
- **POST** `Send Group Invite` - Send invite to contacts
- **GET** `Find Group by Invite Code` - Get group info from invite
- **GET** `Find Group by JID` - Find group by identifier

### Group Operations
- **GET** `Fetch All Groups` - List all groups
- **GET** `Find Group Members` - Get participant list
- **POST** `Update Group Members` - Add/remove participants
- **POST** `Update Group Setting` - Modify group settings
- **POST** `Toggle Ephemeral` - Enable/disable disappearing messages
- **DEL** `Leave Group` - Exit from group

## Message Types

The Send Message section includes various message types:

### Text & Media
- **POST** `Send Plain Text` - Basic text messages
- **POST** `Send Status` - WhatsApp status updates
- **POST** `Send Media` - Images, videos, documents
- **POST** `Send WhatsApp Audio` - Voice messages
- **POST** `Send Sticker` - Sticker messages

### Interactive Messages
- **POST** `Send Location` - Share location
- **POST** `Send Contact` - Share contact information
- **POST** `Send Reaction` - React to messages
- **POST** `Send Poll` - Create polls
- **POST** `Send List` - Interactive lists
- **POST** `Send Buttons` - Button templates

## Instance Management (Additional)

Beyond basic instance operations:

- **PUT** `Restart Instance` - Restart WhatsApp instance
- **GET** `Connection State` - Check connection status
- **DEL** `Logout Instance` - Disconnect instance
- **DEL** `Delete Instance` - Remove instance completely
- **POST** `Set Presence` - Set online/typing status

## Chat Operations (Additional)

Extended chat functionality:

- **POST** `Check is WhatsApp` - Verify WhatsApp numbers
- **POST** `Mark Message As Read/Unread` - Message status
- **POST** `Archive Chat` - Archive conversations
- **DEL** `Delete Message for Everyone` - Recall messages
- **POST** `Update Message` - Edit sent messages
- **POST** `Send Presence` - Typing indicators
- **POST** `Update Block Status` - Block/unblock contacts
- **POST** `Fetch Profile Picture URL` - Get profile images
- **POST** `Get Base64` - Convert media to base64
- **POST** `Find Messages` - Search message history
- **POST** `Find Status Message` - Get status updates
- **POST** `Find Chats` - Search conversations

## Common Parameters

Most endpoints share these common parameters:

### Authentication
```json
{
  "headers": {
    "apikey": "your-api-key",
    "Content-Type": "application/json"
  }
}
```

### Path Parameters
- `{instance}` - Instance name (required for most endpoints)
- `{server-url}` - Your Evolution API server URL

### Response Format
Most endpoints return JSON with:
- Status codes (200, 201, 404, etc.)
- Response data specific to the endpoint
- Error messages when applicable