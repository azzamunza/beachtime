# Tide Data Integration for Fishing.html

## Overview

The fishing.html page now integrates tide data from the BOM (Bureau of Meteorology) CSV file to display accurate tide information for fishing conditions.

## Files Involved

### 1. `data/tides_bom_sample.csv`
Sample CSV file containing actual BOM tide data extracted from PNG images.

**Format**:
```csv
location,latitude,longitude,date,day_name,time,height
FREMANTLE HARBOUR,-32.05,115.733,2026-01-01,Thursday,05:09:00,0.36
```

**Fields**:
- `location`: Location name (e.g., "FREMANTLE HARBOUR")
- `latitude`: Latitude in decimal degrees
- `longitude`: Longitude in decimal degrees  
- `date`: Date in YYYY-MM-DD format
- `day_name`: Day of week (Thursday, Friday, etc.)
- `time`: Time in HH:MM:SS format
- `height`: Tide height in meters relative to LAT (Chart Datum)

### 2. `tide-csv-loader.js`
JavaScript module that loads and processes the CSV tide data.

**Functions**:
- `loadTideCSVData()`: Loads CSV data from file
- `parseCSV(csvText)`: Parses CSV text into objects
- `getTidesForLocationAndDate(location, date)`: Gets all tides for a specific location and date
- `getTideHeightAtTime(location, dateTime)`: Gets tide height at specific time using linear interpolation
- `tideHeightToPercentage(heightMeters)`: Converts tide height (0-1.5m) to percentage (0-100%)

### 3. `fishing.html`
Updated to include the tide-csv-loader.js script:
```html
<script src="tide-csv-loader.js"></script>
```

### 4. `fishing-script.js`
Modified `calculateTideHeightForTime()` function to:
1. Try CSV tide data first (if available)
2. Fall back to harmonic predictions
3. Fall back to sinusoidal approximation

## How It Works

### Data Loading
1. When the page loads, `tide-csv-loader.js` automatically fetches `data/tides_bom_sample.csv`
2. The CSV data is parsed and organized by location for quick lookup
3. Console logs confirm data loading: "Loaded X tide entries from CSV"

### Tide Calculation
When the time slider moves or animation updates:
1. `calculateTideHeightForTime(timeOfDay)` is called
2. The function checks if CSV data is available
3. If yes, it calls `getTideHeightAtTime()` with the current location and time
4. Tide height is interpolated between known tide times
5. Height is converted from meters to percentage (0-100%)
6. The percentage drives the animation water level

### Linear Interpolation
Between two known tide times (e.g., 05:09 low tide and 19:39 high tide):
- Calculate time between the two tides
- Calculate height difference
- Interpolate linearly based on current time position
- Example: At 12:00 (midday between 05:09 and 19:39), tide would be approximately halfway between 0.36m and 1.25m

## Current Data Coverage

### Sample Data Included
The `tides_bom_sample.csv` contains actual BOM data for:
- **Fremantle Harbour**: Jan 1-5, 2026 (10 tide entries)
- **Hillarys Boat Harbour**: Jan 6-8, 2026 (6 tide entries)

### Full Data Extraction
For complete coverage, extract all data from PNG files using:
- Manual extraction: See `MANUAL_TIDE_EXTRACTION.md`
- Automated extraction: See `TIDE_PNG_STRUCTURE.md` and `scripts/extract_tide_data_improved.py`

## Data Validation

The sample CSV data matches official BOM sources:
- ✅ Fremantle Jan 1: Low 05:09 (0.36m), High 19:39 (1.25m)
- ✅ Validated against 9 online sources (see `ONLINE_TIDE_COMPARISON.md`)
- ✅ Datum: LAT (Chart Datum) - matches BOM standard

## Usage Example

To add more tide data:

1. Extract data from PNG files following the structure in `TIDE_PNG_STRUCTURE.md`
2. Add entries to `tides_bom_sample.csv` in the same format
3. Reload the page - new data will be automatically loaded

```csv
LOCATION,-32.05,115.733,2026-01-06,Thursday,06:15:00,0.42
LOCATION,-32.05,115.733,2026-01-06,Thursday,20:30:00,1.18
```

## Fallback Behavior

If CSV data is not available or doesn't cover the current date:
1. System falls back to harmonic predictions from `tide-harmonic.js`
2. If harmonics fail, uses simple sinusoidal approximation
3. Ensures animation always has tide data to display

## Testing

To test the integration:
1. Open `fishing.html` in a browser
2. Check browser console for: "Loaded X tide entries from CSV"
3. Move the time slider
4. Observe the water level changes in the animation
5. Water level should reflect actual BOM tide times

## Future Enhancements

- [ ] Add complete year of tide data from all PNG files
- [ ] Display exact tide times and heights on the page
- [ ] Show "next high tide" and "next low tide" indicators
- [ ] Add tide tables view similar to online sources
- [ ] Indicate tide state (rising/falling/slack) with arrows
- [ ] Color-code tides (red = low, blue = high)

---

*This integration provides accurate BOM tide data for the fishing.html visualization, improving the fishing conditions prediction accuracy.*
