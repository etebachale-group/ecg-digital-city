# Extended Interactive Objects API Routes

This document describes the newly implemented REST API routes for interaction nodes, triggers, state management, and queue management.

## Overview

The following endpoints have been added to the Interactive Objects API to support the Sistema de Interacciones Avanzadas:

- **Node Management**: Create, update, and delete interaction nodes
- **Trigger Management**: Create, update, and delete object triggers
- **State Management**: Get and update object states
- **Queue Management**: View and manage interaction queues

All routes include:
- ✅ Request validation
- ✅ Error handling
- ✅ Redis caching where appropriate
- ✅ Authentication via `x-user-id` header
- ✅ Proper logging

## Node Management Routes

### POST /api/objects/:id/nodes
Create a new interaction node for an object.

**Authentication**: Required (admin)

**Request Body**:
```json
{
  "position": { "x": 1, "y": 0, "z": 1 },
  "requiredState": "sitting",
  "maxOccupancy": 1
}
```

**Response** (201):
```json
{
  "id": 1,
  "objectId": 123,
  "position": { "x": 1, "y": 0, "z": 1 },
  "requiredState": "sitting",
  "isOccupied": false,
  "occupiedBy": null,
  "occupiedAt": null,
  "maxOccupancy": 1
}
```

**Validation**:
- `position` and `requiredState` are required
- `requiredState` must be one of: idle, walking, running, sitting, interacting, dancing
- Position coordinates must be valid numbers

**Cache Invalidation**:
- `interactive-object:{id}`
- `office:{officeId}:interactive-objects`

---

### PUT /api/nodes/:id
Update an existing interaction node.

**Authentication**: Required (admin)

**Request Body**:
```json
{
  "maxOccupancy": 2,
  "position": { "x": 2, "y": 0, "z": 2 }
}
```

**Response** (200):
```json
{
  "id": 1,
  "objectId": 123,
  "position": { "x": 2, "y": 0, "z": 2 },
  "requiredState": "sitting",
  "isOccupied": false,
  "maxOccupancy": 2
}
```

**Cache Invalidation**:
- `interactive-object:{objectId}`
- `office:{officeId}:interactive-objects`

---

### DELETE /api/nodes/:id
Delete an interaction node.

**Authentication**: Required (admin)

**Response** (200):
```json
{
  "message": "Nodo eliminado exitosamente"
}
```

**Cache Invalidation**:
- `interactive-object:{objectId}`
- `office:{officeId}:interactive-objects`

---

## Trigger Management Routes

### POST /api/objects/:id/triggers
Add a trigger to an object.

**Authentication**: Required (admin)

**Request Body**:
```json
{
  "triggerType": "grant_xp",
  "triggerData": { "amount": 50 },
  "priority": 1,
  "condition": {
    "minLevel": 5
  }
}
```

**Response** (201):
```json
{
  "id": 1,
  "objectId": 123,
  "triggerType": "grant_xp",
  "triggerData": { "amount": 50 },
  "priority": 1,
  "condition": { "minLevel": 5 },
  "isActive": true
}
```

**Validation**:
- `triggerType` and `triggerData` are required
- `triggerType` must be one of: state_change, grant_xp, unlock_achievement, teleport

**Cache Invalidation**:
- `interactive-object:{id}`
- `office:{officeId}:interactive-objects`

---

### PUT /api/triggers/:id
Update an existing trigger.

**Authentication**: Required (admin)

**Request Body**:
```json
{
  "priority": 5,
  "isActive": false
}
```

**Response** (200):
```json
{
  "id": 1,
  "objectId": 123,
  "triggerType": "grant_xp",
  "triggerData": { "amount": 50 },
  "priority": 5,
  "isActive": false
}
```

**Cache Invalidation**:
- `interactive-object:{objectId}`
- `office:{officeId}:interactive-objects`

---

### DELETE /api/triggers/:id
Delete a trigger.

**Authentication**: Required (admin)

**Response** (200):
```json
{
  "message": "Trigger eliminado exitosamente"
}
```

**Cache Invalidation**:
- `interactive-object:{objectId}`
- `office:{officeId}:interactive-objects`

---

## State Management Routes

### GET /api/objects/:id/state
Get the current state of an object.

**Authentication**: Not required

**Response** (200):
```json
{
  "isOpen": true,
  "color": "red",
  "lastInteraction": "2024-01-15T10:30:00Z"
}
```

**Caching**:
- Cache key: `interactive-object:{id}:state`
- TTL: 60 seconds

---

