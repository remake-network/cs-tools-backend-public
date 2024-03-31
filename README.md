https://github.com/remake-network/cs-tools-frontend-public

### Ticket Status Update API
<details>
This API endpoint (/api/handleCSTicketStatus) allows for updating the status of a ticket in the system.

## Usage

### Endpoint

`POST /api/handleCSTicketStatus`

### Request Body Parameters

- `ticketID` (String): ID of the ticket to update.
- `deleteTicket` (String or Boolean): Set to `'true'` or `'false'` to delete or undelete the ticket.
- `closeTicket` (String or Boolean): Set to `'true'` or `'false'` to close or reopen the ticket.
- `pendingTicket` (String or Boolean): Set to `'true'` or `'false'` to mark the ticket as pending or not.
- `markFalse` (String or Boolean): Set to `'true'` or `'false'` to mark specific fields as `false`.
- `lockTicket` (String or Boolean): Set to `'true'` or `'false'` to lock or unlock the ticket.

### Response

- Success: `200 OK` with a JSON response containing `{ "success": "Ticket status updated successfully" }`.
- Error: `400 Bad Request` or `500 Internal Server Error` with relevant error messages in JSON format.

## Example Usage

```bash
curl -X POST http://your-server-url/api/handleCSTicketStatus \
-H "Content-Type: application/json" \
-d '{
  "ticketID": "ticket123",
  "deleteTicket": "true",
  "closeTicket": "false",
  "pendingTicket": "true",
  "markFalse": "true",
  "lockTicket": "false"
}'
```
</details>

### Ticket Information Retrieval API
<details>
This API endpoint (/api/giveCSTicketInfo) retrieves information about a customer support ticket based on the provided ticket ID.

## Usage

### Endpoint

`GET /api/giveCSTicketInfo`

### Request Body Parameters

- `ticketID` (String): ID of the ticket to retrieve information.

### Response

- Success: `200 OK` with a JSON response containing ticket information.
- Error: `404 Not Found` if the ticket is not found, or `500 Internal Server Error` for server issues.

## Example Usage

```bash
curl -X POST http://your-server-url/api/giveCSTicketInfo \
-H "Content-Type: application/json" \
-d '{"ticketID": "ticket123"}'
```
</details>

### Ticketing System API - Check Existing Ticket Endpoint
<details>

This endpoint `/api/checkExistingTicket` is part of our Ticketing System API and is used to check if a pending support ticket already exists for a member in the system.

## Endpoint Details

- **Endpoint:** `/api/checkExistingTicket`
- **Method:** `POST`

Request Format:

The endpoint expects a `POST` request containing the `memberID` in the request body.

```json
{
  "memberID": "<member's ID>"
}
```

Response Format:

If a ticket exists for the member:
```json
{
  "exists": true,
  "link": "Click [here](https://discord.com/channels/<GuildID>/<ChannelID>) to go to your existing pending support ticket."
}
```

If no ticket exists for the member:
```json
{
  "exists": false
}
```

Usage:

- **Purpose:** To check if a pending support ticket exists for a member in the system.
- **Response:**
  - If the member has an existing pending support ticket, the response indicates its existence along with the link to access it.
  - If the member does not have an existing pending support ticket, the response states its absence.

Example:

Request:
```
POST /api/checkExistingTicket HTTP/1.1
Content-Type: application/json

{
  "memberID": "1234567890"
}
```

Response (Ticket Exists):
```json
{
  "exists": true,
  "link": "Click [here](https://discord.com/channels/<GuildID>/<ChannelID>) to go to your existing pending support ticket."
}
```
</details>

### Check Blacklist API
<details>
  
# Overview

The `checkBlacklist` API endpoint is designed to determine whether a user is blacklisted from accessing the Ticket Support system. This API accepts a `memberID` and performs a lookup in the database to check if the user is blacklisted or not.

## Endpoint

