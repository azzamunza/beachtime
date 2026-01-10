# Remaining Work for Fishing Features Enhancement

## Overview
This document outlines the remaining tasks from the problem statement that require additional implementation work.

## 1. Fishing Chart Data Rings

### Issue
The fishing charts need to display additional data rings for:
- Pressure (hPa)
- Wave Height (m)
- Tide Height (%)

### Current State
- Data is being collected and passed to chart functions
- `calculateDayScores()` adds pressure, waveHeight, and tideHeight to scoreData
- The radial chart (`drawRadialSpline`) only renders: temperature, water, wind, cloud cover, and rain

### Implementation Required

#### A. Update `drawRadialSpline` function (script.js, line 1009)

1. **Add pressure, wave height, and tide to activeDatasets check:**
```javascript
var activeDatasets = window.activeDatasets || {
    pressure: true,      // NEW
    temperature: true,
    windSpeed: true,
    cloudCover: true,
    rain: true,
    waveHeight: true,    // NEW
    tide: true           // NEW
};
```

2. **Update layer counting logic** (around line 1054):
```javascript
var dataLayers = 0;
if (activeDatasets.pressure) dataLayers++;           // NEW
if (activeDatasets.temperature) dataLayers++;
if (activeDatasets.windSpeed || activeDatasets.wind) dataLayers++;
if (activeDatasets.waveHeight) dataLayers++;         // NEW
if (activeDatasets.tide) dataLayers++;               // NEW
```

3. **Create point arrays for new metrics** (around line 1086):
```javascript
var pressurePoints = [];
var pressureInnerPoints = [];
var waveHeightPoints = [];
var waveHeightInnerPoints = [];
var tidePoints = [];
var tideInnerPoints = [];
```

4. **Calculate ideal ranges for fishing metrics** (add to idealRanges object):
```javascript
pressure: {
    min: 980,
    idealMin: 1010,
    idealMax: 1020,
    max: 1040
},
waveHeight: {
    min: 0,
    idealMin: 0,
    idealMax: 1.5,
    max: 5
},
tide: {
    min: 0,
    idealMin: 30,
    idealMax: 70,
    max: 100
}
```

5. **Add score calculation in calculateDayScores** (around line 792):
```javascript
// Calculate fishing-specific scores
if (dayData.pressure && dayData.pressure[i] !== undefined) {
    scoreData.pressure = dayData.pressure[i];
    scoreData.pressureScore = calculateRating(
        dayData.pressure[i],
        [idealRanges.pressure.idealMin, idealRanges.pressure.idealMax],
        idealRanges.pressure.min,
        idealRanges.pressure.max
    );
}
if (dayData.waveHeight && dayData.waveHeight[i] !== undefined) {
    scoreData.waveHeight = dayData.waveHeight[i];
    scoreData.waveHeightScore = calculateRating(
        dayData.waveHeight[i],
        [idealRanges.waveHeight.idealMin, idealRanges.waveHeight.idealMax],
        idealRanges.waveHeight.min,
        idealRanges.waveHeight.max
    );
}
if (dayData.tideHeight && dayData.tideHeight[i] !== undefined) {
    scoreData.tideHeight = dayData.tideHeight[i];
    scoreData.tideScore = calculateRating(
        dayData.tideHeight[i],
        [idealRanges.tide.idealMin, idealRanges.tide.idealMax],
        idealRanges.tide.min,
        idealRanges.tide.max
    );
}
```

6. **Add rendering for new rings** (after wind ring rendering, around line 1255):
```javascript
// Draw pressure ring - #667eea (blue-purple)
if (activeDatasets.pressure && smoothPressure && smoothPressureInner) {
    ctx.fillStyle = 'rgba(102, 126, 234, 0.5)';
    ctx.beginPath();
    // ... similar pattern to other rings
}

// Draw wave height ring - #1F5FA8 (dark blue)
if (activeDatasets.waveHeight && smoothWaveHeight && smoothWaveHeightInner) {
    ctx.fillStyle = 'rgba(31, 95, 168, 0.5)';
    ctx.beginPath();
    // ... similar pattern to other rings
}

// Draw tide ring - #32dbae (teal)
if (activeDatasets.tide && smoothTide && smoothTideInner) {
    ctx.fillStyle = 'rgba(50, 219, 174, 0.5)';
    ctx.beginPath();
    // ... similar pattern to other rings
}
```

#### B. Update fishing rating calculation

