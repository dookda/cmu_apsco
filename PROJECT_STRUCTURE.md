# CMU APSCO - Multi-Service Architecture

This project has been reorganized into a clean multi-service architecture with separate directories for each service.

## Project Structure

```
cmu_apsco/
├── docker-compose.yml          # Main orchestration file
├── README.md                  # This file
├── react/                     # React frontend application
│   ├── src/                  # React source code
│   ├── package.json          # React dependencies
│   ├── Dockerfile            # Production React build
│   ├── Dockerfile.dev        # Development React build
│   ├── vite.config.js        # Vite configuration
│   ├── index.html            # React HTML template
│   └── nginx.conf            # Nginx configuration for production
├── fastapi/                   # FastAPI backend application
│   ├── main.py               # FastAPI application entry point
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # FastAPI Docker configuration
│   └── .env.example          # Environment variables template
└── postgis/                   # PostGIS database configuration
    └── init-scripts/          # Database initialization scripts
        └── 01_init.sql        # Initial database setup
```

## Services

### 1. PostGIS Database (`postgis`)
- **Port**: 5432
- **Container**: `cmu_apsco_postgis`
- **Image**: `postgis/postgis:15-3.3-alpine`
- **Purpose**: PostgreSQL database with PostGIS spatial extensions

### 2. FastAPI Backend (`fastapi`)
- **Port**: 8000
- **Container**: `cmu_apsco_fastapi`
- **Purpose**: REST API backend service
- **Features**:
  - CORS enabled for frontend communication
  - Database connectivity to PostGIS
  - Health check endpoint at `/health`
  - API endpoints at `/api/*`

### 3. React Frontend (`react-dev` / `react-prod`)
- **Development Port**: 3000
- **Production Port**: 80
- **Container**: `cmu_apsco_react_dev` / `cmu_apsco_react_prod`
- **Purpose**: Web application frontend
- **API Connection**: Connects to FastAPI backend at port 8000

## Running the Application

### Development Mode
```bash
docker-compose up react-dev fastapi postgis
```

### Production Mode
```bash
docker-compose --profile production up
```

### Individual Services
```bash
# Start only the database
docker-compose up postgis

# Start database and API
docker-compose up postgis fastapi

# Start all services in development
docker-compose up react-dev fastapi postgis
```

## Environment Configuration

Copy the environment files and configure as needed:
```bash
cp fastapi/.env.example fastapi/.env
```

## API Endpoints

- **Health Check**: `GET http://localhost:8000/health`
- **Root**: `GET http://localhost:8000/`
- **Sample Data**: `GET http://localhost:8000/api/data`

## Frontend Access

- **Development**: http://localhost:3000
- **Production**: http://localhost:80

## Database Access

- **Host**: localhost
- **Port**: 5432
- **Database**: cmu_apsco_db
- **Username**: postgres
- **Password**: postgres