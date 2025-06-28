# Route API Documentation

This document provides information about the route-related API endpoints for managing city routes and merchant listings.

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints require Basic Authentication:
```
Authorization: Basic <base64(username:password)>
```

## New Address Fields
The address model has been updated to include route information:
```json
{
    "id": 1,
    "streetAddress": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "landmark": "Near Central Park",
    "addressType": "BUSINESS",
    "route": "MUMBAI-PUNE-NASHIK-AURANGABAD" // New field
}
```

## Available Endpoints

### 1. Get Cities Along Route
Retrieves all cities along a route between source and destination cities.

**Endpoint:** `GET /addresses/route`  
**Multi-Tenant:** ✅ (Broker-filtered)

**Query Parameters:**
- `source`: Source city name
- `destination`: Destination city name

**Sample Request:**
```bash
curl -X GET \
  'http://localhost:8080/api/addresses/route?source=Mumbai&destination=Aurangabad' \
  -H 'Authorization: Basic dXNlcjpwYXNz'
```

**Sample Response:**
```json
{
    "route": [
        {
            "city": "Mumbai",
            "merchantCount": 5,
            "isSourceCity": true,
            "isDestinationCity": false
        },
        {
            "city": "Pune",
            "merchantCount": 3,
            "isSourceCity": false,
            "isDestinationCity": false
        },
        {
            "city": "Nashik",
            "merchantCount": 2,
            "isSourceCity": false,
            "isDestinationCity": false
        },
        {
            "city": "Aurangabad",
            "merchantCount": 4,
            "isSourceCity": false,
            "isDestinationCity": true
        }
    ]
}
```

### 2. Get Merchants in City
Retrieves all merchants in a specific city.

**Endpoint:** `GET /addresses/city/{city}/merchants`  
**Multi-Tenant:** ✅ (Broker-filtered)

**Sample Request:**
```bash
curl -X GET \
  'http://localhost:8080/api/addresses/city/Mumbai/merchants' \
  -H 'Authorization: Basic dXNlcjpwYXNz'
```

**Sample Response:**
```json
{
    "city": "Mumbai",
    "merchants": [
        {
            "id": 1,
            "name": "ABC Trading Co",
            "streetAddress": "123 Main Street",
            "landmark": "Near Central Park",
            "pincode": "400001"
        },
        {
            "id": 2,
            "name": "XYZ Enterprises",
            "streetAddress": "456 Market Road",
            "landmark": "Opposite Railway Station",
            "pincode": "400001"
        }
    ]
}
```

### 3. Update Address Route
Updates the route information for an existing address.

**Endpoint:** `PATCH /addresses/{id}/route`  
**Multi-Tenant:** ✅ (Broker-filtered)

**Sample Request:**
```bash
curl -X PATCH \
  'http://localhost:8080/api/addresses/1/route' \
  -H 'Authorization: Basic dXNlcjpwYXNz' \
  -H 'Content-Type: application/json' \
  -d '{
    "route": "MUMBAI-PUNE-NASHIK-AURANGABAD"
}'
```

**Sample Response:**
```json
{
    "id": 1,
    "streetAddress": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "landmark": "Near Central Park",
    "addressType": "BUSINESS",
    "route": "MUMBAI-PUNE-NASHIK-AURANGABAD",
    "updatedAt": "2023-09-20T11:30:00"
}
```

## Error Responses

### 400 Bad Request
```json
{
    "timestamp": "2023-09-20T10:30:00",
    "status": 400,
    "error": "Bad Request",
    "message": "Invalid route format or city names",
    "path": "/api/addresses/1/route"
}
```

### 404 Not Found
```json
{
    "timestamp": "2023-09-20T10:30:00",
    "status": 404,
    "error": "Not Found",
    "message": "No route found between source and destination cities",
    "path": "/api/addresses/route"
}
```

## Notes
- Routes are stored as hyphen-separated city names in uppercase
- The route field is optional when creating/updating addresses
- Cities in routes must exist in the broker's address records
- Merchant counts only include merchants associated with the current broker