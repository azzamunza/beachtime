# Data Directory

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
