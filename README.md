# LED Status Backend

Express backend server for receiving and managing LED light status.

## Features

- ✅ Receive LED status updates (on/off, brightness, color)
- ✅ Multiple API endpoints for different use cases
- ✅ Input validation
- ✅ CORS support
- ✅ Health check endpoint
- ✅ In-memory storage (no database required)

## Installation

```bash
npm install
```

## Usage

### Start the server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Get Current LED Status
```
GET /api/led/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "state": "off",
    "brightness": 100,
    "color": "#FFFFFF",
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Update LED Status (POST)
```
POST /api/led/status
Content-Type: application/json

{
  "state": "on",
  "brightness": 80,
  "color": "#FF0000"
}
```

### 4. Toggle LED State (PUT)
```
PUT /api/led/state/:state
```

Example: `PUT /api/led/state/on` or `PUT /api/led/state/off`

## Request Body Parameters

| Parameter   | Type   | Required | Description                |
|-------------|--------|----------|----------------------------|
| state       | String | No       | "on" or "off"              |
| brightness  | Number | No       | 0-100 (percentage)         |
| color       | String | No       | Hex color code (e.g., #FFF)|

## Example Usage with cURL

### Turn LED on
```bash
curl -X POST http://localhost:3000/api/led/status ^
  -H "Content-Type: application/json" ^
  -d "{\"state\":\"on\",\"brightness\":100,\"color\":\"#FFFFFF\"}"
```

### Turn LED off
```bash
curl -X PUT http://localhost:3000/api/led/state/off
```

### Get current status
```bash
curl http://localhost:3000/api/led/status
```

## Project Structure

```
backend/
├── server.js          # Main Express server file
├── package.json       # Dependencies and scripts
├── .env               # Environment configuration
└── README.md          # Documentation
```

## Technologies Used

- **Express.js** - Web framework
- **body-parser** - JSON parsing middleware
- **cors** - Cross-Origin Resource Sharing

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (validation errors)
- `500` - Internal server error

## Logs

The server logs important events:
- LED status updates
- Errors and exceptions
