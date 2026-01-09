# Data Directory

## tides.csv

⚠️ **WARNING: This file contains phase inversion errors and should NOT be used for real-world applications.**

Comprehensive tide prediction data for Western Australian coastal locations throughout 2026. This CSV file contains hourly tide height predictions generated using harmonic constituents.

**Validation Status**: After comparison with 9 independent online sources, this data has critical timing/phase errors. See [ONLINE_TIDE_COMPARISON.md](../ONLINE_TIDE_COMPARISON.md) for details.

**For Accurate Tides**: Use official Bureau of Meteorology sources or the PNG images in the `../tides` directory.

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
