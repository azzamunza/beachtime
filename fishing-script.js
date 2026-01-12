// Fishing Time Script
// This script handles fishing-specific functionality
//
// IMPORTANT: All chart generation logic remains BeachTime-native.
// This script only handles fishing-specific features such as:
// - Enhanced fish species database
// - Location-based species information
// - Map interaction for coordinate selection
// - Timezone detection
// - Marine data integration
//
// Chart normalisation and rendering uses existing BeachTime methods.

// Constants for water temperature estimation
var WATER_TEMP_OFFSET = 2.5; // Degrees Celsius below air temperature for estimated water temp

// Initialise variables for fishing page
var fishingWeatherData = [];
var fishingCurrentDay = 0;
var fishingMap = null;
var fishingMarkers = [];
var currentFishingLocation = {
    lat: -31.9688,
    lng: 115.7673,
    name: 'Swanbourne Beach, WA',
    timezone: 'Australia/Perth'
};

// Enhanced fishing locations data with more species information
var fishingLocations = [
    { 
        name: "Swanbourne Beach, WA", 
        lat: -31.9688, 
        lng: 115.7673, 
        timezone: 'Australia/Perth',
        species: [
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Australian Herring", season: "Summer-Autumn", size: "20-30cm" },
            { name: "Tailor", season: "Spring-Autumn", size: "30-50cm" },
            { name: "Australian Salmon", season: "Autumn-Winter", size: "40-70cm" }
        ]
    },
    { 
        name: "Cottesloe Beach, WA", 
        lat: -31.9965, 
        lng: 115.7567,
        timezone: 'Australia/Perth',
        species: [
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Flathead", season: "Year-round", size: "30-50cm" },
            { name: "Australian Herring", season: "Summer-Autumn", size: "20-30cm" }
        ]
    },
    { 
        name: "City Beach, WA", 
        lat: -31.9374, 
        lng: 115.7583,
        timezone: 'Australia/Perth',
        species: [
            { name: "Tailor", season: "Spring-Autumn", size: "30-50cm" },
            { name: "Australian Herring", season: "Summer-Autumn", size: "20-30cm" },
            { name: "Skipjack Trevally", season: "Summer", size: "30-40cm" }
        ]
    },
    { 
        name: "Scarborough Beach, WA", 
        lat: -31.8933, 
        lng: 115.7597,
        timezone: 'Australia/Perth',
        species: [
            { name: "Australian Salmon", season: "Autumn-Winter", size: "40-70cm" },
            { name: "Tailor", season: "Spring-Autumn", size: "30-50cm" },
            { name: "Skipjack Trevally", season: "Summer", size: "30-40cm" },
            { name: "Spanish Mackerel", season: "Summer", size: "80-120cm" }
        ]
    },
    { 
        name: "Trigg Beach, WA", 
        lat: -31.8689, 
        lng: 115.7598,
        timezone: 'Australia/Perth',
        species: [
            { name: "Tailor", season: "Spring-Autumn", size: "30-50cm" },
            { name: "Australian Salmon", season: "Autumn-Winter", size: "40-70cm" },
            { name: "Pink Snapper", season: "Year-round", size: "41cm+" }
        ]
    },
    { 
        name: "Hillarys Boat Harbour, WA", 
        lat: -31.8258, 
        lng: 115.7399,
        timezone: 'Australia/Perth',
        species: [
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Pink Snapper", season: "Year-round", size: "41cm+" },
            { name: "Skipjack Trevally", season: "Summer", size: "30-40cm" },
            { name: "Squid", season: "Year-round", size: "Variable" }
        ]
    },
    { 
        name: "Fremantle Fishing Boat Harbour, WA", 
        lat: -32.0567, 
        lng: 115.7442,
        timezone: 'Australia/Perth',
        species: [
            { name: "Black Bream", season: "Year-round", size: "25cm+" },
            { name: "Tailor", season: "Spring-Autumn", size: "30-50cm" },
            { name: "Australian Herring", season: "Summer-Autumn", size: "20-30cm" },
            { name: "Squid", season: "Year-round", size: "Variable" }
        ]
    },
    { 
        name: "Woodman Point, WA", 
        lat: -32.1216, 
        lng: 115.7566,
        timezone: 'Australia/Perth',
        species: [
            { name: "Pink Snapper", season: "Year-round", size: "41cm+" },
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Tailor", season: "Spring-Autumn", size: "30-50cm" }
        ]
    },
    { 
        name: "Rockingham Beach, WA", 
        lat: -32.2771, 
        lng: 115.7330,
        timezone: 'Australia/Perth',
        species: [
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Pink Snapper", season: "Year-round", size: "41cm+" },
            { name: "Flathead", season: "Year-round", size: "30-50cm" },
            { name: "Squid", season: "Year-round", size: "Variable" }
        ]
    },
    { 
        name: "Mandurah Ocean Marina, WA", 
        lat: -32.5414, 
        lng: 115.7238,
        timezone: 'Australia/Perth',
        species: [
            { name: "Black Bream", season: "Year-round", size: "25cm+" },
            { name: "Flathead", season: "Year-round", size: "30-50cm" },
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Blue Manna Crab", season: "Year-round", size: "127mm+" }
        ]
    },
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
    },
    { 
        name: "Busselton Jetty, WA", 
        lat: -33.6505, 
        lng: 115.3472,
        timezone: 'Australia/Perth',
        species: [
            { name: "Australian Herring", season: "Summer-Autumn", size: "20-30cm" },
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Skipjack Trevally", season: "Summer", size: "30-40cm" },
            { name: "Squid", season: "Year-round", size: "Variable" }
        ]
    },
    { 
        name: "Augusta Boat Harbour, WA", 
        lat: -34.3153, 
        lng: 115.1569,
        timezone: 'Australia/Perth',
        species: [
            { name: "Australian Salmon", season: "Autumn-Winter", size: "40-70cm" },
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Southern Bluefin Tuna", season: "Autumn-Winter", size: "Variable" }
        ]
    },
    { 
        name: "Albany Marina, WA", 
        lat: -35.0239, 
        lng: 117.8926,
        timezone: 'Australia/Perth',
        species: [
            { name: "Australian Salmon", season: "Autumn-Winter", size: "40-70cm" },
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Pink Snapper", season: "Year-round", size: "41cm+" },
            { name: "Southern Rock Lobster", season: "November-June", size: "Variable" }
        ]
    },
    { 
        name: "Esperance Tanker Jetty, WA", 
        lat: -33.8686, 
        lng: 121.8978,
        timezone: 'Australia/Perth',
        species: [
            { name: "Australian Salmon", season: "Autumn-Winter", size: "40-70cm" },
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Pink Snapper", season: "Year-round", size: "41cm+" },
            { name: "Squid", season: "Year-round", size: "Variable" }
        ]
    },
    { 
        name: "Geraldton Port, WA", 
        lat: -28.7717, 
        lng: 114.6086,
        timezone: 'Australia/Perth',
        species: [
            { name: "Pink Snapper", season: "Year-round", size: "41cm+" },
            { name: "Spanish Mackerel", season: "Summer", size: "80-120cm" },
            { name: "King George Whiting", season: "Year-round", size: "25-35cm" },
            { name: "Western Rock Lobster", season: "November-June", size: "Variable" }
        ]
    },
    { 
        name: "Exmouth Marina, WA", 
        lat: -21.9372, 
        lng: 114.1274,
        timezone: 'Australia/Perth',
        species: [
            { name: "Spanish Mackerel", season: "Year-round", size: "80-120cm" },
            { name: "Giant Trevally", season: "Year-round", size: "50cm+" },
            { name: "Red Emperor", season: "Year-round", size: "41cm+" },
            { name: "Coral Trout", season: "Year-round", size: "38cm+" }
        ]
    },
    { 
        name: "Broome Port, WA", 
        lat: -17.9614, 
        lng: 122.2359,
        timezone: 'Australia/Perth',
        species: [
            { name: "Barramundi", season: "Year-round", size: "55cm+" },
            { name: "Spanish Mackerel", season: "Year-round", size: "80-120cm" },
            { name: "Giant Trevally", season: "Year-round", size: "50cm+" },
            { name: "Threadfin Salmon", season: "Year-round", size: "45cm+" }
        ]
    }
];

