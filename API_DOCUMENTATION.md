# Neurolab Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication
#### Login
```http
POST /auth/login
```
Request body:
```json
{
  "email": "string",
  "password": "string"
}
```
Response:
```json
{
  "success": true,
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Register
```http
POST /auth/register
```
Request body:
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "string"
}
```

### User Management
#### Get Profile
```http
GET /user/me
```
Response:
```json
{
  "success": true,
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "role": "string",
    "avatar": "string"
  }
}
```

#### Update Profile
```http
PUT /user/me
```
Request body:
```json
{
  "fullName": "string",
  "email": "string"
}
```

#### Change Password
```http
PUT /user/change-password
```
Request body:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### Delete Account
```http
DELETE /user/me
```

### Device Management
All device routes require authentication.

#### Create Device
```http
POST /device
```
Request body:
```json
{
  "name": "string",
  "type": "string",
  "serialNumber": "string"
}
```

#### Get Device
```http
GET /device/:deviceId
```

#### Update Device
```http
PUT /device/:deviceId
```
Request body:
```json
{
  "name": "string",
  "type": "string",
  "status": "string"
}
```

#### Delete Device
```http
DELETE /device/:deviceId
```

#### Get Device Status
```http
GET /device/:deviceId/status
```

#### Assign Device
```http
POST /device/:deviceId/assign
```
Request body:
```json
{
  "userId": "string"
}
```

### Analysis Management
All analysis routes require authentication.

#### Create Analysis
```http
POST /analysis
```
Request body:
```json
{
  "deviceId": "string",
  "type": "string",
  "parameters": {}
}
```

#### Get Device Analyses
```http
GET /analysis/device/:deviceId
```

#### Get Analysis
```http
GET /analysis/:analysisId
```

#### Update Analysis Status
```http
PUT /analysis/:analysisId/status
```
Request body:
```json
{
  "status": "string"
}
```

### Review Management
#### Create Review
```http
POST /review
```
Request body:
```json
{
  "content": "string",
  "rating": "number"
}
```

#### Get All Reviews (Admin Only)
```http
GET /review
```

#### Get Review by ID (Admin Only)
```http
GET /review/:id
```

### Partnership Management
#### Request Partnership
```http
POST /partnership
```
Request body:
```json
{
  "organizationName": "string",
  "contactPerson": "string",
  "email": "string",
  "phone": "string",
  "message": "string"
}
```

#### Get Partnership Request (Admin Only)
```http
GET /partnership/:id
```

### Session Management
All session routes require authentication.

#### Create Session
```http
POST /session
```
Request body:
```json
{
  "deviceId": "string",
  "type": "string",
  "parameters": {}
}
```

#### End Session
```http
POST /session/:sessionId/end
```

#### Add Analysis Result
```http
POST /session/:sessionId/results
```
Request body:
```json
{
  "results": {}
}
```

### Admin Routes
All admin routes require admin role.

#### Get All Users
```http
GET /admin/users
```

#### Create Admin
```http
POST /admin/users
```
Request body:
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string"
}
```

#### Update User Role
```http
PUT /admin/users/:userId/role
```
Request body:
```json
{
  "role": "string"
}
```

#### Delete User
```http
DELETE /admin/users/:userId
```

## Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
API requests are limited to 100 requests per minute per IP address.

## File Upload
File uploads are handled through multipart/form-data requests. Maximum file size is 10MB.

## WebSocket Events
The API supports real-time updates through WebSocket connections:

### Connection
```javascript
ws://localhost:5000/ws
```

### Events
- `device_status`: Device status updates
- `analysis_progress`: Analysis progress updates
- `session_update`: Session status updates

## Environment Variables
Required environment variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neurolab
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
NODE_ENV=development
``` 