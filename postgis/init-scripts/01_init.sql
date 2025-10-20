-- Initialize PostGIS extension and create sample spatial tables
-- This script runs automatically when the database is first created

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create a sample spatial table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST(geom);

-- Insert sample data (Chiang Mai University location)
INSERT INTO locations (name, description, geom) 
VALUES (
    'Chiang Mai University',
    'Main Campus',
    ST_SetSRID(ST_MakePoint(98.9519, 18.8060), 4326)
);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
