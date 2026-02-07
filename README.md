# Autoflex Stock System

Web system to manage products, raw materials inventory and generate a production suggestion plan based on available stock.

This project was developed as a technical challenge and follows a separated architecture (API + Frontend), fully implemented in English as required.

---

## Tech Stack

### Backend
- ASP.NET Core Web API (.NET)
- Entity Framework Core
- PostgreSQL
- RESTful architecture

### Frontend
- React (Vite)
- Axios
- Responsive UI

### Infrastructure
- Docker & Docker Compose (optional)

The problem statement suggests Spring/Quarkus or similar frameworks.  
ASP.NET Core was chosen as an equivalent, modern and widely adopted framework for building REST APIs.

---

## Domain Model

### Product
- id
- code
- name
- price

### Raw Material
- id
- code
- name
- stockQuantity

### ProductRawMaterial (BOM)
- productId
- rawMaterialId
- quantityRequired

A many-to-many relationship between Products and Raw Materials, with quantityRequired defining how much of each raw material is needed to produce one unit of a product.

---

## Features

### Backend (API)
- Products CRUD
- Raw Materials CRUD
- Product BOM management (associate raw materials with required quantities)
- Production suggestion endpoint:
  - Calculates which products can be produced
  - Prioritizes products with higher unit price
  - Considers available stock and BOM
  - Returns total producible quantities and total production value

### Frontend
- Products management (CRUD)
- Raw Materials management (CRUD)
- BOM management inside product screen
- Production suggestion view:
  - Displays producible products
  - Quantity per product
  - Unit price
  - Total value
  - Grand total value

---

## Production Suggestion Rule (Higher Price Wins)

The production plan follows a greedy strategy based on product value:

1. Products are sorted by price in descending order
2. For each product, compute the maximum producible quantity:

    maxPossible = min(stock[rawMaterial] / quantityRequired)

3. If maxPossible > 0, add the product to the suggestion list
4. Consume a virtual stock:

    stock[rawMaterial] -= maxPossible * quantityRequired

5. Continue to the next product, ensuring higher value products consume shared raw materials first

---

## API Endpoints

### Products
- GET /api/products
- GET /api/products/{id}
- POST /api/products
- PUT /api/products/{id}
- DELETE /api/products/{id}

### Product Materials (BOM)
- POST /api/products/{id}/materials
- PUT /api/products/{id}/materials/{rawMaterialId}
- DELETE /api/products/{id}/materials/{rawMaterialId}

### Raw Materials
- GET /api/rawmaterials
- GET /api/rawmaterials/{id}
- POST /api/rawmaterials
- PUT /api/rawmaterials/{id}
- DELETE /api/rawmaterials/{id}

### Production
- GET /api/production

Returns the suggested production plan based on current stock, including quantities and total value.

---

## How to Run (Local)

### Backend

    cd Autoflex.Api
    dotnet restore
    dotnet ef database update
    dotnet run

API will be available at:

    http://localhost:5215/api

### Frontend

    cd frontend
    npm install
    npm run dev

Frontend will be available at:

    http://localhost:5173

---

## Environment Variables

### Frontend

Create a .env file inside the frontend folder:

    VITE_API_BASE_URL=http://localhost:5215/api

An example file is provided:

    frontend/.env.example

---

## Docker (Optional)

The project includes a docker-compose.yml file to run the entire stack.

    docker compose up -d --build

### Services
- PostgreSQL
- Backend API
- Frontend (development mode)

After starting containers, apply database migrations:

    cd Autoflex.Api
    dotnet ef database update

---

## Non-Functional Requirements Compliance

- Web-based system compatible with modern browsers
- Backend and frontend separated via REST API
- Responsive frontend interface
- Relational database persistence (PostgreSQL)
- All source code, database entities and UI written in English

---

## Screenshots

Add screenshots of Products, Raw Materials and Production screens here.

---

## Notes

This project focuses on clean architecture, business rule correctness and code readability, prioritizing maintainability and clarity.
