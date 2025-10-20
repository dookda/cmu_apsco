-- Create survey_parcels table for storing user survey data
-- This table stores polygon geometries and drought index information

CREATE TABLE IF NOT EXISTS survey_parcels (
    id SERIAL PRIMARY KEY,
    parcel_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Geometry column for polygon
    geom GEOMETRY(Polygon, 4326) NOT NULL,

    -- Survey metadata
    survey_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    surveyor_name VARCHAR(255),

    -- Drought index data
    selected_index VARCHAR(10) NOT NULL CHECK (selected_index IN ('NDVI', 'NDMI', 'SPI')),
    index_date_start DATE NOT NULL,
    index_date_end DATE NOT NULL,

    -- Index statistics
    index_mean NUMERIC(10, 4),
    index_min NUMERIC(10, 4),
    index_max NUMERIC(10, 4),
    index_std_dev NUMERIC(10, 4),
    interpretation TEXT,

    -- Additional parcel information
    area_hectares NUMERIC(12, 4),
    province VARCHAR(100),
    land_use VARCHAR(100),
    crop_type VARCHAR(100),
    notes TEXT,

    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on geometry column
CREATE INDEX IF NOT EXISTS idx_survey_parcels_geom ON survey_parcels USING GIST (geom);

-- Create index on survey date for faster queries
CREATE INDEX IF NOT EXISTS idx_survey_parcels_survey_date ON survey_parcels (survey_date);

-- Create index on selected index type
CREATE INDEX IF NOT EXISTS idx_survey_parcels_index_type ON survey_parcels (selected_index);

-- Add comment to table
COMMENT ON TABLE survey_parcels IS 'Survey data for drought monitoring including polygon geometries and index calculations';

-- Add comments to columns
COMMENT ON COLUMN survey_parcels.geom IS 'Polygon geometry in WGS84 (EPSG:4326)';
COMMENT ON COLUMN survey_parcels.selected_index IS 'Type of drought index: NDVI, NDMI, or SPI';
COMMENT ON COLUMN survey_parcels.area_hectares IS 'Calculated area of polygon in hectares';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_survey_parcels_updated_at
    BEFORE UPDATE ON survey_parcels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate area in hectares
CREATE OR REPLACE FUNCTION calculate_area_hectares()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate area in square meters and convert to hectares
    -- Using geography cast for accurate area calculation
    NEW.area_hectares = ST_Area(NEW.geom::geography) / 10000.0;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-calculate area
CREATE TRIGGER calculate_survey_parcel_area
    BEFORE INSERT OR UPDATE ON survey_parcels
    FOR EACH ROW
    EXECUTE FUNCTION calculate_area_hectares();

-- Insert sample data for testing
INSERT INTO survey_parcels
    (parcel_name, description, geom, surveyor_name, selected_index,
     index_date_start, index_date_end, index_mean, index_min, index_max,
     index_std_dev, interpretation, province, land_use, crop_type, notes)
VALUES
    ('Sample Parcel 1',
     'Test agricultural land in Chiang Mai',
     ST_GeomFromText('POLYGON((98.9 18.7, 99.0 18.7, 99.0 18.8, 98.9 18.8, 98.9 18.7))', 4326),
     'Admin User',
     'NDVI',
     '2024-09-20',
     '2024-10-20',
     0.6523,
     0.2341,
     0.8976,
     0.1234,
     'High vegetation density',
     'Chiang Mai',
     'Agriculture',
     'Rice',
     'Sample test data for development');
