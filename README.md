# Country Details API

A RESTful API built with **Node.js**, **Express**, and **MySQL** that fetches country data from external APIs, stores it in a database, and provides CRUD operations with filtering and sorting capabilities.

## 🚀 Features

- Fetch country data from [RestCountries API](https://restcountries.com)
- Fetch real-time exchange rates from [Exchange Rate API](https://open.er-api.com)
- Calculate estimated GDP based on population and exchange rates
- Full CRUD operations (Create, Read, Update, Delete)
- Advanced filtering by region and currency
- Sorting by GDP and population
- MySQL database with connection pooling
- RESTful API design

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** (v8 or higher)
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd country-details
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up MySQL database

Login to MySQL:
```bash
mysql -u root -p
```

Create the database:
```sql
CREATE DATABASE country_details_db;
EXIT;
```

### 4. Configure environment variables

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Update the `.env` file with your MySQL credentials:
```env
PORT=3006
NODE_ENV=development

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=country_details_db
DB_PORT=3306
```

### 5. Run database migrations
```bash
npm run migrate
```

You should see:
```
✅ Countries table created successfully
✅ Metadata table created successfully
✅ Initial metadata row inserted
```

### 6. Start the server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3006`

## 📚 API Endpoints

### 1. Health Check
```bash
GET /
```
**Response:**
```json
{
  "message": "Country Details API is running"
}
```

---

### 2. Refresh Countries Data
```bash
POST /countries/refresh
```
Fetches all countries from external APIs and stores them in the database.

**Response:**
```json
{
  "message": "Countries refreshed successfully",
  "total_processed": 250,
  "successful": 250,
  "failed": 0
}
```

---

### 3. Get All Countries
```bash
GET /countries
```

**Query Parameters:**
- `region` - Filter by region (e.g., `Africa`, `Europe`, `Asia`)
- `currency` - Filter by currency code (e.g., `NGN`, `USD`, `GBP`)
- `sort` - Sort results:
  - `gdp_desc` - Sort by GDP (highest first)
  - `gdp_asc` - Sort by GDP (lowest first)
  - `population_desc` - Sort by population (highest first)

**Examples:**
```bash
# Get all countries
curl http://localhost:3006/countries

# Get countries in Africa
curl "http://localhost:3006/countries?region=Africa"

# Get countries using USD
curl "http://localhost:3006/countries?currency=USD"

# Get countries sorted by GDP (descending)
curl "http://localhost:3006/countries?sort=gdp_desc"

# Combine filters
curl "http://localhost:3006/countries?region=Africa&sort=gdp_desc"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-29T18:00:00Z"
  }
]
```

---

### 4. Get Single Country
```bash
GET /countries/:name
```

**Example:**
```bash
curl http://localhost:3006/countries/Nigeria
```

**Response:**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-29T18:00:00Z"
}
```

**404 Response:**
```json
{
  "error": "Country not found"
}
```

---

### 5. Delete Country
```bash
DELETE /countries/:name
```

**Example:**
```bash
curl -X DELETE http://localhost:3006/countries/Nigeria
```

**Response:**
```json
{
  "message": "Country 'Nigeria' deleted successfully"
}
```

---

### 6. Get Status
```bash
GET /status
```
Returns total countries and last refresh timestamp.

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-29T18:00:00Z"
}
```

## 🗄️ Database Schema

### `countries` Table
```sql
CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  capital VARCHAR(255),
  region VARCHAR(100),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate DECIMAL(15, 6),
  estimated_gdp DECIMAL(20, 2),
  flag_url TEXT,
  last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_region (region),
  INDEX idx_currency (currency_code)
);
```

### `refresh_metadata` Table
```sql
CREATE TABLE refresh_metadata (
  id INT PRIMARY KEY DEFAULT 1,
  total_countries INT DEFAULT 0,
  last_refreshed_at TIMESTAMP NULL,
  CHECK (id = 1)
);
```

## 🎓 MySQL vs MongoDB - Key Learnings

Coming from MongoDB, here are the main differences:

### 1. **Schema Definition**
- **MongoDB**: Schemaless - you can insert any document structure
- **MySQL**: Schema required - you must define tables, columns, and data types upfront

### 2. **Queries**
- **MongoDB (Mongoose)**:
  ```javascript
  Country.find({ region: 'Africa' }).sort({ population: -1 })
  ```
- **MySQL**:
  ```javascript
  const query = 'SELECT * FROM countries WHERE region = ? ORDER BY population DESC';
  await pool.query(query, ['Africa']);
  ```

### 3. **UPSERT Operations**
- **MongoDB**:
  ```javascript
  Country.updateOne({ name: 'Nigeria' }, data, { upsert: true })
  ```
- **MySQL**:
  ```sql
  INSERT INTO countries (...) VALUES (...)
  ON DUPLICATE KEY UPDATE ...
  ```

### 4. **Connection Handling**
- **MongoDB**: Single connection handles everything
- **MySQL**: Uses connection pooling for efficiency

### 5. **Data Types**
- **MongoDB**: Flexible (strings, numbers, objects, arrays)
- **MySQL**: Strict types (VARCHAR, INT, BIGINT, DECIMAL, JSON)

### 6. **Indexes**
- **MongoDB**: Created with `.createIndex()`
- **MySQL**: Defined in table schema with `INDEX` keyword

## 📁 Project Structure

```
country-details/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── database/
│   │   └── migrate.js            # Database migrations
│   ├── models/
│   │   └── Country.js            # Database operations (raw SQL)
│   ├── controllers/
│   │   └── countryController.js  # Business logic
│   ├── routes/
│   │   └── countryRoutes.js      # API routes
│   └── services/
│       └── externalApi.js        # External API calls
├── index.js                      # Server entry point
├── package.json
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
├── .gitignore
└── README.md
```

## 🔧 Scripts

```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-reload)
npm run migrate    # Run database migrations
```

## 🐛 Error Handling

The API returns consistent error responses:

- **400 Bad Request** - Invalid input
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error
- **503 Service Unavailable** - External API failure

## 🚀 Deployment

1. Set `NODE_ENV=production` in your `.env`
2. Update database credentials for production
3. Run migrations: `npm run migrate`
4. Start server: `npm start`

## 📝 License

ISC

## 👨‍💻 Author

Built as a learning project for MySQL CRUD operations with Node.js/Express.