The fishing page should use fishing-specific weights in `ratingWeights`:
```javascript
// In fishing-script.js or conditionally in script.js for fishing page
if (isFishingPage) {
    ratingWeights = {
        pressure: 1.2,
        temperature: 1.0,
        windSpeed: 0.8,
        cloudCover: 0.4,
        rain: 1.5,
        waveHeight: 1.0,
        tide: 0.9
    };
}
```

## 2. Weekly Overview Chart Fix

### Issue
Weekly overview chart may not display correctly on fishing page.

### Diagnosis
1. Check if `weatherData` array has data when switching to weekly view
2. Verify `drawWeeklyOverviewChart()` is being called
3. Check if canvas element `weeklyOverviewCanvasFishing` exists in DOM
4. Verify fishing page data includes all necessary fields

### Implementation Required

Add debugging and ensure fishing data structure matches beach data:
```javascript
function drawWeeklyOverviewChart() {
    console.log('Drawing weekly overview chart');
    console.log('Weather data length:', weatherData.length);
    
    var canvas = document.getElementById('weeklyOverviewCanvas');
    if (!canvas) {
        canvas = document.getElementById('weeklyOverviewCanvasFishing');
    }
    
    if (!canvas) {
        console.error('Weekly overview canvas not found');
        return;
    }
    
    // ... rest of function
}
```

Check that fishing data processing includes all normalized fields needed for rating calculation.

## 3. Swan River Fishing Locations

### Implementation Required

Add Swan River locations to `fishingLocations` array in fishing-script.js:

```javascript
// Swan River locations
{ 
    name: "Swan River - Perth CBD", 
    lat: -31.9614, 
    lng: 115.8601,
    timezone: 'Australia/Perth',
    species: [
        { name: "Black Bream", season: "Year-round", size: "25cm+" },
        { name: "Yellow-eye Mullet", season: "Year-round", size: "30cm" },
        { name: "Estuary Cobbler", season: "Year-round", size: "45cm+" }
    ]
},
{ 
    name: "Swan River - Blackwall Reach", 
    lat: -32.0098, 
    lng: 115.8171,
    timezone: 'Australia/Perth',
    species: [
        { name: "Black Bream", season: "Year-round", size: "25cm+" },
        { name: "Flathead", season: "Year-round", size: "30-50cm" },
        { name: "Mulloway", season: "Autumn-Winter", size: "45cm+" }
    ]
},
{ 
    name: "Swan River - Pelican Point", 
    lat: -32.0025, 
    lng: 115.7847,
    timezone: 'Australia/Perth',
    species: [
        { name: "Black Bream", season: "Year-round", size: "25cm+" },
        { name: "Tailor", season: "Spring-Autumn", size: "30-50cm" }
    ]
}
// Add more Swan River locations as needed
```

## 4. Swan River Algal Bloom Overlay

### Data Source
Need to identify API or data source for Swan River algal bloom information.

Potential sources:
- Department of Water and Environmental Regulation WA
- Swan River Trust
- Water Corporation WA

### Implementation Required

1. **Create algal bloom data fetcher:**
```javascript
async function fetchAlgalBloomData(lat, lng) {
    // Fetch from appropriate API
    // Return toxicity level: 'none', 'low', 'medium', 'high'
}
```

2. **Add algal bloom overlay to animation** (in fishing-animation.js):
```javascript
// In Landscape component, add section for algal bloom
// SECTION 12: ALGAL BLOOM OVERLAY
algalBloomLevel === 'high' && React.createElement('rect', {
    x: 0,
    y: waterY,
    width: 1200,
    height: 400 - waterY,
    fill: 'rgba(139, 195, 74, 0.4)', // Green overlay
    className: 'algal-bloom-overlay'
}),

// Add visual indicator
algalBloomLevel !== 'none' && React.createElement('text', {
    x: 20,
    y: 70,
    fill: getBloomColor(algalBloomLevel),
    fontFamily: 'monospace',
    fontSize: '13',
    fontWeight: 'bold',
    style: { textShadow: '1px 1px 2px black' }
}, `⚠️ ALGAL BLOOM: ${algalBloomLevel.toUpperCase()}`)
```

3. **Color mapping:**
```javascript
function getBloomColor(level) {
    switch(level) {
        case 'none': return '#4caf50';
        case 'low': return '#ffeb3b';
        case 'medium': return '#ff9800';
        case 'high': return '#f44336';
        default: return '#9e9e9e';
    }
}
```

## 5. Bureau of Meteorology (BOM) Integration

### A. Add Data Source Toggle

In fishing.html header, add toggle checkbox:
```html
<div class="weather-source-toggle">
    <label class="weather-source-label">
        <input type="checkbox" id="useBOMData">
        <span>Use Bureau of Meteorology Data</span>
    </label>
</div>
```