### PUT /api/objects/:id/state
Update the state of an object.

**Authentication**: Required (admin)

**Request Body**:
```json
{
  "isOpen": false,
  "color": "blue"
}
```

**Response** (200):
```json
{
  "isOpen": false,
  "color": "blue",
  "lastInteraction": "2024-01-15T10:30:00Z"
}
```

**Validation**:
- Request body must be a valid object

**Cache Invalidation**:
- `interactive-object:{id}`
- `interactive-object:{id}:state`
- `office:{officeId}:interactive-objects`

**Note**: State updates are merged with existing state, not replaced.

---

## Queue Management Routes

### GET /api/objects/:id/queue
Get the interaction queue for an object.

**Authentication**: Not required

**Response** (200):
```json
[
  {
    "id": 1,
    "objectId": 123,
    "nodeId": 456,
    "userId": 789,
    "position": 1,
    "joinedAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-01-15T10:31:00Z",
    "user": {
      "id": 789,
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
]
```

**Caching**:
- Cache key: `interactive-object:{id}:queue`
- TTL: 10 seconds (queue changes frequently)

---

### POST /api/objects/:id/queue
Join the interaction queue for an object.

**Authentication**: Required

**Request Body**:
```json
{
  "nodeId": 456
}
```

**Response** (201):
```json
{
  "position": 2,
  "queueId": 1
}
```

**Behavior**:
- If user is already in queue, returns existing position
- Queue entries expire after 60 seconds
- Position is automatically assigned based on current queue length

**Cache Invalidation**:
- `interactive-object:{id}:queue`

---

### DELETE /api/queue/:queueId
Leave the interaction queue.

**Authentication**: Required

**Response** (200):
```json
{
  "message": "Saliste de la cola exitosamente"
}
```

**Behavior**:
- Removes user from queue
- Updates positions of remaining users (FIFO maintained)
- Only the user who joined can leave their own queue entry

**Cache Invalidation**:
- `interactive-object:{objectId}:queue`

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "position y requiredState son requeridos"
}
```

### 401 Unauthorized
```json
{
  "error": "Autenticación requerida"
}
```

### 404 Not Found
```json
{
  "error": "Objeto no encontrado"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error al crear nodo de interacción",
  "details": "Detailed error message"
}
```

---

## Authentication

All routes that require authentication use the `requireAdmin` middleware, which:

1. Checks for `x-user-id` header or `userId` in request body
2. Returns 401 if not present
3. Stores `userId` in `req.userId` for use in route handlers

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/objects/123/nodes \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "position": {"x": 1, "y": 0, "z": 1},
    "requiredState": "sitting"
  }'
```

---

## Caching Strategy

The API uses Redis for caching with the following strategy:

| Cache Key | TTL | Invalidated On |
|-----------|-----|----------------|
| `interactive-object:{id}` | 5 minutes | Object update/delete, node/trigger changes |
| `interactive-object:{id}:state` | 1 minute | State update |
| `interactive-object:{id}:queue` | 10 seconds | Queue join/leave |
| `office:{officeId}:interactive-objects` | 5 minutes | Any object/node/trigger change |

**Cache Invalidation Pattern**:
- When an object is modified, all related caches are invalidated
- State and queue caches have shorter TTLs due to frequent changes
- Office-level cache is invalidated to ensure consistency

---

## Integration with Services

The routes integrate with the following services:

- **InteractiveObjectService**: CRUD operations, node management, trigger management, state management
- **InteractionService**: Queue management, interaction processing

All business logic is handled in the service layer, keeping routes thin and focused on HTTP concerns.

---

## Testing

Integration tests are available in `backend/tests/integration/interactiveObjects.routes.test.js`.

Run tests with:
```bash
npm test -- tests/integration/interactiveObjects.routes.test.js
```

Tests cover:
- ✅ Node CRUD operations
- ✅ Trigger CRUD operations
- ✅ State get/update
- ✅ Queue get/join/leave
- ✅ Error handling
- ✅ Validation

---

## Requirements Validation

This implementation satisfies the following requirements from the spec:

- **Requirement 2.1**: Node management endpoints (POST, PUT, DELETE)
- **Requirement 3.1**: State management endpoints (GET, PUT)
- **Requirement 4.1**: Trigger management endpoints (POST, PUT, DELETE)
- **Requirement 16.1**: Queue management endpoints (GET, POST, DELETE)
- **Requirement 16.4**: Queue leave functionality

All endpoints include proper validation, error handling, and Redis caching as specified in the task requirements.
