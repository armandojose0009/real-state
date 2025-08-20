# CSV Format for Property Import

## Required Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| address | string | Property address | "123 Main St" |
| city | string | City name | "Miami" |
| state | string | State abbreviation | "FL" |
| zipCode | string | ZIP code | "33101" |
| sector | string | Property sector/neighborhood | "Downtown" |
| propertyType | string | Type of property | "Apartment" |
| longitude | number | Longitude coordinate | -80.1918 |
| latitude | number | Latitude coordinate | 25.7617 |
| valuation | number | Property valuation in USD | 350000 |
| bedrooms | number | Number of bedrooms | 2 |
| bathrooms | number | Number of bathrooms | 2 |
| squareFeet | number | Square footage | 1200 |
| yearBuilt | number | Year property was built | 2020 |

## Property Types
- Apartment
- House
- Condo
- Townhouse
- Villa

## Notes
- All columns are required
- Coordinates should be in decimal degrees format
- File must be in CSV format with headers
- Maximum file size: 10MB
- Batch processing: 500 records per batch