// Fishing rating weights
var fishingRatingWeights = {
    pressure: 1.2,
    temperature: 1.0,
    windSpeed: 0.8,
    cloudCover: 0.4,
    rain: 1.5,
    waveHeight: 1.0
};

// Fishing ideal ranges
var fishingIdealRanges = {
    pressure: {
        min: 980,
        idealMin: 1010,
        idealMax: 1020,
        max: 1040
    },
    temperature: {
        min: 10,
        idealMin: 15,
        idealMax: 25,
        max: 35
    },
    windSpeed: {
        min: 0,
        idealMin: 0,
        idealMax: 15,
        max: 40
    },
    cloudCover: {
        min: 0,
        max: 100
    },
    rain: {
        min: 0,
        max: 100
    },
    waveHeight: {
        min: 0,
        idealMin: 0,
        idealMax: 1.5,
        max: 5
    }
};

// Initialise the fishing map
function initFishingMap() {
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded. Please ensure Leaflet.js is included in fishing.html before this script.');
        return;
    }
    
    var mapElement = document.getElementById('fishingMap');
    if (!mapElement) return;
    
    // Create map centred on default location
    fishingMap = L.map('fishingMap').setView([currentFishingLocation.lat, currentFishingLocation.lng], 11);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(fishingMap);
    
    // Add fishing location markers
    fishingLocations.forEach(function(location) {
        var marker = L.marker([location.lat, location.lng])
            .addTo(fishingMap)
            .bindPopup('<b>' + location.name + '</b><br>Click to select');
        
        marker.on('click', function() {
            selectFishingLocation(location);
        });
        
        fishingMarkers.push(marker);
    });
    
    // Add click event to map for custom location selection
    fishingMap.on('click', function(e) {
        selectCustomLocation(e.latlng);
    });
}

// Select a fishing location from predefined list
function selectFishingLocation(location) {
    currentFishingLocation = {
        lat: location.lat,
        lng: location.lng,
        name: location.name,
        timezone: location.timezone
    };
    
    // Update coordinates display
    updateLocationDisplay();
    
    // Update hidden inputs
    document.getElementById('latitude-fishing').value = location.lat;
    document.getElementById('longitude-fishing').value = location.lng;
    document.getElementById('timezoneSelectFishing').value = location.timezone;
    
    // Update fish species table
    updateFishSpeciesTable(location.name);
    
    // Fetch weather data for this location
    fetchFishingWeatherData();
    
    // Centre map on location
    if (fishingMap) {
        fishingMap.setView([location.lat, location.lng], 13);
    }
}

