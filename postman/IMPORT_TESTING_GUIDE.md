# Property Import Testing Guide

## Setup

1. Import `Real-Estate-API.postman_collection.json` into Postman
2. Import `Real-Estate-Environment.postman_environment.json` 
3. Select "Real Estate Environment"

## Testing Steps

### 1. Authentication
```
POST /v1/auth/login
Body: {
  "email": "admin@example.com",
  "password": "Password123!"
}
```

### 2. Import Properties
```
POST /v1/imports
Content-Type: multipart/form-data
Authorization: Bearer {{access_token}}

Form Data:
- file: properties_sample.csv
- idempotencyKey: {{$guid}}
```

## Expected Response
```json
{
  "message": "Import job accepted",
  "idempotencyKey": "generated-uuid"
}
```

## Files Provided

- `properties_sample.csv` - Sample data with 10 properties
- `CSV_FORMAT.md` - Complete CSV format documentation
- Updated Postman collection with import endpoint

## Testing Notes

- Requires ADMIN role
- Uses SQS for async processing
- Idempotency key prevents duplicate imports
- Batch processing handles large files
- Upsert logic updates existing properties by address+tenantId