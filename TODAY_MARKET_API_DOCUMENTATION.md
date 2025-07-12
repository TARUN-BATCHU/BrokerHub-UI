# Today's Market API Documentation

## Overview
This document provides detailed API documentation for the Today's Market feature, including curl examples and expected request/response formats.

## Authentication
All API calls require Basic Authentication:
```bash
# Replace username:password with your credentials
curl -H "Authorization: Basic $(echo -n 'username:password' | base64)" https://api.example.com/endpoint
```

## API Endpoints

### 1. Get Market Products
Retrieves all available products in today's market.

**Endpoint**: `GET /api/market/products`

**Curl Example**:
```bash
curl -X GET \
  'https://api.example.com/api/market/products' \
  -H 'Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=' \
  -H 'Content-Type: application/json'
```

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "productId": "123",
      "productName": "Premium Rice",
      "quality": "Grade A",
      "quantity": 1000,
      "price": 50.00,
      "description": "High-quality premium rice from local farmers",
      "availableUntil": "2024-01-15T18:00:00Z",
      "seller": {
        "firmName": "ABC Traders",
        "location": "Mumbai"
      }
    }
  ]
}
```

### 2. Add Market Product
Adds a new product to today's market.

**Endpoint**: `POST /api/market/products`

**Curl Example**:
```bash
curl -X POST \
  'https://api.example.com/api/market/products' \
  -H 'Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=' \
  -H 'Content-Type: application/json' \
  -d '{
    "productName": "Premium Rice",
    "quality": "Grade A",
    "quantity": 1000,
    "price": 50.00,
    "description": "High-quality premium rice from local farmers",
    "availableUntil": "2024-01-15T18:00:00Z"
  }'
```

**Request Body**:
```json
{
  "productName": "Premium Rice",
  "quality": "Grade A",
  "quantity": 1000,
  "price": 50.00,
  "description": "High-quality premium rice from local farmers",
  "availableUntil": "2024-01-15T18:00:00Z"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Product added successfully",
  "data": {
    "productId": "123",
    "productName": "Premium Rice",
    "quality": "Grade A",
    "quantity": 1000,
    "price": 50.00,
    "description": "High-quality premium rice from local farmers",
    "availableUntil": "2024-01-15T18:00:00Z"
  }
}
```

### 3. Get Seller Requests
Retrieves all seller requests for today's market.

**Endpoint**: `GET /api/market/seller-requests`

**Curl Example**:
```bash
curl -X GET \
  'https://api.example.com/api/market/seller-requests' \
  -H 'Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=' \
  -H 'Content-Type: application/json'
```

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "requestId": "456",
      "productName": "Organic Wheat",
      "quality": "Premium",
      "quantity": 500,
      "price": 45.00,
      "description": "Organic wheat from certified farmers",
      "availableUntil": "2024-01-15T18:00:00Z",
      "seller": {
        "firmName": "XYZ Organics",
        "location": "Pune"
      },
      "status": "PENDING"
    }
  ]
}
```

### 4. Submit Seller Request
Submits a new seller request to the market.

**Endpoint**: `POST /api/market/seller-requests`

**Curl Example**:
```bash
curl -X POST \
  'https://api.example.com/api/market/seller-requests' \
  -H 'Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=' \
  -H 'Content-Type: application/json' \
  -d '{
    "productName": "Organic Wheat",
    "quality": "Premium",
    "quantity": 500,
    "price": 45.00,
    "description": "Organic wheat from certified farmers",
    "availableUntil": "2024-01-15T18:00:00Z"
  }'
```

**Request Body**:
```json
{
  "productName": "Organic Wheat",
  "quality": "Premium",
  "quantity": 500,
  "price": 45.00,
  "description": "Organic wheat from certified farmers",
  "availableUntil": "2024-01-15T18:00:00Z"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Seller request submitted successfully",
  "data": {
    "requestId": "456",
    "status": "PENDING"
  }
}
```

### 5. Accept Seller Request
Accepts a pending seller request.

**Endpoint**: `PUT /api/market/seller-requests/{requestId}/accept`

**Curl Example**:
```bash
curl -X PUT \
  'https://api.example.com/api/market/seller-requests/456/accept' \
  -H 'Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=' \
  -H 'Content-Type: application/json'
```

**Response**:
```json
{
  "status": "success",
  "message": "Seller request accepted successfully",
  "data": {
    "requestId": "456",
    "status": "ACCEPTED"
  }
}
```

## Error Responses

### Authentication Error
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Invalid credentials"
}
```

### Validation Error
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "productName": "Product name is required",
    "price": "Price must be greater than 0"
  }
}
```

### Not Found Error
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Product not found"
}
```

## Sample Dummy Data
Here's some sample data you can use for testing:

```json
{
  "products": [
    {
      "productId": "1",
      "productName": "Premium Rice",
      "quality": "Grade A",
      "quantity": 1000,
      "price": 50.00,
      "description": "High-quality premium rice from local farmers",
      "availableUntil": "2024-01-15T18:00:00Z",
      "seller": {
        "firmName": "ABC Traders",
        "location": "Mumbai"
      }
    },
    {
      "productId": "2",
      "productName": "Organic Wheat",
      "quality": "Premium",
      "quantity": 500,
      "price": 45.00,
      "description": "Organic wheat from certified farmers",
      "availableUntil": "2024-01-15T18:00:00Z",
      "seller": {
        "firmName": "XYZ Organics",
        "location": "Pune"
      }
    },
    {
      "productId": "3",
      "productName": "Yellow Corn",
      "quality": "Grade B",
      "quantity": 750,
      "price": 35.00,
      "description": "Fresh yellow corn for animal feed",
      "availableUntil": "2024-01-15T18:00:00Z",
      "seller": {
        "firmName": "PQR Agro",
        "location": "Delhi"
      }
    }
  ]
}
```

## UI Implementation Notes

1. **Loading States**:
   - Show loading spinners while data is being fetched
   - Disable buttons during API calls
   - Show skeleton screens for better UX

2. **Error Handling**:
   - Display user-friendly error messages
   - Implement retry mechanisms for failed requests
   - Show validation errors inline with form fields

3. **Responsive Design**:
   - Mobile-first approach
   - Grid layout for product cards
   - Collapsible filters and search

4. **Accessibility**:
   - ARIA labels for interactive elements
   - Keyboard navigation support
   - High contrast mode support

5. **Performance**:
   - Implement client-side caching
   - Lazy loading for images
   - Pagination for large datasets