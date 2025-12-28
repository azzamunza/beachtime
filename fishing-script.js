// Fishing Time Script
// This script handles fishing-specific functionality

// Initialize variables for fishing page
var fishingWeatherData = [];
var fishingCurrentDay = 0;
var fishingMap = null;
var fishingMarkers = [];

// Fishing locations data (sample data - would normally come from database)
var fishingLocations = [
    { name: "Swanbourne Beach", lat: -31.9688, lng: 115.7673, species: ["Whiting", "Herring", "Tailor", "Salmon"] },
    { name: "Cottesloe Beach", lat: -31.9965, lng: 115.7567, species: ["Whiting", "Flathead", "Herring"] },
    { name: "City Beach", lat: -31.9374, lng: 115.7583, species: ["Tailor", "Herring", "Skipjack"] },
    { name: "Scarborough Beach", lat: -31.8933, lng: 115.7597, species: ["Salmon", "Tailor", "Skipjack", "Mackerel"] }
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

// Initialize the fishing map
function initFishingMap() {
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }
    
    var mapElement = document.getElementById('fishingMap');
    if (!mapElement) return;
    
    // Create map centered on default location
    fishingMap = L.map('fishingMap').setView([-31.9688, 115.7673], 11);
    
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
}

// Select a fishing location
function selectFishingLocation(location) {
    // Update coordinates
    document.getElementById('latitude-fishing').value = location.lat;
    document.getElementById('longitude-fishing').value = location.lng;
    
    // Update fish species table
    updateFishSpeciesTable(location.species);
    
    // Fetch weather data for this location
    fetchFishingWeatherData();
    
    // Center map on location
    if (fishingMap) {
        fishingMap.setView([location.lat, location.lng], 13);
    }
}

// Update fish species table
function updateFishSpeciesTable(species) {
    var tableContainer = document.getElementById('fishSpeciesTable');
    if (!tableContainer) return;
    
    if (!species || species.length === 0) {
        tableContainer.innerHTML = '<p>No fish species data available for this location.</p>';
        return;
    }
    
    var tableHTML = '<table>';
    tableHTML += '<thead><tr><th>Fish Species</th><th>Availability</th></tr></thead>';
    tableHTML += '<tbody>';
    
    species.forEach(function(fish) {
        tableHTML += '<tr>';
        tableHTML += '<td><strong>' + fish + '</strong></td>';
        tableHTML += '<td>Year-round</td>';
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
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
        
        // Note: Full implementation would include chart rendering here
        // For now, display a message that data is loaded
        console.log('Fishing weather data loaded successfully');
    })
    .catch(function(error) {
        console.error('Unexpected error:', error);
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
    
    console.log('Processed fishing weather data:', fishingWeatherData);
}

// Initialize fishing page when DOM is ready
if (document.getElementById('fishingMap')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize map
        if (typeof L !== 'undefined') {
            setTimeout(initFishingMap, 100);
        }
        
        // Initialize location search
        var locationSearchBtn = document.getElementById('locationSearchBtnFishing');
        if (locationSearchBtn) {
            locationSearchBtn.addEventListener('click', function() {
                document.getElementById('locationModalFishing').classList.add('active');
            });
        }
        
        var closeModalBtn = document.getElementById('closeModalFishing');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                document.getElementById('locationModalFishing').classList.remove('active');
            });
        }
        
        // Fetch initial weather data
        fetchFishingWeatherData();
        
        // Show default fish species
        updateFishSpeciesTable(fishingLocations[0].species);
        
        // Set up range slider listeners (similar to beach time)
        // This would be a full implementation in production
        console.log('Fishing Time page initialized');
    });
}