// Select a custom location by clicking on map
function selectCustomLocation(latlng) {
    currentFishingLocation = {
        lat: latlng.lat,
        lng: latlng.lng,
        name: 'Custom Location',
        timezone: 'Australia/Perth' // Default timezone
    };
    
    // Fetch timezone from Open-Meteo API
    fetch('https://api.open-meteo.com/v1/forecast?latitude=' + latlng.lat + '&longitude=' + latlng.lng + '&timezone=auto')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.timezone) {
                currentFishingLocation.timezone = data.timezone;
                document.getElementById('timezoneSelectFishing').value = data.timezone;
            }
            
            // Update location display
            updateLocationDisplay();
            
            // Update hidden inputs
            document.getElementById('latitude-fishing').value = latlng.lat.toFixed(4);
            document.getElementById('longitude-fishing').value = latlng.lng.toFixed(4);
            
            // Update fish species table with generic species
            updateFishSpeciesTable('Custom Location');
            
            // Fetch weather data
            fetchFishingWeatherData();
        })
        .catch(function(error) {
            console.error('Error fetching timezone:', error);
            updateLocationDisplay();
            updateFishSpeciesTable('Custom Location');
            fetchFishingWeatherData();
        });
}

// Update location display banner
function updateLocationDisplay() {
    var locationNameEl = document.getElementById('locationNameDisplay');
    var locationCoordsEl = document.getElementById('locationCoords');
    
    if (locationNameEl) {
        locationNameEl.textContent = currentFishingLocation.name;
    }
    
    if (locationCoordsEl) {
        locationCoordsEl.textContent = 'Lat: ' + currentFishingLocation.lat.toFixed(4) + ', Lng: ' + currentFishingLocation.lng.toFixed(4);
    }
    
    // Update all chart titles with the current location name
    var vizTitles = document.querySelectorAll('.viz-title');
    vizTitles.forEach(function(element) {
        element.textContent = currentFishingLocation.name;
    });
}

// Update fish species table with enhanced accordion display
function updateFishSpeciesTable(locationName) {
    var tableContainer = document.getElementById('fishSpeciesTable');
    if (!tableContainer) return;
    
    // Get species from marine database if available
    var species = [];
    if (typeof marineSpeciesDatabase !== 'undefined' && typeof getSpeciesForLocation === 'function') {
        // Try to match location to get appropriate species
        var locationMapping = {
            'Swanbourne Beach, WA': 'Perth Coast',
            'Cottesloe Beach, WA': 'Perth Coast',
            'City Beach, WA': 'Perth Coast',
            'Scarborough Beach, WA': 'Perth Coast'
        };
        var locationType = locationMapping[locationName] || 'Perth Coast';
        species = getSpeciesForLocation(locationType);
    }
    
    if (!species || species.length === 0) {
        // Fallback to showing all species
        if (typeof marineSpeciesDatabase !== 'undefined') {
            species = marineSpeciesDatabase;
        } else {
            tableContainer.innerHTML = '<p>Loading fish species database...</p>';
            return;
        }
    }
    
    // Create accordion-style list
    var html = '';
    species.forEach(function(fish) {
        html += '<div class="fish-item" data-fish-id="' + fish.id + '">';
        html += '  <div class="fish-item-header">';
        html += '    <img src="' + fish.image + '" alt="' + fish.name + '" class="fish-item-image" />';
        html += '    <div class="fish-item-info">';
        html += '      <div class="fish-item-name">' + fish.name;
        html += '        <span class="category-badge">' + fish.category + '</span>';
        html += '      </div>';
        html += '      <div class="fish-item-scientific">' + fish.scientificName + '</div>';
        html += '      <div class="fish-item-basic">' + fish.basicInfo + '</div>';
        html += '    </div>';
        html += '    <div class="fish-item-expand">▼</div>';
        html += '  </div>';
        html += '  <div class="fish-item-details">';
        
        // Best Locations
        if (fish.locations && fish.locations.length > 0) {
            html += '    <div class="fish-detail-section">';
            html += '      <div class="fish-detail-title">📍 Best Locations</div>';
            html += '      <div class="fish-detail-content">' + fish.locations.join(', ') + '</div>';
            html += '    </div>';
        }
        
        // Best Fishing Times
        html += '    <div class="fish-detail-section">';
        html += '      <div class="fish-detail-title">⏰ Best Fishing Times</div>';
        html += '      <div class="fish-detail-grid">';
        html += '        <div class="detail-item">';
        html += '          <div class="detail-label">Time of Day</div>';
        html += '          <div class="detail-value">' + (fish.bestTime || 'Variable') + '</div>';
        html += '        </div>';
        html += '        <div class="detail-item">';
        html += '          <div class="detail-label">Tide</div>';
        html += '          <div class="detail-value">' + (fish.bestTide || 'Variable') + '</div>';
        html += '        </div>';
        html += '        <div class="detail-item">';
        html += '          <div class="detail-label">Season</div>';
        html += '          <div class="detail-value">' + (fish.bestSeason || 'Year-round') + '</div>';
        html += '        </div>';
        if (fish.bestTimes && fish.bestTimes.weather) {
            html += '        <div class="detail-item">';
            html += '          <div class="detail-label">Weather</div>';
            html += '          <div class="detail-value">' + fish.bestTimes.weather + '</div>';
            html += '        </div>';
        }
        html += '      </div>';
        html += '    </div>';
        
        // Rig Setup
        if (fish.rig) {
            html += '    <div class="fish-detail-section">';
            html += '      <div class="fish-detail-title">🎣 Rig Setup</div>';
            html += '      <div class="fish-detail-grid">';
            html += '        <div class="detail-item">';
            html += '          <div class="detail-label">Rod & Line</div>';
            html += '          <div class="detail-value">' + fish.rig.description + '</div>';
            html += '        </div>';
            if (fish.rig.hookSize) {
                html += '        <div class="detail-item">';
                html += '          <div class="detail-label">Hook Size</div>';
                html += '          <div class="detail-value">' + fish.rig.hookSize + '</div>';
                html += '        </div>';
            }
            if (fish.rig.sinkerWeight) {
                html += '        <div class="detail-item">';
                html += '          <div class="detail-label">Sinker</div>';
                html += '          <div class="detail-value">' + fish.rig.sinkerWeight + '</div>';
                html += '        </div>';
            }
            if (fish.rig.leader) {
                html += '        <div class="detail-item">';
                html += '          <div class="detail-label">Leader</div>';
                html += '          <div class="detail-value">' + fish.rig.leader + '</div>';
                html += '        </div>';
            }
            html += '      </div>';
            html += '    </div>';
        }
        
        // Bait & Lures
        if (fish.bait) {
            html += '    <div class="fish-detail-section">';
            html += '      <div class="fish-detail-title">🦐 Bait & Lures</div>';
            if (fish.bait.primary && fish.bait.primary.length > 0) {
                html += '      <div class="detail-item" style="margin-bottom: 8px;">';
                html += '        <div class="detail-label">Bait</div>';
                html += '        <div class="detail-value">' + fish.bait.primary.join(', ') + '</div>';
                html += '      </div>';
            }
            if (fish.bait.lures && fish.bait.lures.length > 0) {
                html += '      <div class="detail-item">';
                html += '        <div class="detail-label">Lures</div>';
                html += '        <div class="detail-value">' + fish.bait.lures.join(', ') + '</div>';
                html += '      </div>';
            }
            html += '    </div>';
        }
        
        // Tactics & Tips
        if (fish.tactics) {
            html += '    <div class="fish-detail-section">';
            html += '      <div class="fish-detail-title">💡 Tactics & Tips</div>';
            html += '      <div class="fish-detail-content">' + fish.tactics + '</div>';
            html += '    </div>';
        }
        
        html += '  </div>';
        html += '</div>';
    });
    
    tableContainer.innerHTML = html;
    
    // Add click handlers for accordion
    var fishItems = tableContainer.querySelectorAll('.fish-item');
    fishItems.forEach(function(item) {
        item.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });
}

