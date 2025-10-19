# CMU APSCO

React application with PostGIS database integration.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### Development Mode

Run the application in development mode with hot-reloading:

```bash
docker-compose up react-dev postgis
```

The React application will be available at `http://localhost:3000`
The PostGIS database will be available at `localhost:5432`

### Production Mode

Run the application in production mode:

```bash
docker-compose --profile production up react-prod postgis
```

The React application will be available at `http://localhost:80`

### Database Only

If you only want to run the PostGIS database:

```bash
docker-compose up postgis
```

## Services

### React Application
- **Development Port**: 3000
- **Production Port**: 80
- Built with Vite and React 18

### PostGIS Database
- **Port**: 5432
- **Database**: cmu_apsco_db
- **Username**: postgres
- **Password**: postgres
- **Extensions**: PostGIS, PostGIS Topology

## Environment Variables

Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

## Database Initialization

The database is automatically initialized with:
- PostGIS extension
- Sample spatial table (`locations`)
- Sample data (Chiang Mai University location)

## Useful Commands

### Stop all services
```bash
docker-compose down
```

### Remove all data (including database volume)
```bash
docker-compose down -v
```

### Rebuild containers
```bash
docker-compose build --no-cache
```

### View logs
```bash
docker-compose logs -f
```

### Access PostGIS database
```bash
docker exec -it cmu_apsco_postgis psql -U postgres -d cmu_apsco_db
```

## Project Structure

```
.
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Production Dockerfile
├── Dockerfile.dev             # Development Dockerfile
├── nginx.conf                 # Nginx configuration for production
├── init-scripts/              # Database initialization scripts
│   └── 01_init.sql           # PostGIS setup and sample data
├── src/                       # React source code
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── public/                    # Static assets
├── index.html                 # HTML template
├── vite.config.js            # Vite configuration
└── package.json              # Node.js dependencies
```