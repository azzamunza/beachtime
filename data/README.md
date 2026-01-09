# Data Directory

## tides.csv

⚠️ **IMPORTANT UPDATE: The current CSV was generated using harmonic predictions, NOT extracted from the PNG files.**

The PNG files in the `../tides` directory contain the actual Bureau of Meteorology tide predictions with the correct times and heights. The structure of these PNG files is documented in [TIDE_PNG_STRUCTURE.md](../TIDE_PNG_STRUCTURE.md).

**Current Status**:
- ✅ CSV structure and format are correct
- ❌ Data values are from harmonic predictions (phase errors)
- ❌ NOT extracted from BOM PNG images

**To Get Accurate Data**:
1. Extract data manually from PNG images using [MANUAL_TIDE_EXTRACTION.md](../MANUAL_TIDE_EXTRACTION.md)
2. Use OCR with the structure guide in [TIDE_PNG_STRUCTURE.md](../TIDE_PNG_STRUCTURE.md)
3. Use official BOM sources or validated online tide services

**For Accurate Tides**: Use the PNG images in `../tides/` directory or official BOM sources listed in [ONLINE_TIDE_COMPARISON.md](../ONLINE_TIDE_COMPARISON.md).

### Format

Each row contains:
- `location`: Location name (e.g., "FREMANTLE HARBOUR", "HILLARYS BOAT HARBOUR")
- `latitude`: Latitude in decimal degrees (negative for South)
- `longitude`: Longitude in decimal degrees (positive for East)
- `date`: Date in YYYY-MM-DD format
- `time`: Time in HH:MM:SS format (24-hour)
- `height`: Tide height in meters relative to datum

### Locations Included

- Fremantle Harbour
- Hillarys Boat Harbour
- Perth (Swan River)
- Bunbury
- Geraldton
- Esperance
- Albany
- Broome
- Port Hedland
- Exmouth

### Usage

Load and use tide data in JavaScript:

```javascript
// Fetch tide data
fetch('data/tides.csv')
  .then(response => response.text())
  .then(csvText => {
    // Parse CSV and use tide data
    const tides = parseCSV(csvText);
    // Filter for specific location
    const fremantleTides = tides.filter(t => t.location === 'FREMANTLE HARBOUR');
  });
```

## tide-stations.json

Tidal harmonic constituents for Australian coastal locations.

### Format

Each station contains:
- `id`: Unique identifier for the station
- `name`: Human-readable location name
- `latitude`: Latitude in decimal degrees (negative for South)
- `longitude`: Longitude in decimal degrees (positive for East)
- `datum`: Datum offset in meters (typically 0)
- `constituents`: Object containing tidal harmonic constituents

### Tidal Constituents

Each constituent has:
- `amplitude`: Tidal amplitude in **meters**
- `phase`: Phase offset in **degrees** (0-360)

Common constituents:
- **M2**: Principal lunar semidiurnal (12.42 hours)
- **S2**: Principal solar semidiurnal (12 hours)
- **K1**: Lunar diurnal (23.93 hours)
- **O1**: Lunar diurnal (25.82 hours)
- **N2**: Larger lunar elliptic semidiurnal (12.66 hours)
- **P1**: Solar diurnal (24.07 hours)

### Reference System

Harmonic predictions use J2000.0 epoch (2000-01-01 12:00:00 UTC) as the reference point. Tide heights are calculated relative to the datum, which is typically Mean Sea Level (MSL).

### Usage

Load and use tide predictions:

```javascript
// Load tide stations
fetch('data/tide-stations.json')
  .then(response => response.json())
  .then(stations => {
    // Find nearest station
    const station = findNearestStation(latitude, longitude);
    
    // Predict tide height
    const height = predictTideHeight(station, new Date());
    console.log(`Tide height: ${height.toFixed(2)}m`);
  });
```

## beach-rating-settings.json

Rating configuration for beach conditions.

## fishing-rating-settings.json

Rating configuration for fishing conditions.