// Fetch fishing weather data from Open-Meteo API
function fetchFishingWeatherData() {
    var latValue = document.getElementById('latitude-fishing').value;
    var lonValue = document.getElementById('longitude-fishing').value;
    var latitude = latValue !== '' && latValue != null ? parseFloat(latValue) : -31.9688;
    var longitude = lonValue !== '' && lonValue != null ? parseFloat(lonValue) : 115.7673;
    
    // Validate latitude and longitude ranges
    if (latitude < -90 || latitude > 90) {
        console.error('Invalid latitude: must be between -90 and 90');
        latitude = -31.9688;
    }
    if (longitude < -180 || longitude > 180) {
        console.error('Invalid longitude: must be between -180 and 180');
        longitude = 115.7673;
    }
    
    var timezone = document.getElementById('timezoneSelectFishing').value || 'Australia/Perth';
    
    // Fetch weather data (temperature, wind, cloud cover, precipitation)
    var weatherApiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + 
                        '&longitude=' + longitude + 
                        '&hourly=temperature_2m,wind_speed_10m,precipitation,cloud_cover,surface_pressure&timezone=' + 
                        encodeURIComponent(timezone);
    
    // Fetch marine data (wave height)
    var marineApiUrl = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + latitude + 
                       '&longitude=' + longitude + 
                       '&hourly=wave_height&timezone=' + 
                       encodeURIComponent(timezone);
    
    Promise.allSettled([
        fetch(weatherApiUrl).then(function(response) {
            if (!response.ok) throw new Error('Failed to fetch weather data');
            return response.json();
        }),
        fetch(marineApiUrl).then(function(response) {
            if (!response.ok) throw new Error('Failed to fetch marine data');
            return response.json();
        })
    ])
    .then(function(results) {
        var weatherResult = results[0];
        var marineResult = results[1];
        
        if (weatherResult.status === 'rejected') {
            console.error('Error fetching weather data:', weatherResult.reason);
            return;
        }
        
        var weatherApiData = weatherResult.value;
        var marineData = marineResult.status === 'fulfilled' ? marineResult.value : null;
        
        if (marineResult.status === 'rejected') {
            console.warn('Marine data unavailable:', marineResult.reason);
        }
        
        processFishingWeatherData(weatherApiData, marineData);
    })
    .catch(function(error) {
        console.error('Error loading fishing weather data:', error);
    });
}

