# Real Estate Management API

REST API for real estate management system built with NestJS, PostgreSQL with PostGIS, Redis and AWS services.

## 🚀 Features

- **Multi-tenant**: Support for multiple organizations
- **Geolocation**: Property search by proximity using PostGIS
- **JWT Authentication**: Secure system with refresh tokens
- **Redis Cache**: Optimization of frequent queries
- **Bulk Import**: Load properties from CSV files
- **Pagination**: Paginated responses with complete metadata
- **Analytics**: Property reports and metrics
- **Documentation**: Integrated Swagger/OpenAPI

## 🛠️ Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + PostGIS
- **Cache**: Redis
- **Queue**: AWS SQS (LocalStack for development)
- **Storage**: AWS S3 (LocalStack for development)
- **Containers**: Docker + Docker Compose

## 📋 Requirements

- Docker and Docker Compose
- Node.js 18+ (optional for local development)

## 🚀 Docker Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd real-state
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start services

```bash
# complete services (includes LocalStack)
docker-compose up -d
```

### 4. Run migrations

```bash
# If using Docker
docker-compose exec api npm run migration:run

# Or locally
npm install
npm run migration:run
```

### 5. Generate test data (optional)

```bash
npm run seed:run
```

## 🔧 Configuration

### Main environment variables (.env)

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=real_estate

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret
```

## 📚 API Endpoints

### Authentication

- `POST /v1/auth/login` - Login
- `POST /v1/auth/refresh` - Refresh token

### Properties

- `GET /v1/properties` - List properties (paginated)
- `POST /v1/properties` - Create property
- `GET /v1/properties/nearby` - Search by proximity
- `GET /v1/properties/:id` - Get property
- `PATCH /v1/properties/:id` - Update property
- `DELETE /v1/properties/:id` - Delete property

### Import

- `POST /v1/imports` - Import properties from CSV

### Analytics

- `GET /v1/analytics/property-distribution` - Property distribution
- `GET /v1/analytics/monthly-trends` - Monthly trends

## 🧪 Testing with Postman

### Import Postman Collections

You can import the complete Postman collections from the `postman/` folder:

1. **Open Postman**
2. **Click Import** button
3. **Select files** from `postman/` folder:
   - `Real-Estate-API.postman_collection.json` - Complete API collection
   - `Real-Estate-Environment.postman_environment.json` - Environment variables
4. **Select environment** "Real Estate Environment" in Postman

### Files included in `postman/` folder:

- `Real-Estate-API.postman_collection.json` - Complete collection
- `Real-Estate-Environment.postman_environment.json` - Environment variables
- `properties_sample.csv` - Sample data for import

### Default credentials:

```json
{
  "email": "admin@admin.com",
  "password": "Password123!"
}
```

## 📊 Data Import

### Required CSV format:

```csv
address,city,state,zipCode,sector,propertyType,longitude,latitude,valuation,bedrooms,bathrooms,squareFeet,yearBuilt
123 Main St,Miami,FL,33101,Downtown,Apartment,-80.1918,25.7617,350000,2,2,1200,2020
```

## 🏗️ Architecture

```
src/
├── auth/           # Authentication and authorization
├── properties/     # Property management
├── listings/       # Real estate listings
├── transactions/   # Transactions
├── tenants/        # Multi-tenancy
├── analytics/      # Reports and metrics
├── common/         # Shared utilities
└── migrations/     # Database migrations
```

## 🔍 Advanced Features

### Geographic Search

```http
GET /v1/properties/nearby?lat=25.7617&lng=-80.1918&radius=5000
```

### Filters and Pagination

```http
GET /v1/properties?sector=Downtown&minPrice=200000&maxPrice=500000&limit=10&offset=0
```

### Bulk Import

```http
POST /v1/imports
Content-Type: multipart/form-data
- file: properties.csv
- idempotencyKey: unique-uuid
```

## 📈 Monitoring

- **Health Check**: `GET /health`
- **Swagger UI**: `http://localhost:3000/docs`
- **Logs**: Structured with tenant context

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:

1. Review documentation in `postman/` folder
2. Check application logs
3. Check existing issues
4. Create new issue with problem details