### B. BOM Data Scraper

Create new file `bom-scraper.js`:
```javascript
async function fetchBOMForecast(locationCode = 'bwa_pt060-swanbourne') {
    const url = `https://www.bom.gov.au/location/australia/western-australia/lower-west/${locationCode}/accessible-forecast/`;
    
    // This would need to be done server-side or via a proxy
    // due to CORS restrictions
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Parse HTML to extract forecast data
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract forecast data from HTML structure
        const forecasts = [];
        // ... parsing logic here
        
        return {
            location: locationCode,
            forecasts: forecasts,
            timezone: 'Australia/Perth'
        };
    } catch (error) {
        console.error('Error fetching BOM data:', error);
        return null;
    }
}

function mapBOMDataToWeatherData(bomData) {
    // Convert BOM forecast format to application's weatherData format
    return bomData.forecasts.map(day => ({
        date: day.date,
        hours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        temp: day.temperatures,
        wind: day.windSpeeds,
        precipitation: day.rainfall,
        cloudCover: day.cloudCover,
        pressure: day.pressure || Array(13).fill(1013),
        waveHeight: day.waves || Array(13).fill(0)
    }));
}
```

### C. Location Mapping

Create mapping between coordinates and BOM location codes:
```javascript
async function fetchBOMLocations() {
    const url = 'https://www.bom.gov.au/location/australia/western-australia/lower-west#places';
    // Parse locations list
    // Create mapping
}

function findNearestBOMLocation(lat, lng, bomLocations) {
    // Find closest BOM location to given coordinates
    let minDist = Infinity;
    let nearest = null;
    
    for (const loc of bomLocations) {
        const dist = calculateDistance(lat, lng, loc.lat, loc.lng);
        if (dist < minDist) {
            minDist = dist;
            nearest = loc;
        }
    }
    
    return nearest;
}
```

### D. Integration

Update weather data fetching to check toggle:
```javascript
async function fetchWeatherData() {
    const useBOM = document.getElementById('useBOMData')?.checked;
    
    if (useBOM) {
        const lat = parseFloat(document.getElementById('latitude-fishing').value);
        const lng = parseFloat(document.getElementById('longitude-fishing').value);
        const bomLocation = findNearestBOMLocation(lat, lng, bomLocations);
        
        const bomData = await fetchBOMForecast(bomLocation.code);
        weatherData = mapBOMDataToWeatherData(bomData);
    } else {
        // Use existing Open-Meteo API
        fetchFishingWeatherData();
    }
    
    updateChart();
}
```

## 6. Marine Species Legal Restrictions

### Implementation Required

Add restrictions to species data in marine-species.js:
```javascript
{
    id: 'pink-snapper',
    name: 'Pink Snapper',
    scientificName: 'Chrysophrys auratus',
    minSize: 41, // cm
    bagLimit: 4,
    season: 'Year-round',
    restrictions: 'Min 41cm, max 4 per person',
    closedSeasons: [], // Array of {start: 'MM-DD', end: 'MM-DD'}
}
```

Filter displayed species based on current date and regulations:
```javascript
function getAvailableFish(species, currentDate) {
    return species.filter(fish => {
        // Check if in closed season
        if (fish.closedSeasons && fish.closedSeasons.length > 0) {
            for (const closure of fish.closedSeasons) {
                if (isDateInRange(currentDate, closure.start, closure.end)) {
                    return false; // Don't show during closed season
                }
            }
        }
        return true;
    }).map(fish => ({
        ...fish,
        note: fish.restrictions || `Min ${fish.minSize}cm, Bag limit ${fish.bagLimit}`
    }));
}
```

## Priority Recommendations

1. **High Priority:**
   - Fix fishing chart data rings (pressure, wave, tide)
   - Weekly overview chart fix
   - Hide duplicate controls (DONE)

2. **Medium Priority:**
   - Swan River fishing locations
   - Marine species restrictions
   - Fishing animation improvements (DONE)

3. **Low Priority:**
   - BOM integration (requires server-side proxy due to CORS)
   - Algal bloom overlay (requires data source identification)

## Testing Recommendations

1. Test on actual fishing page with real data
2. Verify all charts render correctly with new data rings
3. Test dataset toggle checkboxes work correctly
4. Verify marine species database displays properly
5. Test animation performance on various devices

## Notes

- BOM integration may require server-side component due to CORS restrictions
- Algal bloom data source needs to be identified before implementation
- Marine species restrictions should be regularly updated from official sources
- Consider caching BOM data to reduce API calls