// Process fishing weather data
function processFishingWeatherData(data, marineData) {
    if (!data || !data.hourly) {
        console.error('Invalid API response structure');
        return;
    }
    
    var hourly = data.hourly;
    var times = hourly.time;
    var temperatures = hourly.temperature_2m;
    var windSpeeds = hourly.wind_speed_10m;
    var precipitation = hourly.precipitation || [];
    var cloudCover = hourly.cloud_cover || [];
    var pressure = hourly.surface_pressure || [];
    
    // Process marine data
    var waveHeights = null;
    if (marineData && marineData.hourly && marineData.hourly.wave_height) {
        waveHeights = marineData.hourly.wave_height;
    }
    
    // Group data by day (similar to beach time processing)
    var dayMap = {};
    
    for (var i = 0; i < times.length; i++) {
        var dateTime = new Date(times[i]);
        var dateKey = dateTime.toISOString().split('T')[0];
        var hour = dateTime.getHours();
        
        // Only include hours from 7am to 7pm
        if (hour >= 7 && hour <= 19) {
            if (!dayMap[dateKey]) {
                dayMap[dateKey] = {
                    date: dateKey,
                    hours: [],
                    temp: [],
                    wind: [],
                    rain: [],
                    cloudCover: [],
                    pressure: [],
                    waveHeight: []
                };
            }
            
            dayMap[dateKey].hours.push(hour);
            dayMap[dateKey].temp.push(Math.round(temperatures[i]));
            dayMap[dateKey].wind.push(Math.round(windSpeeds[i]));
            dayMap[dateKey].rain.push(precipitation[i] != null ? Math.round(precipitation[i]) : 0);
            dayMap[dateKey].cloudCover.push(cloudCover[i] != null ? Math.round(cloudCover[i]) : 0);
            dayMap[dateKey].pressure.push(pressure[i] != null ? Math.round(pressure[i]) : 1013);
            
            // Add wave height if available
            if (waveHeights && waveHeights[i] != null) {
                dayMap[dateKey].waveHeight.push(Math.round(waveHeights[i] * 10) / 10);
            } else {
                dayMap[dateKey].waveHeight.push(0);
            }
        }
    }
    
    // Convert to array and sort by date
    fishingWeatherData = Object.values(dayMap);
    fishingWeatherData.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    
    // Map fishing data to the format expected by script.js
    // For fishing: rain -> precipitation, estimate water temp from air temp
    // Also include fishing-specific data: pressure, waveHeight, tideLevelMeters and tideHeight (%)
    weatherData = fishingWeatherData.map(function(day) {
        return {
            date: day.date,
            hours: day.hours,
            temp: day.temp,
            wind: day.wind,
            water: day.temp.map(function(t) { return Math.round((t - WATER_TEMP_OFFSET) * 10) / 10; }), // Estimate water temp
            precipitation: day.rain,
            cloudCover: day.cloudCover,
            pressure: day.pressure,
            waveHeight: day.waveHeight,
            // Tide data - will be calculated for each hour
            tideHeight: day.hours.map(function() { return 50; }), // Default 50% tide (for internal calculations)
            tideLevelMeters: day.hours.map(function() { return null; }) // Will be calculated from tide data
        };
    });
    
    // Calculate tide levels in meters for each hour
    calculateTideLevelsForWeatherData();
    
    // Trigger chart rendering
    if (typeof updateChart === 'function') {
        currentDay = 0; // Reset to first day
        updateChart();
        if (typeof updateDateDisplay === 'function') {
            updateDateDisplay();
        }
        if (typeof updateDayButtons === 'function') {
            updateDayButtons();
        }
    }
    
    // If currently in weekly view, redraw the weekly overview chart
    if (typeof viewMode !== 'undefined' && viewMode === 'weekly' && typeof drawWeeklyOverviewChart === 'function') {
        setTimeout(function() {
            drawWeeklyOverviewChart();
        }, 100);
    }
}

// Initialise fishing page when DOM is ready
if (document.getElementById('fishingMap')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Initialise hamburger menu and slide-out panel
        initSlideOutPanel();
        
        // Initialise map
        if (typeof L !== 'undefined') {
            setTimeout(initFishingMap, 100);
        }
        
        // Fetch initial weather data
        fetchFishingWeatherData();
        
        // Show default fish species
        updateFishSpeciesTable(fishingLocations[0].name);
        
        // Update initial location display
        updateLocationDisplay();
    });
}

