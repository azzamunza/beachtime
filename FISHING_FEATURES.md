# Fishing Time Features

## Overview
The Fishing Time page has been optimised with a professional, modern design and enhanced functionality for fishing condition analysis.

## Key Features

### 1. **Interactive Map Selection**
- **Direct Location Selection**: Click anywhere on the map to select a custom fishing location
- **Predefined Locations**: Markers for popular Western Australian fishing spots
- **Automatic Timezone Detection**: Timezone is automatically detected via Open-Meteo API
- **Coordinate Display**: Real-time latitude/longitude display in the location banner

### 2. **Slide-out Control Panel**
- **Hamburger Menu**: Modern hamburger menu button on the left side
- **Slide-out Design**: Dataset controls slide over the map, keeping charts visible
- **Smooth Animations**: Professional transitions and hover effects
- **Responsive**: Adapts to different screen sizes

### 3. **50/50 Split Layout**
- **Map (50%)**: Left half dedicated to interactive map
- **Charts (50%)**: Right half for data visualisation
- **Location Banner**: Prominent display of current location and coordinates
- **Responsive Design**: Stacks vertically on mobile devices

### 4. **Enhanced Marine Species Database**
- **Detailed Species Information**: Fish name, season, and typical size
- **Location-Based Data**: Species information specific to selected location
- **Professional Table Design**: Clean, modern table styling with hover effects
- **Comprehensive Coverage**: Includes common Australian fish species

### 5. **Wave Animation**
- **Visual Enhancement**: Animated wave SVG above fish species table
- **Smooth Motion**: Continuous, subtle animation
- **Professional Aesthetic**: Enhances the fishing/marine theme

### 6. **Consolidated Tide Harmonics**
- **Single JSON File**: All tide harmonic data in `/data/tide-harmonics.json`
- **10 Australian Locations**: Major coastal cities covered
- **8 Tidal Constituents**: M2, S2, N2, K2, K1, O1, P1, Q1
- **Standardised Format**: Consistent data structure for future expansion

## Design Philosophy

### Modern & Professional
- **Clean Typography**: Improved font weights and letter spacing
- **Subtle Shadows**: Refined shadow effects for depth
- **Smooth Transitions**: Professional animations throughout
- **Consistent Spacing**: Harmonious padding and margins

### Australian English
All text, comments, and documentation use Australian spelling:
- Optimise (not optimize)
- Colour (not color)
- Metre (not meter)
- Visualise (not visualize)

### Code Integrity
- **BeachTime-Native Charts**: All chart generation uses existing BeachTime methods
- **No External Chart Code**: Fishing features are additive, not replacements
- **Modular Design**: Clear separation between fishing features and chart logic

## Technical Implementation

### Map Integration
- **Leaflet.js**: Industry-standard mapping library
- **OpenStreetMap Tiles**: Free, open-source map data
- **Click Event Handling**: Custom location selection via map clicks
- **Marker Management**: Dynamic markers for predefined locations

### API Integration
- **Open-Meteo Weather API**: Temperature, wind, pressure, cloud cover
- **Open-Meteo Marine API**: Wave height data
- **Timezone API**: Automatic timezone detection for any location

### Data Structure
```json
{
  "locations": [
    {
      "name": "Location Name",
      "latitude": -31.9688,
      "longitude": 115.7673,
      "timezone": "Australia/Perth",
      "species": [
        {
          "name": "Fish Species",
          "season": "Year-round",
          "size": "25-35cm"
        }
      ]
    }
  ]
}
```

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Responsive**: Works on tablets and smartphones
- **CSS Grid/Flexbox**: Modern layout techniques
- **ES5 Compatible**: JavaScript for broad compatibility

## Future Enhancements
- **Tide Prediction Visualisation**: Use tide harmonics for real-time predictions
- **Moon Phase Display**: Show current moon phase for fishing
- **Fishing Forecast**: Multi-day fishing condition forecasts
- **User Locations**: Save favourite fishing spots
- **Species Details**: Expandable species information with images

## Performance
- **Lazy Loading**: External resources loaded asynchronously
- **Efficient CSS**: Minimal repaints and reflows
- **Optimised JavaScript**: Event delegation and efficient DOM manipulation
- **Cached Data**: LocalStorage for user preferences

## Accessibility
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: All controls accessible via keyboard
- **Colour Contrast**: WCAG AA compliant colour choices
- **Semantic HTML**: Proper heading hierarchy and structure