- **Route**: `/api/checkBlacklist`
- **Method**: POST

## Request Format

### Headers

- `Content-Type`: `application/x-www-form-urlencoded`

### Body Parameters

- `memberID`: The unique ID of the user to be checked for blacklist status.

Example:
```json
{
  "memberID": "unique_user_id"
}
```

## Response Format

### Success Response (HTTP Status 200)

- **Success**: `{ "success": "user is not blacklisted" }`
  - Indicates that the user is not blacklisted and can access Ticket Support.

### Error Responses

- **Error**: `{ "error": "You're not allowed to access Ticket Support because of: [reason]" }`
  - Indicates that the user is blacklisted and provides the reason (if available) for the blacklist.

- **Error**: `{ "error": "An error occurred while checking the blacklist." }`
  - Indicates an internal server error occurred during the blacklist check.

## Usage

- Send a POST request to the `/api/checkBlacklist` endpoint with the `memberID` parameter to check the user's blacklist status.
- Handle the different response scenarios based on the returned status.
</details>

# Setup Guild Settings API Usage
<details>
This guide explains how to use the Guild Settings API to update guild settings and save them to MongoDB.

## Endpoint Details

The API endpoint `/api/setupGuild/:guildId` is used to setup guild settings for a specific guild.

## Endpoint Details

- **Endpoint:** `/api/setupGuild/:guildId`
- **Method:** `POST`

### Parameters

- `guildId`: ID of the guild to update settings for (in the URL)
- Request body should contain:
  - `language`: Language setting for the guild
  - `isThreadsEnabled`: Whether threads are enabled
  - `threadsCategoryID`: ID of the category for threads
  - `isSupportChannelEnabled`: Whether support channel is enabled
  - `supportChannelID`: ID of the support channel
  - `isSuggestionsEnabled`: Whether suggestions are enabled
  - `suggestionsCategoryID`: ID of the category for suggestions

### Usage Example

# Example usage of the API
```javascript
const request = require('request');

const guildId = 'YOUR_GUILD_ID';
const apiUrl = 'http://localhost:3000/api/setupGuild/:guildId';

const requestData = {
  language: 'en',
  isThreadsEnabled: true,
  threadsCategoryID: 'THREADS_CATEGORY_ID',
  isSupportChannelEnabled: true,
  supportChannelID: 'SUPPORT_CHANNEL_ID',
  isSuggestionsEnabled: true,
  suggestionsCategoryID: 'SUGGESTIONS_CATEGORY_ID',
};

request.post({
  url: `${apiUrl}/api/setupGuild/${guildId}`,
  json: requestData
}, (error, response, body) => {
  if (!error && response.statusCode === 200) {
    console.log('Guild settings updated successfully:', body);
  } else {
    console.error('Failed to update guild settings:', error || body);
  }
});
```
</details>


## Check User Language
<details>
  Retrieves the language of a user based on the provided memberID

  ## Endpoint Details
  
  - Endpoint: `POST /api/checkUserLanguage`
  - Description: Retrieves the language preference of a user based on their member ID
 
  ## Request Parameters
  
  - `memberID`: (String) The ID of the member whose language preference needs to be checked

  ## Response
  
  - `200 OK`: Successful response with user's language preference
    - `success`: `true` (Boolean) Indicates the success of the operation
    - `language`: (String) The language preference of the user (if found). Defaults to 'en' (English) if not found.
  - `500 Internal Server Error`: Error response in case of an unexpected error
    - `error`: 'An error occurred while checking the user language.'

  ## Example Usage (using axios in JavaScript)

```javascript
const axios = require('axios');

const memberID = 'user_member_id'; // Replace 'user_member_id' with the actual member ID

try {
  const response = await axios.post('http://localhost:3000/api/checkUserLanguage', {
    memberID: memberID,
  });

  console.log('User language:', response.data.language);
} catch (error) {
  console.error('Error:', error.response.data.error);
}
```
</details>