// Initialise slide-out panel functionality
function initSlideOutPanel() {
    var hamburgerMenu = document.getElementById('hamburgerMenu');
    var slideOutPanel = document.getElementById('slideOutPanel');
    var closePanelBtn = document.getElementById('closePanelBtn');
    var slideOutContent = document.getElementById('slideOutContent');
    
    if (!hamburgerMenu || !slideOutPanel || !closePanelBtn) {
        console.warn('Slide-out panel elements not found');
        return;
    }
    
    // Move dataset controls to slide-out panel (not clone, actually move)
    var datasetControls = document.getElementById('fishingDatasetControls');
    if (datasetControls && slideOutContent) {
        slideOutContent.appendChild(datasetControls);
        
        // Initialize slider event handlers
        initFishingDatasetSliders();
    }
    
    // Toggle slide-out panel
    hamburgerMenu.addEventListener('click', function() {
        var isActive = slideOutPanel.classList.toggle('active');
        hamburgerMenu.classList.toggle('active');
        
        // Prevent body scroll when panel is open
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close panel
    closePanelBtn.addEventListener('click', function() {
        slideOutPanel.classList.remove('active');
        hamburgerMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Close panel when clicking outside
    slideOutPanel.addEventListener('click', function(e) {
        if (e.target === slideOutPanel) {
            slideOutPanel.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Sync slider changes between original and cloned controls
    syncSliderControls();
}

// Initialize fishing dataset sliders
function initFishingDatasetSliders() {
    // Pressure sliders
    setupSlider('fishPressureMinRange', 'fishPressureMinValue', ' hPa');
    setupSlider('fishPressureIdealMinRange', 'fishPressureIdealMinValue', ' hPa');
    setupSlider('fishPressureIdealMaxRange', 'fishPressureIdealMaxValue', ' hPa');
    setupSlider('fishPressureMaxRange', 'fishPressureMaxValue', ' hPa');
    
    // Temperature sliders
    setupSlider('fishTempMinRange', 'fishTempMinValue', '°C');
    setupSlider('fishTempIdealMinRange', 'fishTempIdealMinValue', '°C');
    setupSlider('fishTempIdealMaxRange', 'fishTempIdealMaxValue', '°C');
    setupSlider('fishTempMaxRange', 'fishTempMaxValue', '°C');
    
    // Wind sliders
    setupSlider('fishWindMinRange', 'fishWindMinValue', ' km/h');
    setupSlider('fishWindIdealMinRange', 'fishWindIdealMinValue', ' km/h');
    setupSlider('fishWindIdealMaxRange', 'fishWindIdealMaxValue', ' km/h');
    setupSlider('fishWindMaxRange', 'fishWindMaxValue', ' km/h');
    
    // Cloud sliders
    setupSlider('fishCloudMinRange', 'fishCloudMinValue', '%');
    setupSlider('fishCloudMaxRange', 'fishCloudMaxValue', '%');
    
    // Wave height sliders
    setupSlider('fishWaveMinRange', 'fishWaveMinValue', 'm');
    setupSlider('fishWaveIdealMinRange', 'fishWaveIdealMinValue', 'm');
    setupSlider('fishWaveIdealMaxRange', 'fishWaveIdealMaxValue', 'm');
    setupSlider('fishWaveMaxRange', 'fishWaveMaxValue', 'm');
    
    // Tide sliders
    setupSlider('fishTideMinRange', 'fishTideMinValue', '%');
    setupSlider('fishTideIdealMinRange', 'fishTideIdealMinValue', '%');
    setupSlider('fishTideIdealMaxRange', 'fishTideIdealMaxValue', '%');
    setupSlider('fishTideMaxRange', 'fishTideMaxValue', '%');
}

// Setup individual slider with its display value
function setupSlider(sliderId, displayId, unit) {
    var slider = document.getElementById(sliderId);
    var display = document.getElementById(displayId);
    
    if (slider && display) {
        slider.addEventListener('input', function() {
            display.textContent = this.value + unit;
            // Trigger chart update if needed
            if (typeof updateChart === 'function') {
                updateChart();
            }
        });
    }
}

// Synchronise slider controls between original and cloned versions
function syncSliderControls() {
    // Find all range inputs in both original and cloned controls
    var allRangeInputs = document.querySelectorAll('.range-slider-small, .weight-slider');
    
    allRangeInputs.forEach(function(input) {
        input.addEventListener('input', function() {
            var inputId = this.id;
            
            // Find matching inputs by ID and update them
            var matchingInputs = document.querySelectorAll('#' + inputId);
            matchingInputs.forEach(function(matchingInput) {
                if (matchingInput !== input) {
                    matchingInput.value = input.value;
                    
                    // Trigger change event to update displays
                    var event = new Event('input', { bubbles: true });
                    matchingInput.dispatchEvent(event);
                }
            });
        });
    });
}

// Time Slider Functionality
var currentAnimationTime = 12; // Default to noon
var tideStations = [];
var currentTideStation = null;
var animationInterval = null;
var animationSpeed = 1; // 1x speed
var isLoopingWeek = false;

// Initialize time slider
function initTimeSlider() {
    var timeSlider = document.getElementById('timeSlider');
    var timeSliderValue = document.getElementById('timeSliderValue');
    
    if (!timeSlider || !timeSliderValue) return;
    
    // Load tide stations
    loadTideStations();
    
    timeSlider.addEventListener('input', function() {
        currentAnimationTime = parseFloat(this.value);
        updateTimeDisplay();
        updateAnimationForTime(currentAnimationTime);
    });
    
    // Initialize display
    updateTimeDisplay();
    
    // Initialize animation controls
    initAnimationControls();
}

// Initialize animation control buttons
function initAnimationControls() {
    var playBtn = document.getElementById('playBtn');
    var pauseBtn = document.getElementById('pauseBtn');
    var rewindBtn = document.getElementById('rewindBtn');
    var speedUpBtn = document.getElementById('speedUpBtn');
    var speedDownBtn = document.getElementById('speedDownBtn');
    var loopModeCheckbox = document.getElementById('loopModeCheckbox');
    var loopModeLabel = document.getElementById('loopModeLabel');
    var speedDisplay = document.getElementById('speedDisplay');
    var timeSlider = document.getElementById('timeSlider');
    
    if (!playBtn || !pauseBtn || !rewindBtn) return;
    
    // Play button
    playBtn.addEventListener('click', function() {
        startAnimation();
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
    });
    
    // Pause button
    pauseBtn.addEventListener('click', function() {
        stopAnimation();
        playBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
    });
    
    // Rewind button
    rewindBtn.addEventListener('click', function() {
        stopAnimation();
        currentAnimationTime = 0;
        if (timeSlider) timeSlider.value = 0;
        updateTimeDisplay();
        updateAnimationForTime(currentAnimationTime);
        playBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
    });
    
    // Speed up button
    if (speedUpBtn) {
        speedUpBtn.addEventListener('click', function() {
            if (animationSpeed < 4) {
                animationSpeed *= 2;
                if (speedDisplay) speedDisplay.textContent = animationSpeed + 'x';
                if (animationInterval) {
                    stopAnimation();
                    startAnimation();
                }
            }
        });
    }
    
    // Speed down button
    if (speedDownBtn) {
        speedDownBtn.addEventListener('click', function() {
            if (animationSpeed > 0.25) {
                animationSpeed /= 2;
                if (speedDisplay) speedDisplay.textContent = animationSpeed + 'x';
                if (animationInterval) {
                    stopAnimation();
                    startAnimation();
                }
            }
        });
    }
    
    // Loop mode checkbox
    if (loopModeCheckbox && loopModeLabel) {
        loopModeCheckbox.addEventListener('change', function() {
            isLoopingWeek = this.checked;
            loopModeLabel.textContent = isLoopingWeek ? 'Week Loop' : 'Day Loop';
        });
    }
}

// Start animation
function startAnimation() {
    if (animationInterval) return;
    
    var timeSlider = document.getElementById('timeSlider');
    var baseInterval = 100; // Base interval in ms
    var interval = baseInterval / animationSpeed;
    
    animationInterval = setInterval(function() {
        currentAnimationTime += 0.1 * animationSpeed;
        
        // Handle looping
        if (isLoopingWeek) {
            // Week loop: cycle through days
            if (currentAnimationTime > 24) {
                currentAnimationTime = 0;
                // TODO: Advance to next day in week
            }
        } else {
            // Day loop: reset to start of day
            if (currentAnimationTime > 24) {
                currentAnimationTime = 0;
            }
        }
        
        if (timeSlider) timeSlider.value = currentAnimationTime;
        updateTimeDisplay();
        updateAnimationForTime(currentAnimationTime);
    }, interval);
}

// Stop animation
function stopAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}

// Load tide stations data
function loadTideStations() {
    fetch('data/tide-stations.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            tideStations = data;
            // Find nearest station to current location
            updateTideStation();
        })
        .catch(function(error) {
            console.warn('Could not load tide stations:', error);
        });
}

// Update tide station based on current location
function updateTideStation() {
    if (tideStations.length === 0) return;
    
    var lat = currentFishingLocation.lat;
    var lng = currentFishingLocation.lng;
    
    // Find nearest station
    var minDist = Infinity;
    var nearest = null;
    
    for (var i = 0; i < tideStations.length; i++) {
        var station = tideStations[i];
        var dist = calculateDistance(lat, lng, station.latitude, station.longitude);
        if (dist < minDist) {
            minDist = dist;
            nearest = station;
        }
    }
    
    currentTideStation = nearest;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth radius in km
    var dLat = toRadians(lat2 - lat1);
    var dLon = toRadians(lon2 - lon1);
    
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Update time display
function updateTimeDisplay() {
    var timeSliderValue = document.getElementById('timeSliderValue');
    if (!timeSliderValue) return;
    
    var hours = Math.floor(currentAnimationTime);
    var minutes = Math.round((currentAnimationTime - hours) * 60);
    
    var timeStr = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
    timeSliderValue.textContent = timeStr;
}

// Update animation for specific time
function updateAnimationForTime(time) {
    if (typeof window.updateFishingAnimationTime === 'function') {
        // Calculate tide height for this time
        var tideHeight = calculateTideHeightForTime(time);
        window.updateFishingAnimationTime(time, tideHeight);
    }
}

// Calculate tide height for a specific time of day
function calculateTideHeightForTime(timeOfDay) {
    if (!currentTideStation) return 50; // Default to 50%
    
    // Get current date and set time
    var now = new Date();
    var targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    targetDate.setHours(Math.floor(timeOfDay));
    targetDate.setMinutes((timeOfDay % 1) * 60);
    
    try {
        // Try to use CSV tide data first if available
        if (typeof getTideHeightAtTime === 'function' && typeof tideCSVData !== 'undefined' && tideCSVData.length > 0) {
            var locationName = currentFishingLocation.name || 'FREMANTLE';
            var heightMeters = getTideHeightAtTime(locationName, targetDate);
            
            if (heightMeters !== null) {
                // Convert to percentage using the tideHeightToPercentage function
                var heightPercent = tideHeightToPercentage(heightMeters);
                return heightPercent;
            }
        }
        
        // Use tide harmonic prediction if CSV not available
        if (typeof predictTideHeight === 'function') {
            var heightMeters = predictTideHeight(currentTideStation, targetDate);
            // Convert to percentage (assuming 0-2m range, normalized to 0-100%)
            var heightPercent = Math.max(0, Math.min(100, (heightMeters + 1) * 50));
            return heightPercent;
        }
    } catch (error) {
        console.warn('Tide calculation error:', error);
    }
    
    // Fallback: simple sinusoidal approximation
    // Two tides per day (semi-diurnal)
    var tidePhase = (timeOfDay / 12) * Math.PI;
    var tideHeight = 50 + 40 * Math.sin(tidePhase);
    return tideHeight;
}

// Calculate tide level in meters for a specific time
function calculateTideLevelInMeters(dateObj, hour) {
    try {
        // Try to use CSV tide data first if available
        if (typeof getTideHeightAtTime === 'function' && typeof tideCSVData !== 'undefined' && tideCSVData.length > 0) {
            var locationName = currentFishingLocation.name || 'FREMANTLE';
            var targetDate = new Date(dateObj);
            targetDate.setHours(hour);
            targetDate.setMinutes(0);
            var heightMeters = getTideHeightAtTime(locationName, targetDate);
            
            if (heightMeters !== null) {
                return Math.round(heightMeters * 100) / 100; // Round to 2 decimal places
            }
        }
        
        // Use tide harmonic prediction if CSV not available
        if (typeof predictTideHeight === 'function' && currentTideStation) {
            var targetDate = new Date(dateObj);
            targetDate.setHours(hour);
            targetDate.setMinutes(0);
            var heightMeters = predictTideHeight(currentTideStation, targetDate);
            return Math.round(heightMeters * 100) / 100;
        }
    } catch (error) {
        console.warn('Tide level calculation error:', error);
    }
    
    return null; // No tide data available
}

// Calculate tide levels for all hours in weather data
function calculateTideLevelsForWeatherData() {
    if (!weatherData || weatherData.length === 0) return;
    
    for (var d = 0; d < weatherData.length; d++) {
        var day = weatherData[d];
        var dateObj = new Date(day.date + 'T00:00:00');
        
        for (var h = 0; h < day.hours.length; h++) {
            var hour = day.hours[h];
            var tideLevelMeters = calculateTideLevelInMeters(dateObj, hour);
            day.tideLevelMeters[h] = tideLevelMeters;
            
            // Also update the percentage value if we got a meters value
            if (tideLevelMeters !== null && typeof tideHeightToPercentage === 'function') {
                day.tideHeight[h] = tideHeightToPercentage(tideLevelMeters);
            }
        }
    }
}

// Dataset Checkboxes Functionality
var activeDatasets = {
    pressure: true,
    temperature: true,
    windSpeed: true,
    cloudCover: true,
    rain: true,
    waveHeight: true,
    tide: true
};

// Mapping from checkbox IDs to dataset names
var datasetIdMapping = {
    'showPressure': 'pressure',
    'showTemperature': 'temperature',
    'showWindSpeed': 'windSpeed',
    'showCloudCover': 'cloudCover',
    'showRain': 'rain',
    'showWaveHeight': 'waveHeight',
    'showTide': 'tide'
};

function initDatasetCheckboxes() {
    var checkboxes = document.querySelectorAll('.dataset-checkbox-item input[type="checkbox"]');
    
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            var datasetName = datasetIdMapping[this.id];
            
            if (datasetName) {
                activeDatasets[datasetName] = this.checked;
                
                // Trigger chart update
                if (typeof updateChart === 'function') {
                    updateChart();
                }
            }
        });
    });
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.initTimeSlider = initTimeSlider;
    window.initDatasetCheckboxes = initDatasetCheckboxes;
    window.activeDatasets = activeDatasets;
}

// Data table modal functionality
function initDataTableModal() {
    var showDataTableBtn = document.getElementById('showDataTableBtn');
    var dataTableModal = document.getElementById('dataTableModal');
    var closeDataTableModal = document.getElementById('closeDataTableModal');
    
    if (!showDataTableBtn || !dataTableModal) return;
    
    showDataTableBtn.addEventListener('click', function() {
        generateDataTable();
        dataTableModal.style.display = 'flex';
    });
    
    if (closeDataTableModal) {
        closeDataTableModal.addEventListener('click', function() {
            dataTableModal.style.display = 'none';
        });
    }
    
    dataTableModal.addEventListener('click', function(e) {
        if (e.target === dataTableModal) {
            dataTableModal.style.display = 'none';
        }
    });
}

// Generate the data table from weatherData
function generateDataTable() {
    var tableContent = document.getElementById('dataTableContent');
    if (!tableContent || !weatherData || weatherData.length === 0) {
        if (tableContent) {
            tableContent.innerHTML = '<p>No data available. Please select a location first.</p>';
        }
        return;
    }
    
    var html = '<table style="width: 100%; border-collapse: collapse; background: white;">';
    html += '<thead><tr style="background: #667eea; color: white;">';
    html += '<th style="padding: 12px; border: 1px solid #ddd;">Date</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd;">Hour</th>';
    
    // Add headers based on active datasets
    if (activeDatasets.pressure) html += '<th style="padding: 12px; border: 1px solid #ddd;">Pressure (hPa)</th>';
    if (activeDatasets.temperature) html += '<th style="padding: 12px; border: 1px solid #ddd;">Temperature (°C)</th>';
    if (activeDatasets.windSpeed) html += '<th style="padding: 12px; border: 1px solid #ddd;">Wind Speed (km/h)</th>';
    if (activeDatasets.cloudCover) html += '<th style="padding: 12px; border: 1px solid #ddd;">Cloud Cover (%)</th>';
    if (activeDatasets.rain) html += '<th style="padding: 12px; border: 1px solid #ddd;">Rain (%)</th>';
    if (activeDatasets.waveHeight) html += '<th style="padding: 12px; border: 1px solid #ddd;">Wave Height (m)</th>';
    if (activeDatasets.tide) html += '<th style="padding: 12px; border: 1px solid #ddd;">Tide Level (m)</th>';
    
    html += '</tr></thead><tbody>';
    
    // Add data rows
    for (var d = 0; d < weatherData.length; d++) {
        var day = weatherData[d];
        var dateObj = new Date(day.date + 'T00:00:00');
        var dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        for (var h = 0; h < day.hours.length; h++) {
            var rowStyle = d % 2 === 0 ? 'background: #f8f9fa;' : 'background: white;';
            html += '<tr style="' + rowStyle + '">';
            html += '<td style="padding: 10px; border: 1px solid #ddd;">' + dateFormatted + '</td>';
            html += '<td style="padding: 10px; border: 1px solid #ddd;">' + day.hours[h] + ':00</td>';
            
            if (activeDatasets.pressure && day.pressure) 
                html += '<td style="padding: 10px; border: 1px solid #ddd;">' + (day.pressure[h] || 'N/A') + '</td>';
            if (activeDatasets.temperature) 
                html += '<td style="padding: 10px; border: 1px solid #ddd;">' + (day.temp[h] || 'N/A') + '</td>';
            if (activeDatasets.windSpeed) 
                html += '<td style="padding: 10px; border: 1px solid #ddd;">' + (day.wind[h] || 'N/A') + '</td>';
            if (activeDatasets.cloudCover) 
                html += '<td style="padding: 10px; border: 1px solid #ddd;">' + (day.cloudCover[h] || 'N/A') + '</td>';
            if (activeDatasets.rain) 
                html += '<td style="padding: 10px; border: 1px solid #ddd;">' + (day.precipitation[h] || 'N/A') + '</td>';
            if (activeDatasets.waveHeight && day.waveHeight) 
                html += '<td style="padding: 10px; border: 1px solid #ddd;">' + (day.waveHeight[h] || 'N/A') + '</td>';
            if (activeDatasets.tide && day.tideLevelMeters) 
                html += '<td style="padding: 10px; border: 1px solid #ddd;">' + (day.tideLevelMeters[h] !== null ? day.tideLevelMeters[h] : 'N/A') + '</td>';
            
            html += '</tr>';
        }
    }
    
    html += '</tbody></table>';
    tableContent.innerHTML = html;
}

// Initialize data table modal on page load
if (document.getElementById('fishingMap')) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initDataTableModal, 100);
    });
}
