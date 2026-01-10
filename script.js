var weatherData = [];
var currentDay = 0;
var isLoading = true;
var searchController;
var viewMode = 'daily'; // 'daily' or 'weekly'

// Weight factors for normalized rating calculation
var ratingWeights = {
    temperature: 1.5,
    water: 0.4,
    wind: 0.6,
    cloud: 0.5,
    precipitation: 1.4
};

// Ideal ranges for each data set
var idealRanges = {
    temperature: {
        min: 22,
        idealMin: 25,
        idealMax: 36,
        max: 40
    },
    water: {
        min: 19,
        idealMin: 20,
        idealMax: 25,
        max: 35
    },
    wind: {
        min: 0,
        idealMin: 0,
        idealMax: 19,
        max: 30
    },
    cloud: {
        min: 0,  // best (0% cloud cover)
        max: 100 // worst (100% cloud cover)
    },
    precipitation: {
        min: 0,  // best (0% precipitation)
        max: 100 // worst (100% precipitation)
    },
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
};

// Location and timezone management
var currentLocationName = 'Swanbourne Beach'; // Default location name

function updateLocationTitles() {
    // Update all location name elements
    var locationNameElements = document.querySelectorAll('.location-name');
    var vizTitles = document.querySelectorAll('.viz-title');
    
    locationNameElements.forEach(function(element) {
        element.textContent = currentLocationName;
    });
    
    vizTitles.forEach(function(element) {
        element.textContent = currentLocationName;
    });
}

function getRecentLocations() {
    var stored = localStorage.getItem('recentLocations');
    return stored ? JSON.parse(stored) : [];
}

function saveRecentLocation(location) {
    var recent = getRecentLocations();
    // Remove duplicate if exists (with tolerance for floating-point comparison)
    recent = recent.filter(function(loc) {
        var latDiff = Math.abs(loc.latitude - location.latitude);
        var lonDiff = Math.abs(loc.longitude - location.longitude);
        return !(latDiff < 0.0001 && lonDiff < 0.0001);
    });
    // Add to front
    recent.unshift(location);
    // Keep only last 10
    recent = recent.slice(0, 10);
    localStorage.setItem('recentLocations', JSON.stringify(recent));
    displayRecentLocations();
}

function displayRecentLocations() {
    var recentList = document.getElementById('recentLocations');
    var recent = getRecentLocations();
    
    if (recent.length === 0) {
        recentList.innerHTML = '<li class="no-results">No recent locations</li>';
        return;
    }
    
    recentList.innerHTML = '';
    recent.forEach(function(location) {
        var li = document.createElement('li');
        li.textContent = location.name;
        li.addEventListener('click', function() {
            selectLocation(location);
        });
        recentList.appendChild(li);
    });
}

function selectLocation(location) {
    document.getElementById('latitude').value = location.latitude;
    document.getElementById('longitude').value = location.longitude;
    
    // Update location name
    if (location.name) {
        currentLocationName = location.name;
    } else {
        // Fallback to coordinates if no name
        currentLocationName = location.latitude.toFixed(4) + ', ' + location.longitude.toFixed(4);
    }
    updateLocationTitles();
    
    // Update timezone if available
    if (location.timezone) {
        var timezoneSelect = document.getElementById('timezoneSelect');
        // Check if timezone exists in the dropdown
        var optionExists = false;
        for (var i = 0; i < timezoneSelect.options.length; i++) {
            if (timezoneSelect.options[i].value === location.timezone) {
                timezoneSelect.value = location.timezone;
                optionExists = true;
                break;
            }
        }
        if (!optionExists) {
            console.log('Timezone ' + location.timezone + ' not in dropdown, keeping current selection');
        }
    }
    
    document.getElementById('locationModal').classList.remove('active');
    saveRecentLocation(location);
    // Refresh weather data
    fetchWeatherData();
}

// Modal controls - only if elements exist (for index.html)
var locationSearchBtn = document.getElementById('locationSearchBtn');
if (locationSearchBtn) {
    locationSearchBtn.addEventListener('click', function() {
        document.getElementById('locationModal').classList.add('active');
        displayRecentLocations();
    });
}

var closeModal = document.getElementById('closeModal');
if (closeModal) {
    closeModal.addEventListener('click', function() {
        document.getElementById('locationModal').classList.remove('active');
    });
}

var locationModal = document.getElementById('locationModal');
if (locationModal) {
    locationModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
}

// Location search functionality
var locationSearchInput = document.getElementById('locationSearchInput');
if (locationSearchInput) {
    locationSearchInput.addEventListener('input', function() {
        var query = this.value.trim();
        var searchResults = document.getElementById('searchResults');
        
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        
        if (query.length < 3) return;
    
    // Cancel previous request if still running
    if (searchController) searchController.abort();
    searchController = new AbortController();
    
    var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(query) + '&count=5';
    
    fetch(url, { signal: searchController.signal })
        .then(function(response) {
            if (!response.ok) throw new Error('Failed to fetch location data');
            return response.json();
        })
        .then(function(data) {
            if (!data.results || data.results.length === 0) {
                searchResults.innerHTML = '<li class="no-results">No locations found</li>';
                searchResults.style.display = 'block';
                return;
            }
            
            searchResults.style.display = 'block';
            data.results.forEach(function(place) {
                var li = document.createElement('li');
                var locationName = place.name + ', ' + (place.admin1 || '') + ' ' + place.country;
                li.textContent = locationName;
                
                li.addEventListener('click', function() {
                    selectLocation({
                        name: locationName,
                        latitude: place.latitude,
                        longitude: place.longitude,
                        timezone: place.timezone
                    });
                    document.getElementById('locationSearchInput').value = '';
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';
                });
                
                searchResults.appendChild(li);
            });
        })
        .catch(function(err) {
            if (err.name !== 'AbortError') {
                console.error('Location search error:', err);
            }
        });
});
}

// Timezone change handler
var timezoneSelect = document.getElementById('timezoneSelect');
if (timezoneSelect) {
    timezoneSelect.addEventListener('change', function() {
        fetchWeatherData();
    });
}

// Latitude/Longitude change handlers with debouncing
var coordinateChangeTimeout;
function handleCoordinateChange() {
    clearTimeout(coordinateChangeTimeout);
    coordinateChangeTimeout = setTimeout(function() {
        var lat = parseFloat(document.getElementById('latitude').value);
        var lon = parseFloat(document.getElementById('longitude').value);
        // Only fetch if both coordinates are valid numbers
        if (!isNaN(lat) && !isNaN(lon)) {
            // Update location name to coordinates when manually entered
            currentLocationName = lat.toFixed(4) + ', ' + lon.toFixed(4);
            updateLocationTitles();
            fetchWeatherData();
        }
    }, 500); // Wait 500ms after user stops typing
}

var latitudeInput = document.getElementById('latitude');
var longitudeInput = document.getElementById('longitude');
if (latitudeInput) {
    latitudeInput.addEventListener('input', handleCoordinateChange);
}
if (longitudeInput) {
    longitudeInput.addEventListener('input', handleCoordinateChange);
}

// Generate mock weather data for testing
function generateMockData() {
    var mockData = [];
    var today = new Date();
    
    // Generate data for next 7 days
    for (var day = 0; day < 7; day++) {
        var date = new Date(today);
        date.setDate(today.getDate() + day);
        var dateKey = date.toISOString().split('T')[0];
        
        var dayData = {
            date: dateKey,
            hours: [],
            temp: [],
            wind: [],
            water: [],
            precipitation: [],
            cloudCover: []
        };
        
        // Generate hourly data from 7am to 7pm
        for (var hour = 7; hour <= 19; hour++) {
            dayData.hours.push(hour);
            
            // Temperature varies throughout the day (cooler in morning, warmer at noon)
            var tempBase = 28 + day * 0.5; // Slight variation across days
            var tempVariation = 6 * Math.sin((hour - 7) * Math.PI / 12); // Peaks at noon
            dayData.temp.push(Math.round(tempBase + tempVariation));
            
            // Wind speed varies (typically lower in morning)
            var windBase = 10 + day * 0.3;
            var windVariation = 8 * Math.sin((hour - 7) * Math.PI / 10);
            dayData.wind.push(Math.max(0, Math.round(windBase + windVariation)));
            
            // Water temperature is more stable
            var waterBase = 24 + day * 0.2;
            dayData.water.push(Math.round(waterBase * 10) / 10);
            
            // Precipitation probability (random for mock data)
            var precipBase = 20 + day * 5;
            var precipVariation = 30 * Math.sin((hour - 7) * Math.PI / 8);
            dayData.precipitation.push(Math.max(0, Math.min(100, Math.round(precipBase + precipVariation))));
            
            // Cloud cover (random for mock data)
            var cloudBase = 30 + day * 10;
            var cloudVariation = 40 * Math.sin((hour - 7) * Math.PI / 9);
            dayData.cloudCover.push(Math.max(0, Math.min(100, Math.round(cloudBase + cloudVariation))));
        }
        
        mockData.push(dayData);
    }
    
    return mockData;
}

// Fetch weather data from Open-Meteo API
function fetchWeatherData() {
    var latElement = document.getElementById('latitude');
    var lonElement = document.getElementById('longitude');
    
    // Check if elements exist (only run on beach page)
    if (!latElement || !lonElement) {
        return;
    }
    
    var latValue = latElement.value;
    var lonValue = lonElement.value;
    var latitude = latValue !== '' && latValue != null ? parseFloat(latValue) : -31.9688;
    var longitude = lonValue !== '' && lonValue != null ? parseFloat(lonValue) : 115.7673;
    
    // Validate latitude and longitude ranges
    if (latitude < -90 || latitude > 90) {
        console.error('Invalid latitude: must be between -90 and 90');
        latitude = -31.9688; // fallback to default
    }
    if (longitude < -180 || longitude > 180) {
        console.error('Invalid longitude: must be between -180 and 180');
        longitude = 115.7673; // fallback to default
    }
    
    var timezone = document.getElementById('timezoneSelect').value || 'Australia/Perth';
    
    var weatherApiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&hourly=temperature_2m,wind_speed_10m,precipitation_probability,cloud_cover&timezone=' + encodeURIComponent(timezone);
    var marineApiUrl = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + latitude + '&longitude=' + longitude + '&hourly=sea_surface_temperature&timezone=' + encodeURIComponent(timezone);
    
    // Fetch both weather and marine data (marine is optional)
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
                console.log('Using mock data for testing');
                weatherData = generateMockData();
                isLoading = false;
                updateChart();
                updateDateDisplay();
                updateDayButtons();
                return;
            }
            
            var weatherApiData = weatherResult.value;
            var marineData = marineResult.status === 'fulfilled' ? marineResult.value : null;
            
            if (marineResult.status === 'rejected') {
                console.warn('Marine data unavailable, using estimated values:', marineResult.reason);
            }
            
            processWeatherData(weatherApiData, marineData);
            isLoading = false;
            updateChart();
            updateDateDisplay();
            updateDayButtons();
        })
        .catch(function(error) {
            console.error('Unexpected error:', error);
            console.log('Using mock data for testing');
            weatherData = generateMockData();
            isLoading = false;
            updateChart();
            updateDateDisplay();
            updateDayButtons();
        });
}

function processWeatherData(data, marineData) {
    // Validate API response structure
    if (!data || !data.hourly || !data.hourly.time || !data.hourly.temperature_2m || !data.hourly.wind_speed_10m) {
        console.error('Invalid API response structure');
        showDataWarning('Invalid data format received from API');
        return;
    }
    
    var hourly = data.hourly;
    var times = hourly.time;
    var temperatures = hourly.temperature_2m;
    var windSpeeds = hourly.wind_speed_10m;
    var precipitationProb = hourly.precipitation_probability || [];
    var cloudCover = hourly.cloud_cover || [];
    
    // Process marine data if available, but don't fail if it's invalid
    var marineTimes = null;
    var seaTemperatures = null;
    
    if (marineData && marineData.hourly && marineData.hourly.time && marineData.hourly.sea_surface_temperature) {
        marineTimes = marineData.hourly.time;
        seaTemperatures = marineData.hourly.sea_surface_temperature;
    } else {
        console.warn('Marine data not available, will use estimated water temperatures');
    }
    
    // Validate that temperature and wind data are arrays with values
    if (!Array.isArray(temperatures) || !Array.isArray(windSpeeds) || 
        temperatures.length === 0 || windSpeeds.length === 0) {
        console.error('Temperature or wind data is missing or invalid');
        showDataWarning('Temperature or wind data is missing from API response');
        return;
    }
    
    // Check for invalid data (null, undefined, or non-numeric values)
    var hasInvalidTemp = temperatures.some(function(t) { return t == null || typeof t !== 'number' || isNaN(t); });
    var hasInvalidWind = windSpeeds.some(function(w) { return w == null || typeof w !== 'number' || isNaN(w); });
    
    if (hasInvalidTemp || hasInvalidWind) {
        console.error('Temperature or wind data contains invalid values');
        showDataWarning('Temperature or wind data contains invalid values');
        return;
    }
    
    // Create a map of marine data for easy lookup with fuzzy matching
    var marineDataMap = {};
    if (marineTimes && seaTemperatures) {
        // Validate seaTemperatures contains only valid numbers
        var hasInvalidSeaTemp = seaTemperatures.some(function(t) { return t == null || typeof t !== 'number' || isNaN(t); });
        
        if (hasInvalidSeaTemp) {
            console.warn('Sea temperature data contains invalid values, will use estimated water temperatures');
        } else {
            for (var i = 0; i < marineTimes.length; i++) {
                var marineTime = new Date(marineTimes[i]).getTime();
                marineDataMap[marineTimes[i]] = {
                    timestamp: marineTime,
                    temperature: seaTemperatures[i]
                };
            }
        }
    }
    
    // Group data by day
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
                    water: [],
                    precipitation: [],
                    cloudCover: []
                };
            }
            
            dayMap[dateKey].hours.push(hour);
            dayMap[dateKey].temp.push(Math.round(temperatures[i]));
            dayMap[dateKey].wind.push(Math.round(windSpeeds[i]));
            
            // Add precipitation probability (0-100%)
            var precip = precipitationProb[i];
            dayMap[dateKey].precipitation.push(precip != null ? Math.round(precip) : 0);
            
            // Add cloud cover (0-100%)
            var cloud = cloudCover[i];
            dayMap[dateKey].cloudCover.push(cloud != null ? Math.round(cloud) : 0);
            
            // Get water temperature from marine API with fuzzy matching or estimate if not available
            var waterTemp = null;
            var ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds
            
            if (Object.keys(marineDataMap).length > 0) {
                var currentTime = new Date(times[i]).getTime();
                var exactMatch = marineDataMap[times[i]];
                
                if (exactMatch) {
                    waterTemp = exactMatch.temperature;
                } else {
                    // Find nearest time within 1 hour tolerance
                    var closestTime = null;
                    var minDiff = Infinity;
                    
                    for (var marineKey in marineDataMap) {
                        var timeDiff = Math.abs(marineDataMap[marineKey].timestamp - currentTime);
                        if (timeDiff < minDiff) {
                            minDiff = timeDiff;
                            closestTime = marineKey;
                        }
                    }
                    
                    // Only use the closest match if it's within 1 hour tolerance
                    if (closestTime && minDiff <= ONE_HOUR_MS) {
                        waterTemp = marineDataMap[closestTime].temperature;
                    }
                }
            }
            
            // Using != null to check for both null and undefined
            if (waterTemp != null && typeof waterTemp === 'number' && !isNaN(waterTemp)) {
                dayMap[dateKey].water.push(Math.round(waterTemp * 10) / 10);
            } else {
                // Fallback to estimate
                dayMap[dateKey].water.push(Math.round((temperatures[i] - 2.5) * 10) / 10);
            }
        }
    }
    
    // Convert to array and validate we have data
    weatherData = Object.values(dayMap);
    
    // Sort weatherData by date to ensure chronological order
    weatherData.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    
    if (weatherData.length === 0) {
        console.error('No valid weather data found in the expected time range');
        showDataWarning('No weather data available for the selected time period');
        return;
    }
}

function showDataWarning(message) {
    var vizCard = document.querySelector('.viz-card');
    var warningBox = document.createElement('div');
    warningBox.className = 'warning-box';
    warningBox.innerHTML = '<div class="warning-title">⚠️ Data Error</div><div class="warning-text">' + message + '</div>';
    
    // Clear existing content
    var canvasContainer = document.querySelector('.canvas-container');
    var legend = document.querySelector('.legend');
    var infoBox = document.querySelector('.info-box');
    var locationLabel = document.querySelector('.location-label');
    
    if (canvasContainer) canvasContainer.style.display = 'none';
    if (legend) legend.style.display = 'none';
    if (infoBox) infoBox.style.display = 'none';
    if (locationLabel) locationLabel.style.display = 'none';
    
    // Insert warning after subtitle
    var subtitle = document.querySelector('.viz-subtitle');
    if (subtitle) {
        subtitle.parentNode.insertBefore(warningBox, subtitle.nextSibling);
    }
}

function updateDateDisplay() {
    if (weatherData.length > 0 && weatherData[currentDay]) {
        var dateStr = weatherData[currentDay].date;
        var dateObj = new Date(dateStr + 'T00:00:00');
        var options = { month: 'short', day: 'numeric', year: 'numeric' };
        var formattedDate = dateObj.toLocaleDateString('en-US', options);
        
        // Update currentDate elements
        var currentDateElement = document.getElementById('currentDate');
        if (!currentDateElement) currentDateElement = document.getElementById('currentDateFishing');
        if (currentDateElement) currentDateElement.textContent = formattedDate;
        
        // Also update the chart subtitle with the date
        var chartDateElement = document.getElementById('chartDate');
        if (!chartDateElement) chartDateElement = document.getElementById('chartDateFishing');
        if (chartDateElement) {
            chartDateElement.textContent = formattedDate;
        }
        // Update second chart date displays
        var currentDate2Element = document.getElementById('currentDate2');
        if (currentDate2Element) {
            currentDate2Element.textContent = formattedDate;
        }
        var chartDate2Element = document.getElementById('chartDate2');
        if (!chartDate2Element) chartDate2Element = document.getElementById('chartDateFishing2');
        if (chartDate2Element) {
            chartDate2Element.textContent = formattedDate;
        }
        // Update third chart date displays
        var currentDate3Element = document.getElementById('currentDate3');
        if (currentDate3Element) {
            currentDate3Element.textContent = formattedDate;
        }
        var chartDate3Element = document.getElementById('chartDate3');
        if (!chartDate3Element) chartDate3Element = document.getElementById('chartDateFishing3');
        if (chartDate3Element) {
            chartDate3Element.textContent = formattedDate;
        }
        // Update fourth chart date displays (hourly rating)
        var currentDate4Element = document.getElementById('currentDate4');
        if (currentDate4Element) {
            currentDate4Element.textContent = formattedDate;
        }
        var chartDate4Element = document.getElementById('chartDate4');
        if (!chartDate4Element) chartDate4Element = document.getElementById('chartDateFishing4');
        if (chartDate4Element) {
            chartDate4Element.textContent = formattedDate;
        }
    }
}

function updateDayButtons() {
    var daySelector = document.getElementById('globalDaySelector');
    if (!daySelector) {
        daySelector = document.getElementById('globalDaySelectorFishing');
    }
    if (!daySelector) return;
    
    daySelector.innerHTML = '';
    
    // Get today's date at midnight for comparison
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Track if we need to update currentDay to the first available future date
    var firstFutureDay = -1;
    var currentDayDateObj = weatherData[currentDay] ? new Date(weatherData[currentDay].date + 'T00:00:00') : null;
    var isCurrentDayPast = currentDayDateObj && currentDayDateObj < today;
    
    // Create a button for each day found in the data, but only for today and future dates
    for (var i = 0; i < weatherData.length; i++) {
        var dateObj = new Date(weatherData[i].date + 'T00:00:00');
        
        // Only create button if date is today or in the future
        if (dateObj >= today) {
            // Track the first future day index
            if (firstFutureDay === -1) {
                firstFutureDay = i;
            }
            
            // If current day is in the past, use the first future day for the active state
            var dayToCheck = isCurrentDayPast ? firstFutureDay : currentDay;
            
            var btn = document.createElement('button');
            btn.className = 'day-btn' + (i === dayToCheck ? ' active' : '');
            btn.setAttribute('data-day', i);
            
            var monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Display the actual date for each day in the data
            btn.textContent = monthDay;
            
            daySelector.appendChild(btn);
        }
    }
    
    // If current day is in the past, automatically select the first future day
    if (isCurrentDayPast && firstFutureDay !== -1) {
        currentDay = firstFutureDay;
        updateChart();
        updateDateDisplay();
    }
}

// Calculate a normalized score from 0 to 1 based on how close value is to ideal
// Uses cubic Bézier spline falloff: score = 1 in ideal range, falls off smoothly outside
function calculateRating(value, ideal, min, max, z1, z2) {
    // Default z1 and z2 values if not provided
    if (z1 === undefined) z1 = 0.5;
    if (z2 === undefined) z2 = 0.5;
    
    var idealMin, idealMax;
    
    if (Array.isArray(ideal)) {
        // Ideal is a range [min_ideal, max_ideal]
        idealMin = ideal[0];
        idealMax = ideal[1];
    } else {
        // Ideal is a single value, treat as a range with width 0
        idealMin = ideal;
        idealMax = ideal;
    }
    
    // If value is in the ideal range, return perfect score
    if (value >= idealMin && value <= idealMax) {
        return 1.0;
    }
    
    // Calculate parameter t based on whether value is below or above ideal range
    var t;
    if (value < idealMin) {
        // Below ideal range
        if (idealMin === min) {
            // All values at or below ideal are perfect
            return 1.0;
        }
        t = 1 - (idealMin - value) / (idealMin - min);
    } else {
        // Above ideal range
        if (idealMax === max) {
            // All values at or above ideal are perfect
            return 1.0;
        }
        t = 1 - (value - idealMax) / (max - idealMax);
    }
    
    // Clamp t to [0, 1] range
    t = Math.max(0, Math.min(1, t));
    
    // Calculate L constant
    var L = 0.6 * Math.sqrt(2);
    
    // Calculate Bézier control points P1y and P2y
    var P1y = L * Math.sin((Math.PI / 4) * (1 - z1));
    var P2y = 1 - L * Math.sin((Math.PI / 4) * z2);
    
    // Calculate cubic Bézier function B(t)
    // B(t) = 3(1-t)²·t·P1y + 3(1-t)·t²·P2y + t³
    var oneMinusT = 1 - t;
    var B_t = 3 * oneMinusT * oneMinusT * t * P1y +
              3 * oneMinusT * t * t * P2y +
              t * t * t;
    
    // Clamp score to [0, 1] range
    var score = Math.max(0, Math.min(1, B_t));
    
    return score;
}

function calculateDayScores(dayData) {
    var scores = [];
    for (var i = 0; i < dayData.hours.length; i++) {
        var tempScore = calculateRating(dayData.temp[i], [idealRanges.temperature.idealMin, idealRanges.temperature.idealMax], idealRanges.temperature.min, idealRanges.temperature.max);
        var windScore = calculateRating(dayData.wind[i], [idealRanges.wind.idealMin, idealRanges.wind.idealMax], idealRanges.wind.min, idealRanges.wind.max);
        
        // Water score - only if water data exists (beach page)
        var waterScore = 0;
        if (dayData.water && dayData.water[i] !== undefined) {
            waterScore = calculateRating(dayData.water[i], [idealRanges.water.idealMin, idealRanges.water.idealMax], idealRanges.water.min, idealRanges.water.max);
        }
        
        // Precipitation: lower is better (0% = 1.0 score, 100% = 0.0 score)
        var precipScore = 1 - (dayData.precipitation[i] / 100);
        
        // Cloud cover: stored as raw percentage for visualization
        // Also calculate score: lower is better (0% = 1.0 score, 100% = 0.0 score)
        var cloudCoverValue = dayData.cloudCover[i];
        var cloudScore = 1 - (cloudCoverValue / 100);
        
        // Calculate normalized rating with multiplicative approach (biased towards 0 scores)
        // This ensures that if any factor is very poor, the overall rating is heavily penalized
        // Multiply all factors together - if any factor is 0, rating approaches 0
        // Apply weights by raising each score to the power of its weight
        var weightedTempScore = Math.pow(tempScore, ratingWeights.temperature);
        var weightedWaterScore = waterScore > 0 ? Math.pow(waterScore, ratingWeights.water) : 1; // Skip if no water data
        var weightedWindScore = Math.pow(windScore, ratingWeights.wind);
        var weightedCloudScore = Math.pow(cloudScore, ratingWeights.cloud);
        var weightedPrecipScore = Math.pow(precipScore, ratingWeights.precipitation);
        
        var normalizedRating = weightedTempScore * weightedWaterScore * weightedWindScore * weightedCloudScore * weightedPrecipScore;
        normalizedRating = Math.max(0, Math.min(1, normalizedRating)); // Clamp to [0, 1]
        
        var scoreData = {
            hour: dayData.hours[i],
            temp: dayData.temp[i],
            wind: dayData.wind[i],
            precipitation: dayData.precipitation[i],
            cloudCover: cloudCoverValue,
            tempScore: tempScore,
            windScore: windScore,
            precipScore: precipScore,
            cloudCoverNormalized: cloudCoverValue / 100,
            cloudScore: cloudScore,
            normalizedRating: normalizedRating
        };
        
        // Add water data if it exists (beach page)
        if (dayData.water && dayData.water[i] !== undefined) {
            scoreData.water = dayData.water[i];
            scoreData.waterScore = waterScore;
        }
        
        // Add fishing-specific data if it exists
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
        
        scores.push(scoreData);
    }
    // Sort scores by hour to ensure chronological order (7am to 7pm)
    scores.sort(function(a, b) { return a.hour - b.hour; });
    return scores;
}

// Calculate daily normalized rating for all days (weekly overview)
function calculateWeeklyRatings() {
    var weeklyRatings = [];
    for (var d = 0; d < weatherData.length; d++) {
        var dayScores = calculateDayScores(weatherData[d]);
        // Average the normalized ratings across all hours of the day
        var sumRating = 0;
        for (var i = 0; i < dayScores.length; i++) {
            sumRating += dayScores[i].normalizedRating;
        }
        var avgRating = dayScores.length > 0 ? sumRating / dayScores.length : 0;
        
        weeklyRatings.push({
            date: weatherData[d].date,
            rating: avgRating
        });
    }
    return weeklyRatings;
}

function formatTime(hour) {
    if (hour === 12) return '12pm';
    if (hour < 12) return hour + 'am';
    return (hour - 12) + 'pm';
}

// Helper function to draw a water droplet
function drawDroplet(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Draw teardrop shape
    ctx.bezierCurveTo(
        x - size, y - size * 0.5,
        x - size, y - size * 1.5,
        x, y - size * 2
    );
    ctx.bezierCurveTo(
        x + size, y - size * 1.5,
        x + size, y - size * 0.5,
        x, y
    );
    ctx.fill();
}

// Catmull-Rom spline interpolation
function getCatmullRomPoint(t, p0, p1, p2, p3) {
    var t2 = t * t;
    var t3 = t2 * t;
    
    var v0 = (p2 - p0) * 0.5;
    var v1 = (p3 - p1) * 0.5;
    
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 +
           (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
           v0 * t + p1;
}

function createSmoothPath(points, segments) {
    var smoothPoints = [];
    
    for (var i = 0; i < points.length - 1; i++) {
        var p0 = points[Math.max(0, i - 1)];
        var p1 = points[i];
        var p2 = points[i + 1];
        var p3 = points[Math.min(points.length - 1, i + 2)];
        
        for (var s = 0; s < segments; s++) {
            var t = s / segments;
            var angle = getCatmullRomPoint(t, p0.angle, p1.angle, p2.angle, p3.angle);
            var radius = getCatmullRomPoint(t, p0.radius, p1.radius, p2.radius, p3.radius);
            smoothPoints.push({ angle: angle, radius: radius });
        }
    }
    
    smoothPoints.push(points[points.length - 1]);
    return smoothPoints;
}

function renderTimeline(scores, timelineId) {
    var timeline = document.getElementById(timelineId);
    if (!timeline) return;
    
    timeline.innerHTML = '';
    
    // Check if we have active datasets for fishing page
    var activeDatasets = window.activeDatasets || {};
    var isFishingPage = timelineId && timelineId.includes('Fishing');
    
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        
        var item = document.createElement('div');
        item.className = 'timeline-item';
        
        var timeDiv = document.createElement('div');
        timeDiv.className = 'timeline-time';
        timeDiv.textContent = formatTime(s.hour);
        item.appendChild(timeDiv);
        
        // Pressure (fishing only)
        if (isFishingPage && activeDatasets.pressure !== false && s.pressure !== undefined) {
            var pressureDiv = document.createElement('div');
            pressureDiv.className = 'timeline-data-item pressure';
            var pressureIcon = document.createElement('span');
            pressureIcon.className = 'icon';
            pressureIcon.textContent = '🔵';
            pressureDiv.appendChild(pressureIcon);
            pressureDiv.appendChild(document.createTextNode(' ' + (s.pressure || 'N/A') + ' hPa'));
            item.appendChild(pressureDiv);
        }
        
        // Precipitation / Rain
        if (!isFishingPage || activeDatasets.rain !== false) {
            var precipDiv = document.createElement('div');
            precipDiv.className = 'timeline-data-item precip';
            var precipIcon = document.createElement('span');
            precipIcon.className = 'icon';
            precipIcon.textContent = '💧';
            precipDiv.appendChild(precipIcon);
            precipDiv.appendChild(document.createTextNode(' ' + s.precipitation + '%'));
            item.appendChild(precipDiv);
        }
        
        // Cloud Cover
        if (!isFishingPage || activeDatasets.cloudCover !== false) {
            var cloudDiv = document.createElement('div');
            cloudDiv.className = 'timeline-data-item cloud';
            var cloudIcon = document.createElement('span');
            cloudIcon.className = 'icon';
            cloudIcon.textContent = '☁️';
            cloudDiv.appendChild(cloudIcon);
            cloudDiv.appendChild(document.createTextNode(' ' + s.cloudCover + '%'));
            item.appendChild(cloudDiv);
        }
        
        // Wind Speed
        if (!isFishingPage || activeDatasets.windSpeed !== false) {
            var windDiv = document.createElement('div');
            windDiv.className = 'timeline-data-item wind';
            var windIcon = document.createElement('span');
            windIcon.className = 'icon';
            windIcon.textContent = '💨';
            windDiv.appendChild(windIcon);
            windDiv.appendChild(document.createTextNode(' ' + s.wind + ' km/h'));
            item.appendChild(windDiv);
        }
        
        // Wave Height (fishing only)
        if (isFishingPage && activeDatasets.waveHeight !== false && s.waveHeight !== undefined) {
            var waveDiv = document.createElement('div');
            waveDiv.className = 'timeline-data-item wave';
            var waveIcon = document.createElement('span');
            waveIcon.className = 'icon';
            waveIcon.textContent = '🌊';
            waveDiv.appendChild(waveIcon);
            waveDiv.appendChild(document.createTextNode(' ' + (s.waveHeight || 'N/A') + ' m'));
            item.appendChild(waveDiv);
        }
        
        // Tide (fishing only)
        if (isFishingPage && activeDatasets.tide !== false && s.tideHeight !== undefined) {
            var tideDiv = document.createElement('div');
            tideDiv.className = 'timeline-data-item tide';
            var tideIcon = document.createElement('span');
            tideIcon.className = 'icon';
            tideIcon.textContent = '🌊';
            tideDiv.appendChild(tideIcon);
            tideDiv.appendChild(document.createTextNode(' ' + (s.tideHeight || 'N/A') + '%'));
            item.appendChild(tideDiv);
        }
        
        // Water Temperature (beach page)
        if (!isFishingPage) {
            var waterDiv = document.createElement('div');
            waterDiv.className = 'timeline-data-item water';
            var waterIcon = document.createElement('span');
            waterIcon.className = 'icon';
            waterIcon.textContent = '🌊';
            waterDiv.appendChild(waterIcon);
            waterDiv.appendChild(document.createTextNode(' ' + s.water + '°C'));
            item.appendChild(waterDiv);
        }
        
        // Air Temperature
        if (!isFishingPage || activeDatasets.temperature !== false) {
            var tempDiv = document.createElement('div');
            tempDiv.className = 'timeline-data-item temp';
            var tempIcon = document.createElement('span');
            tempIcon.className = 'icon';
            tempIcon.textContent = '☀️';
            tempDiv.appendChild(tempIcon);
            tempDiv.appendChild(document.createTextNode(' ' + s.temp + '°C'));
            item.appendChild(tempDiv);
        }
        
        timeline.appendChild(item);
    }
}

function drawRadialSpline(scores) {
    var canvas = document.getElementById('mainCanvas');
    if (!canvas) {
        canvas = document.getElementById('mainCanvasFishing');
    }
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    // Make canvas responsive to container width
    var container = canvas.parentElement;
    if (!container) return;
    var containerWidth = container.clientWidth;
    var width = containerWidth || 1000; // Fallback to default width
    var height = width * 0.6; // Aspect ratio adjusted for larger display (60% height)
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Calculate spacing for labels around the chart
    // Labels are positioned at radius + 50 (time labels only, data moved to timeline below)
    var sidePadding = 80; // Space needed on left/right for time labels
    var topPadding = 70; // Space needed at top for time labels
    var bottomPadding = 20; // Small space at bottom
    
    // Calculate center position and maximum radius
    var cx = width / 2;
    var cy = height - bottomPadding; // Position near bottom with small margin
    
    // Maximum radius is constrained by available space: 
    // 1. Vertical:  cy - topPadding (for top labels)
    // 2. Horizontal: cx - sidePadding (for left/right labels, center is at width/2)
    var maxRadiusVertical = cy - topPadding;
    var maxRadiusHorizontal = cx - sidePadding;
    var maxAllowedRadius = Math.min(maxRadiusVertical, maxRadiusHorizontal);
    
    // Check which datasets are enabled (for fishing page dataset controls)
    var activeDatasets = window.activeDatasets || {
        temperature: true,
        windSpeed: true,
        cloudCover: true,
        rain: true
    };
    
    // Count active data layers (excluding cloud cover which is rendered separately)
    var dataLayers = 0;
    if (activeDatasets.pressure) dataLayers++;
    if (activeDatasets.temperature) dataLayers++;
    if (activeDatasets.windSpeed || activeDatasets.wind) dataLayers++;  // Support both names
    if (activeDatasets.waveHeight) dataLayers++;
    if (activeDatasets.tide) dataLayers++;
    // Water temp is always included if temperature is included
    
    // Ensure at least one layer
    if (dataLayers === 0) dataLayers = 1;
    
    // Calculate inner radius and layer heights
    // New order: Temperature, Water Temp, Wind, Cloud Cover (inverted)
    // Cloud cover has a margin, so we'll allocate space as: N layers + margin + cloud layer
    var innerRadius = maxAllowedRadius * 0.25; // Inner radius is 25% of max radius
    var availableSpace = maxAllowedRadius - innerRadius;
    var cloudMargin = availableSpace * 0.1; // 10% margin before cloud layer
    var cloudLayerHeight = availableSpace * 0.2; // 20% for cloud layer
    // Water temp is included in dataLayers count if temperature is enabled
    var totalDataLayers = dataLayers;
    if (activeDatasets.temperature) totalDataLayers++; // Add 1 for water temp layer
    var maxHeight = (availableSpace - cloudMargin - cloudLayerHeight) / totalDataLayers;
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate angles (9 o'clock to 3 o'clock, going UP and over = PI to 2*PI, clockwise)
    var startAngle = Math.PI; // 9 o'clock (left side) - 7am
    var endAngle = 2 * Math.PI; // 3 o'clock (right side) - 7pm
    var angleRange = Math.PI; // semicircle going through the top
    
    // Calculate total active layers for proper spacing
    var totalActiveLayers = 0;
    if (activeDatasets.pressure) totalActiveLayers++;
    if (activeDatasets.temperature) totalActiveLayers += 2;  // temp + water
    if (activeDatasets.windSpeed || activeDatasets.wind) totalActiveLayers++;
    if (activeDatasets.waveHeight) totalActiveLayers++;
    if (activeDatasets.tide) totalActiveLayers++;
    
    // Create point arrays for each metric
    var pressurePoints = [];
    var tempPoints = [];
    var waterPoints = [];
    var windPoints = [];
    var waveHeightPoints = [];
    var tidePoints = [];
    var cloudPoints = [];
    
    // Inner and outer boundaries for each ring section
    var pressureInnerPoints = [];
    var tempInnerPoints = [];
    var waterInnerPoints = [];
    var windInnerPoints = [];
    var waveHeightInnerPoints = [];
    var tideInnerPoints = [];
    var cloudOuterPoints = []; // Cloud layer outer boundary (inverted from here)
    
    // Track current layer offset
    var currentLayerOffset = 0;
    
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var t = i / (scores.length - 1);
        var angle = startAngle + t * angleRange; // add to go clockwise (left to right via top)
        
        // Scores are 0-1, calculate layer thicknesses for each separate ring
        // Order from center out: Pressure, Temperature, Water Temp, Wind, Wave Height, Tide, Cloud Cover
        
        var pressureLayerHeight = s.pressureScore ? s.pressureScore * maxHeight : 0;
        var tempLayerHeight = s.tempScore * maxHeight;
        var waterLayerHeight = s.waterScore * maxHeight;
        var windLayerHeight = s.windScore * maxHeight;
        var waveHeightLayerHeight = s.waveHeightScore ? s.waveHeightScore * maxHeight : 0;
        var tideLayerHeight = s.tideScore ? s.tideScore * maxHeight : 0;
        
        // Calculate cloud outer radius based on active layers
        var cloudOuterRadius = innerRadius + totalActiveLayers * maxHeight + cloudMargin + cloudLayerHeight;
        var cloudInnerRadius = cloudOuterRadius - s.cloudCoverNormalized * cloudLayerHeight;
        
        // Reset layer offset for each point
        currentLayerOffset = 0;
        
        // Pressure ring: offset 0 (if enabled)
        if (activeDatasets.pressure && s.pressureScore) {
            pressureInnerPoints.push({ angle: angle, radius: innerRadius });
            pressurePoints.push({ angle: angle, radius: innerRadius + pressureLayerHeight });
            currentLayerOffset++;
        }
        
        // Temperature ring: offset based on previous layers (if enabled)
        if (activeDatasets.temperature) {
            tempInnerPoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight });
            tempPoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight + tempLayerHeight });
            currentLayerOffset++;
            
            // Water ring: next layer (always with temperature)
            waterInnerPoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight });
            waterPoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight + waterLayerHeight });
            currentLayerOffset++;
        }
        
        // Wind ring: offset based on previous layers
        if (activeDatasets.windSpeed || activeDatasets.wind) {
            windInnerPoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight });
            windPoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight + windLayerHeight });
            currentLayerOffset++;
        }
        
        // Wave height ring: offset based on previous layers (if enabled)
        if (activeDatasets.waveHeight && s.waveHeightScore) {
            waveHeightInnerPoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight });
            waveHeightPoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight + waveHeightLayerHeight });
            currentLayerOffset++;
        }
        
        // Tide ring: offset based on previous layers (if enabled)
        if (activeDatasets.tide && s.tideScore) {
            tideInnerPoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight });
            tidePoints.push({ angle: angle, radius: innerRadius + currentLayerOffset * maxHeight + tideLayerHeight });
            currentLayerOffset++;
        }
        
        // Cloud ring: inverted from outer edge (if enabled)
        if (activeDatasets.cloudCover) {
            cloudOuterPoints.push({ angle: angle, radius: cloudOuterRadius });
            cloudPoints.push({ angle: angle, radius: cloudInnerRadius });
        }
    }
    
    // Create smooth curves for outer boundaries (only for enabled datasets)
    var smoothPressure, smoothTemp, smoothWater, smoothWind, smoothWaveHeight, smoothTide, smoothCloud;
    var smoothPressureInner, smoothTempInner, smoothWaterInner, smoothWindInner, smoothWaveHeightInner, smoothTideInner, smoothCloudOuter;
    
    if (activeDatasets.pressure && pressurePoints.length > 0) {
        smoothPressure = createSmoothPath(pressurePoints, 10);
        smoothPressureInner = createSmoothPath(pressureInnerPoints, 10);
    }
    
    if (activeDatasets.temperature && tempPoints.length > 0) {
        smoothTemp = createSmoothPath(tempPoints, 10);
        smoothTempInner = createSmoothPath(tempInnerPoints, 10);
        smoothWater = createSmoothPath(waterPoints, 10);
        smoothWaterInner = createSmoothPath(waterInnerPoints, 10);
    }
    
    if ((activeDatasets.windSpeed || activeDatasets.wind) && windPoints.length > 0) {
        smoothWind = createSmoothPath(windPoints, 10);
        smoothWindInner = createSmoothPath(windInnerPoints, 10);
    }
    
    if (activeDatasets.waveHeight && waveHeightPoints.length > 0) {
        smoothWaveHeight = createSmoothPath(waveHeightPoints, 10);
        smoothWaveHeightInner = createSmoothPath(waveHeightInnerPoints, 10);
    }
    
    if (activeDatasets.tide && tidePoints.length > 0) {
        smoothTide = createSmoothPath(tidePoints, 10);
        smoothTideInner = createSmoothPath(tideInnerPoints, 10);
    }
    
    if (activeDatasets.cloudCover && cloudPoints.length > 0) {
        smoothCloud = createSmoothPath(cloudPoints, 10);
        smoothCloudOuter = createSmoothPath(cloudOuterPoints, 10);
    }
    
    // Draw precipitation droplets in background (for each hour segment) - only if rain is enabled
    if (activeDatasets.rain) {
        var maxRadiusForDroplets = innerRadius + totalActiveLayers * maxHeight + cloudMargin + cloudLayerHeight;
        for (var i = 0; i < scores.length - 1; i++) {
            var s = scores[i];
            var nextS = scores[i + 1];
            var precipIntensity = s.precipitation / 100; // 0 to 1
            
            if (precipIntensity > 0) {
                var t1 = i / (scores.length - 1);
                var t2 = (i + 1) / (scores.length - 1);
                var angle1 = startAngle + t1 * angleRange;
                var angle2 = startAngle + t2 * angleRange;
                var midAngle = (angle1 + angle2) / 2;
                
                // Number of droplets based on precipitation probability (consistent across all charts)
                var numDroplets = Math.floor(precipIntensity * 12) + 2;
                
                // Draw droplets in this segment, falling toward center
                for (var d = 0; d < numDroplets; d++) {
                    // Random position within the segment
                    var angleOffset = (Math.random() - 0.5) * (angle2 - angle1) * 0.8;
                    var dropAngle = midAngle + angleOffset;
                    var radiusPos = innerRadius + Math.random() * (maxRadiusForDroplets - innerRadius);
                    
                    var dropX = cx + Math.cos(dropAngle) * radiusPos;
                    var dropY = cy + Math.sin(dropAngle) * radiusPos;
                    
                    // Droplet size varies with intensity
                    var dropSize = 2 + precipIntensity * 3;
                    
                    // Calculate rotation to point toward center
                    var angleToCenter = Math.atan2(cy - dropY, cx - dropX);
                    
                    ctx.save();
                    ctx.translate(dropX, dropY);
                    ctx.rotate(angleToCenter);
                    
                    // Draw droplet with precipitation color
                    var alpha = 0.3 + precipIntensity * 0.3;
                    ctx.fillStyle = 'rgba(121, 147, 232, ' + alpha + ')'; // #7993e8
                    drawDroplet(ctx, 0, 0, dropSize);
                    
                    ctx.restore();
                }
            }
        }
    }
    
    // Draw pressure ring (innermost) - #667eea (blue-purple) - only if enabled
    if (activeDatasets.pressure && smoothPressure && smoothPressureInner) {
        ctx.fillStyle = 'rgba(102, 126, 234, 0.5)';
        ctx.beginPath();
        for (var i = 0; i < smoothPressure.length; i++) {
            var x = cx + Math.cos(smoothPressure[i].angle) * smoothPressure[i].radius;
            var y = cy + Math.sin(smoothPressure[i].angle) * smoothPressure[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothPressureInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothPressureInner[i].angle) * smoothPressureInner[i].radius;
            var y = cy + Math.sin(smoothPressureInner[i].angle) * smoothPressureInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(80, 100, 200, 0.8)'; // Darker stroke
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw temperature ring - #F28C28 - only if enabled
    if (activeDatasets.temperature && smoothTemp && smoothTempInner) {
        ctx.fillStyle = 'rgba(242, 140, 40, 0.5)';
        ctx.beginPath();
        for (var i = 0; i < smoothTemp.length; i++) {
            var x = cx + Math.cos(smoothTemp[i].angle) * smoothTemp[i].radius;
            var y = cy + Math.sin(smoothTemp[i].angle) * smoothTemp[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothTempInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothTempInner[i].angle) * smoothTempInner[i].radius;
            var y = cy + Math.sin(smoothTempInner[i].angle) * smoothTempInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 100, 20, 0.8)'; // Darker stroke
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw water temp ring (second layer) - #1F5FA8 - only if temperature is enabled
    if (activeDatasets.temperature && smoothWater && smoothWaterInner) {
        ctx.fillStyle = 'rgba(31, 95, 168, 0.5)';
        ctx.beginPath();
        for (var i = 0; i < smoothWater.length; i++) {
            var x = cx + Math.cos(smoothWater[i].angle) * smoothWater[i].radius;
            var y = cy + Math.sin(smoothWater[i].angle) * smoothWater[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothWaterInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothWaterInner[i].angle) * smoothWaterInner[i].radius;
            var y = cy + Math.sin(smoothWaterInner[i].angle) * smoothWaterInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(15, 50, 120, 0.8)'; // Darker stroke
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw wind ring - #7FB3D5 (light blue) - only if enabled
    if ((activeDatasets.windSpeed || activeDatasets.wind) && smoothWind && smoothWindInner) {
        ctx.fillStyle = 'rgba(127, 179, 213, 0.5)';
        ctx.beginPath();
        for (var i = 0; i < smoothWind.length; i++) {
            var x = cx + Math.cos(smoothWind[i].angle) * smoothWind[i].radius;
            var y = cy + Math.sin(smoothWind[i].angle) * smoothWind[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothWindInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothWindInner[i].angle) * smoothWindInner[i].radius;
            var y = cy + Math.sin(smoothWindInner[i].angle) * smoothWindInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(90, 140, 170, 0.8)'; // Darker stroke
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw wave height ring - #1F5FA8 (dark blue) - only if enabled
    if (activeDatasets.waveHeight && smoothWaveHeight && smoothWaveHeightInner) {
        ctx.fillStyle = 'rgba(31, 95, 168, 0.5)';
        ctx.beginPath();
        for (var i = 0; i < smoothWaveHeight.length; i++) {
            var x = cx + Math.cos(smoothWaveHeight[i].angle) * smoothWaveHeight[i].radius;
            var y = cy + Math.sin(smoothWaveHeight[i].angle) * smoothWaveHeight[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothWaveHeightInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothWaveHeightInner[i].angle) * smoothWaveHeightInner[i].radius;
            var y = cy + Math.sin(smoothWaveHeightInner[i].angle) * smoothWaveHeightInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(15, 60, 120, 0.8)'; // Darker stroke
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw tide ring - #32dbae (teal) - only if enabled
    if (activeDatasets.tide && smoothTide && smoothTideInner) {
        ctx.fillStyle = 'rgba(50, 219, 174, 0.5)';
        ctx.beginPath();
        for (var i = 0; i < smoothTide.length; i++) {
            var x = cx + Math.cos(smoothTide[i].angle) * smoothTide[i].radius;
            var y = cy + Math.sin(smoothTide[i].angle) * smoothTide[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothTideInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothTideInner[i].angle) * smoothTideInner[i].radius;
            var y = cy + Math.sin(smoothTideInner[i].angle) * smoothTideInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(30, 180, 140, 0.8)'; // Darker stroke
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw cloud cover ring (outermost, inverted) - #c1cad9 - only if enabled
    if (activeDatasets.cloudCover && smoothCloud && smoothCloudOuter) {
        ctx.fillStyle = 'rgba(193, 202, 217, 0.5)';
        ctx.beginPath();
        for (var i = 0; i < smoothCloudOuter.length; i++) {
            var x = cx + Math.cos(smoothCloudOuter[i].angle) * smoothCloudOuter[i].radius;
            var y = cy + Math.sin(smoothCloudOuter[i].angle) * smoothCloudOuter[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothCloud.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothCloud[i].angle) * smoothCloud[i].radius;
            var y = cy + Math.sin(smoothCloud[i].angle) * smoothCloud[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(140, 150, 170, 0.8)'; // Darker stroke
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw stroke lines and labels for each section boundary
    // Temperature section boundary (at innerRadius) - only if enabled
    if (activeDatasets.temperature && smoothTempInner) {
        ctx.strokeStyle = 'rgba(242, 140, 40, 1.0)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (var i = 0; i < smoothTempInner.length; i++) {
            var x = cx + Math.cos(smoothTempInner[i].angle) * smoothTempInner[i].radius;
            var y = cy + Math.sin(smoothTempInner[i].angle) * smoothTempInner[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Water temp section boundary (at innerRadius + maxHeight) - only if temperature is enabled
    if (activeDatasets.temperature && smoothWaterInner) {
        ctx.strokeStyle = 'rgba(31, 95, 168, 1.0)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (var i = 0; i < smoothWaterInner.length; i++) {
            var x = cx + Math.cos(smoothWaterInner[i].angle) * smoothWaterInner[i].radius;
            var y = cy + Math.sin(smoothWaterInner[i].angle) * smoothWaterInner[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Wind section boundary (at innerRadius + 2*maxHeight) - only if enabled
    if ((activeDatasets.windSpeed || activeDatasets.wind) && smoothWindInner) {
        ctx.strokeStyle = 'rgba(50, 219, 174, 1.0)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (var i = 0; i < smoothWindInner.length; i++) {
            var x = cx + Math.cos(smoothWindInner[i].angle) * smoothWindInner[i].radius;
            var y = cy + Math.sin(smoothWindInner[i].angle) * smoothWindInner[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Cloud cover section boundary (outer edge) - only if enabled
    if (activeDatasets.cloudCover && smoothCloudOuter) {
        ctx.strokeStyle = 'rgba(193, 202, 217, 1.0)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (var i = 0; i < smoothCloudOuter.length; i++) {
            var x = cx + Math.cos(smoothCloudOuter[i].angle) * smoothCloudOuter[i].radius;
            var y = cy + Math.sin(smoothCloudOuter[i].angle) * smoothCloudOuter[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Draw text labels along the splines
    // Temperature label (at innerRadius, start of arc) - only if enabled
    if (activeDatasets.temperature) {
        ctx.save();
        var tempLabelAngle = startAngle + 0.1;
        var tempLabelRadius = innerRadius;
        var tempLabelX = cx + Math.cos(tempLabelAngle) * tempLabelRadius;
        var tempLabelY = cy + Math.sin(tempLabelAngle) * tempLabelRadius;
        ctx.translate(tempLabelX, tempLabelY);
        ctx.rotate(tempLabelAngle + Math.PI / 2);
        ctx.fillStyle = 'rgba(242, 140, 40, 1.0)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Temperature', 0, 0);
        ctx.restore();
        
        // Water label (at innerRadius + maxHeight)
        ctx.save();
        var waterLabelAngle = startAngle + 0.1;
        var waterLabelRadius = innerRadius + maxHeight;
        var waterLabelX = cx + Math.cos(waterLabelAngle) * waterLabelRadius;
        var waterLabelY = cy + Math.sin(waterLabelAngle) * waterLabelRadius;
        ctx.translate(waterLabelX, waterLabelY);
        ctx.rotate(waterLabelAngle + Math.PI / 2);
        ctx.fillStyle = 'rgba(31, 95, 168, 1.0)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Water Temp', 0, 0);
        ctx.restore();
    }
    
    // Wind label (at appropriate offset) - only if enabled
    if (activeDatasets.windSpeed || activeDatasets.wind) {
        // Wind offset: 2 layers if temperature is enabled (temp + water), 0 otherwise
        var tempLayerCount = 2; // temperature + water
        var windOffset = activeDatasets.temperature ? tempLayerCount : 0;
        ctx.save();
        var windLabelAngle = startAngle + 0.1;
        var windLabelRadius = innerRadius + windOffset * maxHeight;
        var windLabelX = cx + Math.cos(windLabelAngle) * windLabelRadius;
        var windLabelY = cy + Math.sin(windLabelAngle) * windLabelRadius;
        ctx.translate(windLabelX, windLabelY);
        ctx.rotate(windLabelAngle + Math.PI / 2);
        ctx.fillStyle = 'rgba(50, 219, 174, 1.0)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Wind Speed', 0, 0);
        ctx.restore();
    }
    
    // Cloud label (at outer edge) - only if enabled
    if (activeDatasets.cloudCover && cloudOuterPoints.length > 0) {
        ctx.save();
        var cloudLabelAngle = startAngle + 0.1;
        var cloudLabelRadius = cloudOuterPoints[0].radius;
        var cloudLabelX = cx + Math.cos(cloudLabelAngle) * cloudLabelRadius;
        var cloudLabelY = cy + Math.sin(cloudLabelAngle) * cloudLabelRadius;
        ctx.translate(cloudLabelX, cloudLabelY);
        ctx.rotate(cloudLabelAngle + Math.PI / 2);
        ctx.fillStyle = 'rgba(193, 202, 217, 1.0)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Cloud Cover', 0, 0);
        ctx.restore();
    }
    
    // Draw time labels and markers
    var maxRadiusForLabels = innerRadius + totalActiveLayers * maxHeight + cloudMargin + cloudLayerHeight;
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var t = i / (scores.length - 1);
        var angle = startAngle + t * angleRange;
        
        // Find the outermost radius for this angle
        var maxRadius = maxRadiusForLabels;
        
        // Draw radial line from inner to outer
        ctx.strokeStyle = 'rgba(200,200,200,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
        ctx.lineTo(cx + Math.cos(angle) * (maxRadius + 20), cy + Math.sin(angle) * (maxRadius + 20));
        ctx.stroke();
        
        // Time labels - positioned outside the chart
        var labelDist = maxRadius + 50;
        var x = cx + Math.cos(angle) * labelDist;
        var y = cy + Math.sin(angle) * labelDist;
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatTime(s.hour), x, y);
    }
    
    // Render the timeline below the chart
    var timelineElement = document.getElementById('timeline1');
    if (!timelineElement) timelineElement = document.getElementById('timelineFishing1');
    if (timelineElement) {
        renderTimeline(scores, timelineElement.id);
    }
}

function drawOverlaidChart(scores) {
    var canvas = document.getElementById('overlayCanvas');
    if (!canvas) {
        canvas = document.getElementById('overlayCanvasFishing');
    }
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    // Make canvas responsive to container width
    var container = canvas.parentElement;
    if (!container) return;
    var containerWidth = container.clientWidth;
    var width = containerWidth || 1000; // Fallback to default width
    var height = width * 0.6; // Aspect ratio adjusted for larger display (60% height)
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Calculate spacing for labels around the chart
    var sidePadding = 80; // Space needed on left/right for time labels
    var topPadding = 70; // Space needed at top for time labels
    var bottomPadding = 20; // Small space at bottom
    
    // Calculate center position and maximum radius
    var cx = width / 2;
    var cy = height - bottomPadding; // Position near bottom with small margin
    
    // Maximum radius is constrained by available space
    var maxRadiusVertical = cy - topPadding;
    var maxRadiusHorizontal = cx - sidePadding;
    var maxAllowedRadius = Math.min(maxRadiusVertical, maxRadiusHorizontal);
    
    // Check which datasets are enabled (for fishing page dataset controls)
    var activeDatasets = window.activeDatasets || {
        temperature: true,
        windSpeed: true,
        cloudCover: true,
        rain: true
    };
    
    // Calculate inner radius and layer height
    var innerRadius = maxAllowedRadius * 0.25; // Inner radius is 25% of max radius
    var maxHeight = maxAllowedRadius - innerRadius; // All data uses the same 0-1 range
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate angles (9 o'clock to 3 o'clock, going UP and over = PI to 2*PI, clockwise)
    var startAngle = Math.PI; // 9 o'clock (left side) - 7am
    var endAngle = 2 * Math.PI; // 3 o'clock (right side) - 7pm
    var angleRange = Math.PI; // semicircle going through the top
    
    // Create point arrays for each metric (all in 0-1 range now)
    var tempPoints = [];
    var waterPoints = [];
    var windPoints = [];
    var cloudPoints = [];
    
    // Inner boundary (same for all)
    var innerPoints = [];
    
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var t = i / (scores.length - 1);
        var angle = startAngle + t * angleRange; // add to go clockwise (left to right via top)
        
        // All scores are 0-1, all overlaid in the same range
        var tempLayerHeight = s.tempScore * maxHeight;
        var waterLayerHeight = s.waterScore * maxHeight;
        var windLayerHeight = s.windScore * maxHeight;
        var cloudLayerHeight = s.cloudCoverNormalized * maxHeight;
        
        // All metrics share the same inner boundary
        innerPoints.push({ angle: angle, radius: innerRadius });
        
        // Each metric has its own outer boundary based on its score (only if enabled)
        if (activeDatasets.temperature) {
            tempPoints.push({ angle: angle, radius: innerRadius + tempLayerHeight });
            waterPoints.push({ angle: angle, radius: innerRadius + waterLayerHeight });
        }
        if (activeDatasets.windSpeed || activeDatasets.wind) {
            windPoints.push({ angle: angle, radius: innerRadius + windLayerHeight });
        }
        if (activeDatasets.cloudCover) {
            cloudPoints.push({ angle: angle, radius: innerRadius + cloudLayerHeight });
        }
    }
    
    // Create smooth curves for all boundaries (only for enabled datasets)
    var smoothTemp, smoothWater, smoothWind, smoothCloud;
    var smoothInner = createSmoothPath(innerPoints, 10);
    
    if (activeDatasets.temperature && tempPoints.length > 0) {
        smoothTemp = createSmoothPath(tempPoints, 10);
        smoothWater = createSmoothPath(waterPoints, 10);
    }
    if ((activeDatasets.windSpeed || activeDatasets.wind) && windPoints.length > 0) {
        smoothWind = createSmoothPath(windPoints, 10);
    }
    if (activeDatasets.cloudCover && cloudPoints.length > 0) {
        smoothCloud = createSmoothPath(cloudPoints, 10);
    }
    
    // Draw precipitation droplets in background (for each hour segment) - only if enabled
    if (activeDatasets.rain) {
        for (var i = 0; i < scores.length - 1; i++) {
            var s = scores[i];
            var precipIntensity = s.precipitation / 100;
        
        if (precipIntensity > 0) {
            var t1 = i / (scores.length - 1);
            var t2 = (i + 1) / (scores.length - 1);
            var angle1 = startAngle + t1 * angleRange;
            var angle2 = startAngle + t2 * angleRange;
            var midAngle = (angle1 + angle2) / 2;
            
            var numDroplets = Math.floor(precipIntensity * 12) + 2;
            
            for (var d = 0; d < numDroplets; d++) {
                var angleOffset = (Math.random() - 0.5) * (angle2 - angle1) * 0.8;
                var dropAngle = midAngle + angleOffset;
                var radiusPos = innerRadius + Math.random() * (maxAllowedRadius - innerRadius);
                
                var dropX = cx + Math.cos(dropAngle) * radiusPos;
                var dropY = cy + Math.sin(dropAngle) * radiusPos;
                
                var dropSize = 2 + precipIntensity * 3;
                var angleToCenter = Math.atan2(cy - dropY, cx - dropX);
                
                ctx.save();
                ctx.translate(dropX, dropY);
                ctx.rotate(angleToCenter);
                
                var alpha = 0.3 + precipIntensity * 0.3;
                ctx.fillStyle = 'rgba(121, 147, 232, ' + alpha + ')';
                drawDroplet(ctx, 0, 0, dropSize);
                
                ctx.restore();
            }
        }
    }
    }
    
    // Draw cloud cover ring (bottom layer) - #c1cad9 - only if enabled
    if (activeDatasets.cloudCover && smoothCloud) {
        ctx.fillStyle = 'rgba(193, 202, 217, 0.3)';
        ctx.beginPath();
        for (var i = 0; i < smoothCloud.length; i++) {
            var x = cx + Math.cos(smoothCloud[i].angle) * smoothCloud[i].radius;
            var y = cy + Math.sin(smoothCloud[i].angle) * smoothCloud[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothInner[i].angle) * smoothInner[i].radius;
            var y = cy + Math.sin(smoothInner[i].angle) * smoothInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(140, 150, 170, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw water temp ring - #1F5FA8 - only if temperature is enabled
    if (activeDatasets.temperature && smoothWater) {
        ctx.fillStyle = 'rgba(31, 95, 168, 0.3)';
        ctx.beginPath();
        for (var i = 0; i < smoothWater.length; i++) {
            var x = cx + Math.cos(smoothWater[i].angle) * smoothWater[i].radius;
            var y = cy + Math.sin(smoothWater[i].angle) * smoothWater[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothInner[i].angle) * smoothInner[i].radius;
            var y = cy + Math.sin(smoothInner[i].angle) * smoothInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(15, 50, 120, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw wind ring - #32dbae - only if enabled
    if ((activeDatasets.windSpeed || activeDatasets.wind) && smoothWind) {
        ctx.fillStyle = 'rgba(50, 219, 174, 0.3)';
        ctx.beginPath();
        for (var i = 0; i < smoothWind.length; i++) {
            var x = cx + Math.cos(smoothWind[i].angle) * smoothWind[i].radius;
            var y = cy + Math.sin(smoothWind[i].angle) * smoothWind[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothInner[i].angle) * smoothInner[i].radius;
            var y = cy + Math.sin(smoothInner[i].angle) * smoothInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(20, 150, 120, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw temperature ring (top layer) - #F28C28 - only if enabled
    if (activeDatasets.temperature && smoothTemp) {
        ctx.fillStyle = 'rgba(242, 140, 40, 0.3)';
        ctx.beginPath();
        for (var i = 0; i < smoothTemp.length; i++) {
            var x = cx + Math.cos(smoothTemp[i].angle) * smoothTemp[i].radius;
            var y = cy + Math.sin(smoothTemp[i].angle) * smoothTemp[i].radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (var i = smoothInner.length - 1; i >= 0; i--) {
            var x = cx + Math.cos(smoothInner[i].angle) * smoothInner[i].radius;
            var y = cy + Math.sin(smoothInner[i].angle) * smoothInner[i].radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 100, 20, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw the inner boundary circle
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < smoothInner.length; i++) {
        var x = cx + Math.cos(smoothInner[i].angle) * smoothInner[i].radius;
        var y = cy + Math.sin(smoothInner[i].angle) * smoothInner[i].radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Draw time labels and markers
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var t = i / (scores.length - 1);
        var angle = startAngle + t * angleRange;
        
        // Find the outermost radius for this angle (maximum of all enabled metrics)
        var maxRadius = innerRadius;
        if (activeDatasets.temperature && tempPoints[i]) maxRadius = Math.max(maxRadius, tempPoints[i].radius);
        if ((activeDatasets.windSpeed || activeDatasets.wind) && windPoints[i]) maxRadius = Math.max(maxRadius, windPoints[i].radius);
        if (activeDatasets.temperature && waterPoints[i]) maxRadius = Math.max(maxRadius, waterPoints[i].radius);
        if (activeDatasets.cloudCover && cloudPoints[i]) maxRadius = Math.max(maxRadius, cloudPoints[i].radius);
        
        // Draw radial line from inner to outer
        ctx.strokeStyle = 'rgba(200,200,200,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
        ctx.lineTo(cx + Math.cos(angle) * (maxRadius + 20), cy + Math.sin(angle) * (maxRadius + 20));
        ctx.stroke();
        
        // Time labels - positioned outside the chart
        var labelDist = maxAllowedRadius + 50;
        var x = cx + Math.cos(angle) * labelDist;
        var y = cy + Math.sin(angle) * labelDist;
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatTime(s.hour), x, y);
    }
    
    // Render the timeline below the chart
    var timelineElement = document.getElementById('timeline2');
    if (!timelineElement) timelineElement = document.getElementById('timelineFishing1');
    if (timelineElement) {
        renderTimeline(scores, timelineElement.id);
    }
}

function drawStackedChart(scores) {
    var canvas = document.getElementById('stackedCanvas');
    if (!canvas) {
        canvas = document.getElementById('stackedCanvasFishing');
    }
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    // Make canvas responsive to container width
    var container = canvas.parentElement;
    if (!container) return;
    var containerWidth = container.clientWidth;
    var width = containerWidth || 1000; // Fallback to default width
    var height = width * 0.6; // Aspect ratio adjusted for larger display (60% height)
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Calculate spacing for labels around the chart
    var sidePadding = 80; // Space needed on left/right for time labels
    var topPadding = 70; // Space needed at top for time labels
    var bottomPadding = 20; // Small space at bottom
    
    // Calculate center position and maximum radius
    var cx = width / 2;
    var cy = height - bottomPadding; // Position near bottom with small margin
    
    // Maximum radius is constrained by available space
    var maxRadiusVertical = cy - topPadding;
    var maxRadiusHorizontal = cx - sidePadding;
    var maxAllowedRadius = Math.min(maxRadiusVertical, maxRadiusHorizontal);
    
    // Calculate inner radius and layer height
    var innerRadius = maxAllowedRadius * 0.25; // Inner radius is 25% of max radius
    var maxHeight = maxAllowedRadius - innerRadius; // All data uses the full available range
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate angles (9 o'clock to 3 o'clock, going UP and over = PI to 2*PI, clockwise)
    var startAngle = Math.PI; // 9 o'clock (left side) - 7am
    var endAngle = 2 * Math.PI; // 3 o'clock (right side) - 7pm
    var angleRange = Math.PI; // semicircle going through the top
    
    // Create point arrays for stacked layers
    // Order: Temperature (base), Water, Wind, Cloud (top)
    var tempPoints = [];      // Base: temperature
    var waterPoints = [];     // Layer 2: temp + water
    var windPoints = [];      // Layer 3: temp + water + wind
    var cloudPoints = [];     // Layer 4: temp + water + wind + cloud
    
    // Inner boundary (same for all)
    var innerPoints = [];
    
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var t = i / (scores.length - 1);
        var angle = startAngle + t * angleRange; // add to go clockwise (left to right via top)
        
        // Normalize stacked values by dividing by the number of datasets
        // This ensures the total stacked value never exceeds 1.0
        // Count: temperature, water, wind, cloud = 4 datasets
        var datasets = [s.tempScore, s.waterScore, s.windScore, s.cloudCoverNormalized];
        var datasetCount = datasets.length;
        var normalizedTempScore = s.tempScore / datasetCount;
        var normalizedWaterScore = s.waterScore / datasetCount;
        var normalizedWindScore = s.windScore / datasetCount;
        var normalizedCloudScore = s.cloudCoverNormalized / datasetCount;
        
        // Stack the normalized scores on top of each other
        var tempHeight = normalizedTempScore * maxHeight;
        var waterHeight = normalizedWaterScore * maxHeight;
        var windHeight = normalizedWindScore * maxHeight;
        var cloudHeight = normalizedCloudScore * maxHeight;
        
        // Inner boundary
        innerPoints.push({ angle: angle, radius: innerRadius });
        
        // Layer 1: temperature only
        tempPoints.push({ angle: angle, radius: innerRadius + tempHeight });
        
        // Layer 2: temp + water
        waterPoints.push({ angle: angle, radius: innerRadius + tempHeight + waterHeight });
        
        // Layer 3: temp + water + wind
        windPoints.push({ angle: angle, radius: innerRadius + tempHeight + waterHeight + windHeight });
        
        // Layer 4: temp + water + wind + cloud
        cloudPoints.push({ angle: angle, radius: innerRadius + tempHeight + waterHeight + windHeight + cloudHeight });
    }
    
    // Create smooth curves for all boundaries
    var smoothTemp = createSmoothPath(tempPoints, 10);
    var smoothWater = createSmoothPath(waterPoints, 10);
    var smoothWind = createSmoothPath(windPoints, 10);
    var smoothCloud = createSmoothPath(cloudPoints, 10);
    var smoothInner = createSmoothPath(innerPoints, 10);
    
    // Draw precipitation droplets in background (for each hour segment)
    for (var i = 0; i < scores.length - 1; i++) {
        var s = scores[i];
        var precipIntensity = s.precipitation / 100;
        
        if (precipIntensity > 0) {
            var t1 = i / (scores.length - 1);
            var t2 = (i + 1) / (scores.length - 1);
            var angle1 = startAngle + t1 * angleRange;
            var angle2 = startAngle + t2 * angleRange;
            var midAngle = (angle1 + angle2) / 2;
            
            var numDroplets = Math.floor(precipIntensity * 12) + 2;
            
            for (var d = 0; d < numDroplets; d++) {
                var angleOffset = (Math.random() - 0.5) * (angle2 - angle1) * 0.8;
                var dropAngle = midAngle + angleOffset;
                var radiusPos = innerRadius + Math.random() * (maxAllowedRadius - innerRadius);
                
                var dropX = cx + Math.cos(dropAngle) * radiusPos;
                var dropY = cy + Math.sin(dropAngle) * radiusPos;
                
                var dropSize = 2 + precipIntensity * 3;
                var angleToCenter = Math.atan2(cy - dropY, cx - dropX);
                
                ctx.save();
                ctx.translate(dropX, dropY);
                ctx.rotate(angleToCenter);
                
                var alpha = 0.3 + precipIntensity * 0.3;
                ctx.fillStyle = 'rgba(121, 147, 232, ' + alpha + ')';
                drawDroplet(ctx, 0, 0, dropSize);
                
                ctx.restore();
            }
        }
    }
    
    // Draw base layer (temperature) - #F28C28
    ctx.fillStyle = 'rgba(242, 140, 40, 0.6)';
    ctx.beginPath();
    for (var i = 0; i < smoothTemp.length; i++) {
        var x = cx + Math.cos(smoothTemp[i].angle) * smoothTemp[i].radius;
        var y = cy + Math.sin(smoothTemp[i].angle) * smoothTemp[i].radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    for (var i = smoothInner.length - 1; i >= 0; i--) {
        var x = cx + Math.cos(smoothInner[i].angle) * smoothInner[i].radius;
        var y = cy + Math.sin(smoothInner[i].angle) * smoothInner[i].radius;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 100, 20, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw layer 2 (water temp) - #1F5FA8
    ctx.fillStyle = 'rgba(31, 95, 168, 0.6)';
    ctx.beginPath();
    for (var i = 0; i < smoothWater.length; i++) {
        var x = cx + Math.cos(smoothWater[i].angle) * smoothWater[i].radius;
        var y = cy + Math.sin(smoothWater[i].angle) * smoothWater[i].radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    for (var i = smoothTemp.length - 1; i >= 0; i--) {
        var x = cx + Math.cos(smoothTemp[i].angle) * smoothTemp[i].radius;
        var y = cy + Math.sin(smoothTemp[i].angle) * smoothTemp[i].radius;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 50, 120, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw layer 3 (wind) - #32dbae
    ctx.fillStyle = 'rgba(50, 219, 174, 0.6)';
    ctx.beginPath();
    for (var i = 0; i < smoothWind.length; i++) {
        var x = cx + Math.cos(smoothWind[i].angle) * smoothWind[i].radius;
        var y = cy + Math.sin(smoothWind[i].angle) * smoothWind[i].radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    for (var i = smoothWater.length - 1; i >= 0; i--) {
        var x = cx + Math.cos(smoothWater[i].angle) * smoothWater[i].radius;
        var y = cy + Math.sin(smoothWater[i].angle) * smoothWater[i].radius;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(20, 150, 120, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw top layer (cloud cover) - #c1cad9
    ctx.fillStyle = 'rgba(193, 202, 217, 0.6)';
    ctx.beginPath();
    for (var i = 0; i < smoothCloud.length; i++) {
        var x = cx + Math.cos(smoothCloud[i].angle) * smoothCloud[i].radius;
        var y = cy + Math.sin(smoothCloud[i].angle) * smoothCloud[i].radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    for (var i = smoothWind.length - 1; i >= 0; i--) {
        var x = cx + Math.cos(smoothWind[i].angle) * smoothWind[i].radius;
        var y = cy + Math.sin(smoothWind[i].angle) * smoothWind[i].radius;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 150, 170, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw the inner boundary circle
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < smoothInner.length; i++) {
        var x = cx + Math.cos(smoothInner[i].angle) * smoothInner[i].radius;
        var y = cy + Math.sin(smoothInner[i].angle) * smoothInner[i].radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Draw time labels and markers
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var t = i / (scores.length - 1);
        var angle = startAngle + t * angleRange;
        
        // Find the outermost radius for this angle (top of stack)
        var maxRadius = cloudPoints[i].radius;
        
        // Draw radial line from inner to outer
        ctx.strokeStyle = 'rgba(200,200,200,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
        ctx.lineTo(cx + Math.cos(angle) * (maxRadius + 20), cy + Math.sin(angle) * (maxRadius + 20));
        ctx.stroke();
        
        // Time labels - positioned outside the chart
        var labelDist = maxAllowedRadius + 50;
        var x = cx + Math.cos(angle) * labelDist;
        var y = cy + Math.sin(angle) * labelDist;
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatTime(s.hour), x, y);
    }
    
    // Render the timeline below the chart
    var timelineElement = document.getElementById('timeline3');
    if (!timelineElement) timelineElement = document.getElementById('timelineFishing1');
    if (timelineElement) {
        renderTimeline(scores, timelineElement.id);
    }
}

function drawHourlyRatingChart(scores) {
    var canvas = document.getElementById('hourlyRatingCanvas');
    if (!canvas) {
        canvas = document.getElementById('hourlyRatingCanvasFishing');
    }
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    // Make canvas responsive to container width
    var container = canvas.parentElement;
    if (!container) return;
    var containerWidth = container.clientWidth;
    var width = containerWidth || 1000;
    var height = width * 0.6;
    
    canvas.width = width;
    canvas.height = height;
    
    var sidePadding = 80;
    var topPadding = 70;
    var bottomPadding = 20;
    
    var cx = width / 2;
    var cy = height - bottomPadding;
    
    var maxRadiusVertical = cy - topPadding;
    var maxRadiusHorizontal = cx - sidePadding;
    var maxAllowedRadius = Math.min(maxRadiusVertical, maxRadiusHorizontal);
    
    var innerRadius = maxAllowedRadius * 0.25;
    var maxHeight = maxAllowedRadius - innerRadius;
    
    ctx.clearRect(0, 0, width, height);
    
    var startAngle = Math.PI;
    var angleRange = Math.PI;
    
    // Create point arrays for the normalized rating
    var ratingPoints = [];
    var innerPoints = [];
    
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var t = i / (scores.length - 1);
        var angle = startAngle + t * angleRange;
        
        var ratingHeight = s.normalizedRating * maxHeight;
        
        innerPoints.push({ angle: angle, radius: innerRadius });
        ratingPoints.push({ angle: angle, radius: innerRadius + ratingHeight });
    }
    
    var smoothRating = createSmoothPath(ratingPoints, 10);
    var smoothInner = createSmoothPath(innerPoints, 10);
    
    // Draw rating area with gradient
    var gradient = ctx.createLinearGradient(0, cy - maxAllowedRadius, 0, cy);
    gradient.addColorStop(0, 'rgba(118, 75, 162, 0.8)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.6)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    for (var i = 0; i < smoothRating.length; i++) {
        var x = cx + Math.cos(smoothRating[i].angle) * smoothRating[i].radius;
        var y = cy + Math.sin(smoothRating[i].angle) * smoothRating[i].radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    for (var i = smoothInner.length - 1; i >= 0; i--) {
        var x = cx + Math.cos(smoothInner[i].angle) * smoothInner[i].radius;
        var y = cy + Math.sin(smoothInner[i].angle) * smoothInner[i].radius;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(102, 126, 234, 1.0)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw the inner boundary circle
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < smoothInner.length; i++) {
        var x = cx + Math.cos(smoothInner[i].angle) * smoothInner[i].radius;
        var y = cy + Math.sin(smoothInner[i].angle) * smoothInner[i].radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Draw time labels and markers
    for (var i = 0; i < scores.length; i++) {
        var s = scores[i];
        var t = i / (scores.length - 1);
        var angle = startAngle + t * angleRange;
        
        var maxRadius = ratingPoints[i].radius;
        
        ctx.strokeStyle = 'rgba(200,200,200,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
        ctx.lineTo(cx + Math.cos(angle) * (maxRadius + 20), cy + Math.sin(angle) * (maxRadius + 20));
        ctx.stroke();
        
        var labelDist = maxAllowedRadius + 50;
        var x = cx + Math.cos(angle) * labelDist;
        var y = cy + Math.sin(angle) * labelDist;
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatTime(s.hour), x, y);
        
        var dataDist = maxAllowedRadius + 90;
        var dx = cx + Math.cos(angle) * dataDist;
        var dy = cy + Math.sin(angle) * dataDist;
        
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#667eea';
        ctx.fillText((s.normalizedRating * 100).toFixed(0) + '%', dx, dy);
    }
}

function drawWeeklyOverviewChart() {
    var canvas = document.getElementById('weeklyOverviewCanvas');
    if (!canvas) {
        canvas = document.getElementById('weeklyOverviewCanvasFishing');
    }
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    var container = canvas.parentElement;
    if (!container) return;
    var containerWidth = container.clientWidth;
    var width = containerWidth || 1000;
    var height = width * 0.5;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    var weeklyRatings = calculateWeeklyRatings();
    if (weeklyRatings.length === 0) return;
    
    var padding = 80;
    var chartWidth = width - 2 * padding;
    var chartHeight = height - 2 * padding;
    
    var barWidth = chartWidth / weeklyRatings.length;
    var barSpacing = barWidth * 0.2;
    var actualBarWidth = barWidth - barSpacing;
    
    // Draw bars
    for (var i = 0; i < weeklyRatings.length; i++) {
        var rating = weeklyRatings[i];
        var barHeight = rating.rating * chartHeight;
        var x = padding + i * barWidth + barSpacing / 2;
        var y = height - padding - barHeight;
        
        // Gradient for each bar
        var gradient = ctx.createLinearGradient(x, y, x, height - padding);
        gradient.addColorStop(0, 'rgba(118, 75, 162, 0.9)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.7)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
        
        ctx.strokeStyle = 'rgba(102, 126, 234, 1.0)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, actualBarWidth, barHeight);
        
        // Draw date label
        var dateObj = new Date(rating.date + 'T00:00:00');
        var dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dateLabel, x + actualBarWidth / 2, height - padding + 20);
        
        // Draw rating percentage on top of bar
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText((rating.rating * 100).toFixed(0) + '%', x + actualBarWidth / 2, y - 10);
    }
    
    // Draw baseline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Daily Beach Rating', width / 2, height - 10);
}

function updateChart() {
    if (weatherData.length > 0 && weatherData[currentDay]) {
        var scores = calculateDayScores(weatherData[currentDay]);
        drawRadialSpline(scores);
        drawOverlaidChart(scores);
        drawStackedChart(scores);
        drawHourlyRatingChart(scores);
        updateDateDisplay();
    }
}

var globalDaySelector = document.getElementById('globalDaySelector');
if (!globalDaySelector) {
    globalDaySelector = document.getElementById('globalDaySelectorFishing');
}
if (globalDaySelector) {
    globalDaySelector.addEventListener('click', function(e) {
        // Use closest() to handle clicks on button or any child elements
        var button = e.target.closest('.day-btn');
        if (button && button.hasAttribute('data-day')) { // Only handle day selector buttons
            var selectorId = this.id;
            var buttons = document.querySelectorAll('#' + selectorId + ' .day-btn[data-day]');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('active');
            }
            button.classList.add('active');
            currentDay = parseInt(button.getAttribute('data-day'));
            
            // Switch to daily view if coming from weekly view
            if (viewMode === 'weekly') {
                switchToDailyView();
            }
            updateChart();
        }
    });
}

// Weekly overview button handler
var weeklyOverviewBtn = document.getElementById('weeklyOverviewBtn');
if (!weeklyOverviewBtn) {
    weeklyOverviewBtn = document.getElementById('weeklyOverviewBtnFishing');
}
if (weeklyOverviewBtn) {
    weeklyOverviewBtn.addEventListener('click', function() {
        switchToWeeklyView();
    });
}

function switchToDailyView() {
    viewMode = 'daily';
    var chartTabMenu = document.getElementById('chartTabMenu') || document.getElementById('chartTabMenuFishing');
    var weeklyOverviewChart = document.getElementById('weeklyOverviewChart') || document.getElementById('weeklyOverviewChartFishing');
    var weeklyBtn = document.getElementById('weeklyOverviewBtn') || document.getElementById('weeklyOverviewBtnFishing');
    
    if (chartTabMenu) chartTabMenu.style.display = 'flex';
    if (weeklyOverviewChart) weeklyOverviewChart.classList.remove('active');
    if (weeklyBtn) weeklyBtn.classList.remove('active');
    
    // Show the currently selected chart tab
    var activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
        var chartType = activeTabBtn.getAttribute('data-chart');
        var chartId;
        if (chartType === 'separated') {
            chartId = 'separatedChart';
        } else if (chartType === 'overlaid') {
            chartId = 'overlaidChart';
        } else if (chartType === 'stacked') {
            chartId = 'stackedChart';
        } else if (chartType === 'hourlyRating') {
            chartId = 'hourlyRatingChart';
        }
        
        if (chartId) {
            var chart = document.getElementById(chartId) || document.getElementById(chartId + 'Fishing');
            if (chart) chart.classList.add('active');
        }
    }
}

function switchToWeeklyView() {
    viewMode = 'weekly';
    var chartTabMenu = document.getElementById('chartTabMenu') || document.getElementById('chartTabMenuFishing');
    if (chartTabMenu) chartTabMenu.style.display = 'none';
    
    // Hide all daily charts
    var chartContainers = document.querySelectorAll('.chart-container');
    for (var i = 0; i < chartContainers.length; i++) {
        chartContainers[i].classList.remove('active');
    }
    
    // Show weekly overview chart
    var weeklyOverviewChart = document.getElementById('weeklyOverviewChart') || document.getElementById('weeklyOverviewChartFishing');
    var weeklyBtn = document.getElementById('weeklyOverviewBtn') || document.getElementById('weeklyOverviewBtnFishing');
    
    if (weeklyOverviewChart) weeklyOverviewChart.classList.add('active');
    if (weeklyBtn) weeklyBtn.classList.add('active');
    
    // Remove active state from day selector buttons
    var globalDaySelector = document.getElementById('globalDaySelector') || document.getElementById('globalDaySelectorFishing');
    if (globalDaySelector) {
        var dayButtons = globalDaySelector.querySelectorAll('.day-btn');
        for (var i = 0; i < dayButtons.length; i++) {
            dayButtons[i].classList.remove('active');
        }
    }
    
    drawWeeklyOverviewChart();
}

// Tab menu event listener
var tabMenu = document.querySelector('.tab-menu');
if (tabMenu) {
    tabMenu.addEventListener('click', function(e) {
        var button = e.target.closest('.tab-btn');
    if (button) {
        // Update tab buttons
        var tabButtons = document.querySelectorAll('.tab-btn');
        for (var i = 0; i < tabButtons.length; i++) {
            tabButtons[i].classList.remove('active');
        }
        button.classList.add('active');
        
        // Update chart visibility
        var chartType = button.getAttribute('data-chart');
        var chartContainers = document.querySelectorAll('.chart-container');
        for (var i = 0; i < chartContainers.length; i++) {
            chartContainers[i].classList.remove('active');
        }
        
        // Show the selected chart (check for both beach and fishing IDs)
        var chartId;
        if (chartType === 'separated') {
            chartId = 'separatedChart';
        } else if (chartType === 'overlaid') {
            chartId = 'overlaidChart';
        } else if (chartType === 'stacked') {
            chartId = 'stackedChart';
        } else if (chartType === 'hourlyRating') {
            chartId = 'hourlyRatingChart';
        }
        
        if (chartId) {
            var chart = document.getElementById(chartId) || document.getElementById(chartId + 'Fishing');
            if (chart) chart.classList.add('active');
        }
    }
    });
}

// Weight slider functionality
function updateWeightDisplay(sliderId, valueId, weightKey) {
    var slider = document.getElementById(sliderId);
    var valueDisplay = document.getElementById(valueId);
    
    if (!slider || !valueDisplay) return;
    
    slider.addEventListener('input', function() {
        var value = parseFloat(this.value);
        valueDisplay.textContent = value.toFixed(1);
        ratingWeights[weightKey] = value;
        updateChart();
    });
}

function initializeWeightSliders() {
    updateWeightDisplay('tempWeight', 'tempWeightValue', 'temperature');
    updateWeightDisplay('waterWeight', 'waterWeightValue', 'water');
    updateWeightDisplay('windWeight', 'windWeightValue', 'wind');
    updateWeightDisplay('cloudWeight', 'cloudWeightValue', 'cloud');
    updateWeightDisplay('precipWeight', 'precipWeightValue', 'precipitation');
    
    // Load saved weights from localStorage if available
    loadWeightsFromStorage();
}

// Range slider functionality
function updateRangeSlider(sliderId, valueId, rangeKey, subKey, unit) {
    var slider = document.getElementById(sliderId);
    var valueDisplay = document.getElementById(valueId);
    
    if (!slider || !valueDisplay) return;
    
    slider.addEventListener('input', function() {
        var value = parseFloat(this.value);
        valueDisplay.textContent = value + unit;
        idealRanges[rangeKey][subKey] = value;
        updateChart();
    });
}

function initializeRangeSliders() {
    // Temperature sliders (original ones in Hourly Rating)
    updateRangeSlider('tempMinRange', 'tempMinValue', 'temperature', 'min', '°C');
    updateRangeSlider('tempIdealMinRange', 'tempIdealMinValue', 'temperature', 'idealMin', '°C');
    updateRangeSlider('tempIdealMaxRange', 'tempIdealMaxValue', 'temperature', 'idealMax', '°C');
    updateRangeSlider('tempMaxRange', 'tempMaxValue', 'temperature', 'max', '°C');
    
    // Temperature sliders (shared ones in other charts)
    updateRangeSlider('tempMinRangeShared', 'tempMinValueShared', 'temperature', 'min', '°C');
    updateRangeSlider('tempIdealMinRangeShared', 'tempIdealMinValueShared', 'temperature', 'idealMin', '°C');
    updateRangeSlider('tempIdealMaxRangeShared', 'tempIdealMaxValueShared', 'temperature', 'idealMax', '°C');
    updateRangeSlider('tempMaxRangeShared', 'tempMaxValueShared', 'temperature', 'max', '°C');
    
    // Water temperature sliders (original)
    updateRangeSlider('waterMinRange', 'waterMinValue', 'water', 'min', '°C');
    updateRangeSlider('waterIdealMinRange', 'waterIdealMinValue', 'water', 'idealMin', '°C');
    updateRangeSlider('waterIdealMaxRange', 'waterIdealMaxValue', 'water', 'idealMax', '°C');
    updateRangeSlider('waterMaxRange', 'waterMaxValue', 'water', 'max', '°C');
    
    // Water temperature sliders (shared)
    updateRangeSlider('waterMinRangeShared', 'waterMinValueShared', 'water', 'min', '°C');
    updateRangeSlider('waterIdealMinRangeShared', 'waterIdealMinValueShared', 'water', 'idealMin', '°C');
    updateRangeSlider('waterIdealMaxRangeShared', 'waterIdealMaxValueShared', 'water', 'idealMax', '°C');
    updateRangeSlider('waterMaxRangeShared', 'waterMaxValueShared', 'water', 'max', '°C');
    
    // Wind speed sliders (original)
    updateRangeSlider('windMinRange', 'windMinValue', 'wind', 'min', ' km/h');
    updateRangeSlider('windIdealMinRange', 'windIdealMinValue', 'wind', 'idealMin', ' km/h');
    updateRangeSlider('windIdealMaxRange', 'windIdealMaxValue', 'wind', 'idealMax', ' km/h');
    updateRangeSlider('windMaxRange', 'windMaxValue', 'wind', 'max', ' km/h');
    
    // Wind speed sliders (shared)
    updateRangeSlider('windMinRangeShared', 'windMinValueShared', 'wind', 'min', ' km/h');
    updateRangeSlider('windIdealMinRangeShared', 'windIdealMinValueShared', 'wind', 'idealMin', ' km/h');
    updateRangeSlider('windIdealMaxRangeShared', 'windIdealMaxValueShared', 'wind', 'idealMax', ' km/h');
    updateRangeSlider('windMaxRangeShared', 'windMaxValueShared', 'wind', 'max', ' km/h');
    
    // Cloud cover sliders (original)
    updateRangeSlider('cloudMinRange', 'cloudMinValue', 'cloud', 'min', '%');
    updateRangeSlider('cloudMaxRange', 'cloudMaxValue', 'cloud', 'max', '%');
    
    // Cloud cover sliders (shared)
    updateRangeSlider('cloudMinRangeShared', 'cloudMinValueShared', 'cloud', 'min', '%');
    updateRangeSlider('cloudMaxRangeShared', 'cloudMaxValueShared', 'cloud', 'max', '%');
    
    // Precipitation sliders (original)
    updateRangeSlider('precipMinRange', 'precipMinValue', 'precipitation', 'min', '%');
    updateRangeSlider('precipMaxRange', 'precipMaxValue', 'precipitation', 'max', '%');
    
    // Precipitation sliders (shared)
    updateRangeSlider('precipMinRangeShared', 'precipMinValueShared', 'precipitation', 'min', '%');
    updateRangeSlider('precipMaxRangeShared', 'precipMaxValueShared', 'precipitation', 'max', '%');
    
    // Load saved ranges from localStorage if available
    loadRangesFromStorage();
}

function saveWeightsToJSON() {
    var settingsData = {
        weights: ratingWeights,
        ranges: idealRanges
    };
    var settingsJSON = JSON.stringify(settingsData, null, 2);
    
    // Create a blob and download link
    var blob = new Blob([settingsJSON], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'beach-rating-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Also save to localStorage
    localStorage.setItem('beachRatingWeights', JSON.stringify(ratingWeights));
    localStorage.setItem('beachIdealRanges', JSON.stringify(idealRanges));
    
    alert('Settings saved successfully! 📥\nDownloaded as JSON file and saved to browser storage.');
}

// Helper function to validate weight values
function validateWeights(weights) {
    var requiredFields = ['temperature', 'water', 'wind', 'cloud', 'precipitation'];
    
    // Check if weights is an object
    if (!weights || typeof weights !== 'object') {
        return { valid: false, error: 'Weights must be an object' };
    }
    
    // Check if all required fields exist
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        if (weights[field] === undefined || weights[field] === null) {
            return { valid: false, error: 'Missing or null field: ' + field };
        }
        
        // Validate type and range
        if (typeof weights[field] !== 'number' || isNaN(weights[field]) || !isFinite(weights[field])) {
            return { valid: false, error: field + ' must be a valid number' };
        }
        
        if (weights[field] < 0 || weights[field] > 2) {
            return { valid: false, error: field + ' must be between 0 and 2' };
        }
    }
    
    return { valid: true };
}

// Helper function to update slider UI
function updateSlidersUI(weights) {
    var tempWeight = document.getElementById('tempWeight');
    var tempWeightValue = document.getElementById('tempWeightValue');
    var waterWeight = document.getElementById('waterWeight');
    var waterWeightValue = document.getElementById('waterWeightValue');
    var windWeight = document.getElementById('windWeight');
    var windWeightValue = document.getElementById('windWeightValue');
    var cloudWeight = document.getElementById('cloudWeight');
    var cloudWeightValue = document.getElementById('cloudWeightValue');
    var precipWeight = document.getElementById('precipWeight');
    var precipWeightValue = document.getElementById('precipWeightValue');
    
    if (tempWeight) tempWeight.value = weights.temperature;
    if (tempWeightValue) tempWeightValue.textContent = weights.temperature.toFixed(1);
    if (waterWeight) waterWeight.value = weights.water;
    if (waterWeightValue) waterWeightValue.textContent = weights.water.toFixed(1);
    if (windWeight) windWeight.value = weights.wind;
    if (windWeightValue) windWeightValue.textContent = weights.wind.toFixed(1);
    if (cloudWeight) cloudWeight.value = weights.cloud;
    if (cloudWeightValue) cloudWeightValue.textContent = weights.cloud.toFixed(1);
    if (precipWeight) precipWeight.value = weights.precipitation;
    if (precipWeightValue) precipWeightValue.textContent = weights.precipitation.toFixed(1);
}

// Helper function to apply weights
function applyWeights(weights) {
    ratingWeights.temperature = weights.temperature;
    ratingWeights.water = weights.water;
    ratingWeights.wind = weights.wind;
    ratingWeights.cloud = weights.cloud;
    ratingWeights.precipitation = weights.precipitation;
}

// Helper function to validate ranges
function validateRanges(ranges) {
    if (!ranges || typeof ranges !== 'object') {
        return { valid: false, error: 'Ranges must be an object' };
    }
    
    // Validate temperature ranges
    if (!ranges.temperature || typeof ranges.temperature !== 'object') {
        return { valid: false, error: 'Temperature ranges missing' };
    }
    var temp = ranges.temperature;
    if (typeof temp.min !== 'number' || typeof temp.idealMin !== 'number' || 
        typeof temp.idealMax !== 'number' || typeof temp.max !== 'number') {
        return { valid: false, error: 'Temperature range values must be numbers' };
    }
    if (temp.min > temp.idealMin || temp.idealMin > temp.idealMax || temp.idealMax > temp.max) {
        return { valid: false, error: 'Temperature ranges must be in order: min <= idealMin <= idealMax <= max' };
    }
    
    // Validate water ranges
    if (!ranges.water || typeof ranges.water !== 'object') {
        return { valid: false, error: 'Water ranges missing' };
    }
    var water = ranges.water;
    if (typeof water.min !== 'number' || typeof water.idealMin !== 'number' || 
        typeof water.idealMax !== 'number' || typeof water.max !== 'number') {
        return { valid: false, error: 'Water range values must be numbers' };
    }
    if (water.min > water.idealMin || water.idealMin > water.idealMax || water.idealMax > water.max) {
        return { valid: false, error: 'Water ranges must be in order: min <= idealMin <= idealMax <= max' };
    }
    
    // Validate wind ranges
    if (!ranges.wind || typeof ranges.wind !== 'object') {
        return { valid: false, error: 'Wind ranges missing' };
    }
    var wind = ranges.wind;
    if (typeof wind.min !== 'number' || typeof wind.idealMin !== 'number' || 
        typeof wind.idealMax !== 'number' || typeof wind.max !== 'number') {
        return { valid: false, error: 'Wind range values must be numbers' };
    }
    if (wind.min > wind.idealMin || wind.idealMin > wind.idealMax || wind.idealMax > wind.max) {
        return { valid: false, error: 'Wind ranges must be in order: min <= idealMin <= idealMax <= max' };
    }
    
    // Validate cloud ranges
    if (!ranges.cloud || typeof ranges.cloud !== 'object') {
        return { valid: false, error: 'Cloud ranges missing' };
    }
    if (typeof ranges.cloud.min !== 'number' || typeof ranges.cloud.max !== 'number') {
        return { valid: false, error: 'Cloud range values must be numbers' };
    }
    
    // Validate precipitation ranges
    if (!ranges.precipitation || typeof ranges.precipitation !== 'object') {
        return { valid: false, error: 'Precipitation ranges missing' };
    }
    if (typeof ranges.precipitation.min !== 'number' || typeof ranges.precipitation.max !== 'number') {
        return { valid: false, error: 'Precipitation range values must be numbers' };
    }
    
    return { valid: true };
}

// Helper function to update range sliders UI
function updateRangeSlidersUI(ranges) {
    // Temperature
    var tempMinRange = document.getElementById('tempMinRange');
    var tempMinValue = document.getElementById('tempMinValue');
    var tempIdealMinRange = document.getElementById('tempIdealMinRange');
    var tempIdealMinValue = document.getElementById('tempIdealMinValue');
    var tempIdealMaxRange = document.getElementById('tempIdealMaxRange');
    var tempIdealMaxValue = document.getElementById('tempIdealMaxValue');
    var tempMaxRange = document.getElementById('tempMaxRange');
    var tempMaxValue = document.getElementById('tempMaxValue');
    
    if (tempMinRange) tempMinRange.value = ranges.temperature.min;
    if (tempMinValue) tempMinValue.textContent = ranges.temperature.min + '°C';
    if (tempIdealMinRange) tempIdealMinRange.value = ranges.temperature.idealMin;
    if (tempIdealMinValue) tempIdealMinValue.textContent = ranges.temperature.idealMin + '°C';
    if (tempIdealMaxRange) tempIdealMaxRange.value = ranges.temperature.idealMax;
    if (tempIdealMaxValue) tempIdealMaxValue.textContent = ranges.temperature.idealMax + '°C';
    if (tempMaxRange) tempMaxRange.value = ranges.temperature.max;
    if (tempMaxValue) tempMaxValue.textContent = ranges.temperature.max + '°C';
    
    // Water
    var waterMinRange = document.getElementById('waterMinRange');
    var waterMinValue = document.getElementById('waterMinValue');
    var waterIdealMinRange = document.getElementById('waterIdealMinRange');
    var waterIdealMinValue = document.getElementById('waterIdealMinValue');
    var waterIdealMaxRange = document.getElementById('waterIdealMaxRange');
    var waterIdealMaxValue = document.getElementById('waterIdealMaxValue');
    var waterMaxRange = document.getElementById('waterMaxRange');
    var waterMaxValue = document.getElementById('waterMaxValue');
    
    if (waterMinRange) waterMinRange.value = ranges.water.min;
    if (waterMinValue) waterMinValue.textContent = ranges.water.min + '°C';
    if (waterIdealMinRange) waterIdealMinRange.value = ranges.water.idealMin;
    if (waterIdealMinValue) waterIdealMinValue.textContent = ranges.water.idealMin + '°C';
    if (waterIdealMaxRange) waterIdealMaxRange.value = ranges.water.idealMax;
    if (waterIdealMaxValue) waterIdealMaxValue.textContent = ranges.water.idealMax + '°C';
    if (waterMaxRange) waterMaxRange.value = ranges.water.max;
    if (waterMaxValue) waterMaxValue.textContent = ranges.water.max + '°C';
    
    // Wind
    var windMinRange = document.getElementById('windMinRange');
    var windMinValue = document.getElementById('windMinValue');
    var windIdealMinRange = document.getElementById('windIdealMinRange');
    var windIdealMinValue = document.getElementById('windIdealMinValue');
    var windIdealMaxRange = document.getElementById('windIdealMaxRange');
    var windIdealMaxValue = document.getElementById('windIdealMaxValue');
    var windMaxRange = document.getElementById('windMaxRange');
    var windMaxValue = document.getElementById('windMaxValue');
    
    if (windMinRange) windMinRange.value = ranges.wind.min;
    if (windMinValue) windMinValue.textContent = ranges.wind.min + ' km/h';
    if (windIdealMinRange) windIdealMinRange.value = ranges.wind.idealMin;
    if (windIdealMinValue) windIdealMinValue.textContent = ranges.wind.idealMin + ' km/h';
    if (windIdealMaxRange) windIdealMaxRange.value = ranges.wind.idealMax;
    if (windIdealMaxValue) windIdealMaxValue.textContent = ranges.wind.idealMax + ' km/h';
    if (windMaxRange) windMaxRange.value = ranges.wind.max;
    if (windMaxValue) windMaxValue.textContent = ranges.wind.max + ' km/h';
    
    // Cloud
    var cloudMinRange = document.getElementById('cloudMinRange');
    var cloudMinValue = document.getElementById('cloudMinValue');
    var cloudMaxRange = document.getElementById('cloudMaxRange');
    var cloudMaxValue = document.getElementById('cloudMaxValue');
    
    if (cloudMinRange) cloudMinRange.value = ranges.cloud.min;
    if (cloudMinValue) cloudMinValue.textContent = ranges.cloud.min + '%';
    if (cloudMaxRange) cloudMaxRange.value = ranges.cloud.max;
    if (cloudMaxValue) cloudMaxValue.textContent = ranges.cloud.max + '%';
    
    // Precipitation
    var precipMinRange = document.getElementById('precipMinRange');
    var precipMinValue = document.getElementById('precipMinValue');
    var precipMaxRange = document.getElementById('precipMaxRange');
    var precipMaxValue = document.getElementById('precipMaxValue');
    
    if (precipMinRange) precipMinRange.value = ranges.precipitation.min;
    if (precipMinValue) precipMinValue.textContent = ranges.precipitation.min + '%';
    if (precipMaxRange) precipMaxRange.value = ranges.precipitation.max;
    if (precipMaxValue) precipMaxValue.textContent = ranges.precipitation.max + '%';
}

// Helper function to apply ranges
function applyRanges(ranges) {
    idealRanges.temperature = Object.assign({}, ranges.temperature);
    idealRanges.water = Object.assign({}, ranges.water);
    idealRanges.wind = Object.assign({}, ranges.wind);
    idealRanges.cloud = Object.assign({}, ranges.cloud);
    idealRanges.precipitation = Object.assign({}, ranges.precipitation);
}

function loadWeightsFromJSON() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    
    input.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        
        // Validate file extension
        var fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.json')) {
            alert('Invalid file type. Please select a JSON file.');
            return;
        }
        
        // Validate file size (limit to 1MB)
        var maxSize = 1024 * 1024; // 1MB
        if (file.size > maxSize) {
            alert('File is too large. Maximum size is 1MB.');
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function(event) {
            try {
                var data = JSON.parse(event.target.result);
                
                // Check if it's the new format (with weights and ranges) or old format (just weights)
                var weights, ranges;
                if (data.weights && data.ranges) {
                    // New format
                    weights = data.weights;
                    ranges = data.ranges;
                } else {
                    // Old format (just weights)
                    weights = data;
                    ranges = null;
                }
                
                // Validate the loaded weights
                var validation = validateWeights(weights);
                if (!validation.valid) {
                    alert('Invalid settings file: ' + validation.error);
                    return;
                }
                
                // Apply the weights
                applyWeights(weights);
                updateSlidersUI(weights);
                
                // If ranges are provided, validate and apply them
                if (ranges) {
                    var rangeValidation = validateRanges(ranges);
                    if (!rangeValidation.valid) {
                        alert('Invalid ranges in file: ' + rangeValidation.error);
                        return;
                    }
                    applyRanges(ranges);
                    updateRangeSlidersUI(ranges);
                    localStorage.setItem('beachIdealRanges', JSON.stringify(idealRanges));
                }
                
                // Save to localStorage
                localStorage.setItem('beachRatingWeights', JSON.stringify(ratingWeights));
                
                // Update the chart
                updateChart();
                
                alert('Settings loaded successfully! 📂');
            } catch (error) {
                alert('Error loading settings file: ' + error.message);
            }
        };
        reader.readAsText(file);
    });
    
    input.click();
}

function loadWeightsFromStorage() {
    var stored = localStorage.getItem('beachRatingWeights');
    if (stored) {
        try {
            var weights = JSON.parse(stored);
            
            // Validate the stored weights
            var validation = validateWeights(weights);
            if (!validation.valid) {
                console.error('Invalid stored weights:', validation.error);
                return;
            }
            
            // Apply the weights
            applyWeights(weights);
            
            // Update the UI sliders
            updateSlidersUI(weights);
        } catch (error) {
            console.error('Error loading weights from storage:', error);
        }
    }
}

function loadRangesFromStorage() {
    var stored = localStorage.getItem('beachIdealRanges');
    if (stored) {
        try {
            var ranges = JSON.parse(stored);
            
            // Validate the stored ranges
            var validation = validateRanges(ranges);
            if (!validation.valid) {
                console.error('Invalid stored ranges:', validation.error);
                return;
            }
            
            // Apply the ranges
            applyRanges(ranges);
            
            // Update the UI sliders
            updateRangeSlidersUI(ranges);
        } catch (error) {
            console.error('Error loading ranges from storage:', error);
        }
    }
}

function resetWeights() {
    // Load defaults from JSON file
    fetch('data/beach-rating-settings.json')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Could not load default settings file');
            }
            return response.json();
        })
        .then(function(data) {
            if (!data || !data.weights || !data.ranges) {
                throw new Error('Invalid settings file format');
            }
            
            // Apply the default weights and ranges
            applyWeights(data.weights);
            applyRanges(data.ranges);
            
            // Update the UI sliders
            updateSlidersUI(data.weights);
            updateRangeSlidersUI(data.ranges);
            
            // Remove from localStorage
            localStorage.removeItem('beachRatingWeights');
            localStorage.removeItem('beachIdealRanges');
            
            // Update the chart
            updateChart();
            
            alert('Settings reset to default values! ↺');
        })
        .catch(function(error) {
            console.error('Error resetting to defaults:', error);
            // Fallback to hardcoded defaults
            var defaultWeights = {
                temperature: 1.5,
                water: 0.4,
                wind: 0.6,
                cloud: 0.5,
                precipitation: 1.4
            };
            
            var defaultRanges = {
                temperature: {
                    min: 22,
                    idealMin: 25,
                    idealMax: 36,
                    max: 40
                },
                water: {
                    min: 19,
                    idealMin: 20,
                    idealMax: 25,
                    max: 35
                },
                wind: {
                    min: 0,
                    idealMin: 0,
                    idealMax: 19,
                    max: 30
                },
                cloud: {
                    min: 0,
                    max: 100
                },
                precipitation: {
                    min: 0,
                    max: 100
                }
            };
            
            applyWeights(defaultWeights);
            applyRanges(defaultRanges);
            updateSlidersUI(defaultWeights);
            updateRangeSlidersUI(defaultRanges);
            localStorage.removeItem('beachRatingWeights');
            localStorage.removeItem('beachIdealRanges');
            updateChart();
            
            alert('Settings reset to default values (using fallback)! ↺');
        });
}

// Initialize weight and range sliders when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeWeightSliders();
    initializeRangeSliders();
    
    // Attach event listeners to buttons (only if they exist)
    var saveWeightsBtn = document.getElementById('saveWeightsBtn');
    if (saveWeightsBtn) {
        saveWeightsBtn.addEventListener('click', saveWeightsToJSON);
    }
    
    var loadWeightsBtn = document.getElementById('loadWeightsBtn');
    if (loadWeightsBtn) {
        loadWeightsBtn.addEventListener('click', loadWeightsFromJSON);
    }
    
    var resetWeightsBtn = document.getElementById('resetWeightsBtn');
    if (resetWeightsBtn) {
        resetWeightsBtn.addEventListener('click', resetWeights);
    }
});

// Load default settings from JSON file
function loadDefaultSettings() {
    fetch('data/beach-rating-settings.json')
        .then(function(response) {
            if (!response.ok) {
                console.warn('Could not load default settings file, using hardcoded defaults');
                return null;
            }
            return response.json();
        })
        .then(function(data) {
            if (data && data.weights && data.ranges) {
                // Validate the loaded weights
                var weightValidation = validateWeights(data.weights);
                if (!weightValidation.valid) {
                    console.error('Invalid weights in settings file:', weightValidation.error);
                    return;
                }
                
                // Validate the loaded ranges
                var rangeValidation = validateRanges(data.ranges);
                if (!rangeValidation.valid) {
                    console.error('Invalid ranges in settings file:', rangeValidation.error);
                    return;
                }
                
                // Apply validated weights and ranges using helper functions
                applyWeights(data.weights);
                applyRanges(data.ranges);
                
                console.log('Default settings loaded from data/beach-rating-settings.json');
            }
        })
        .catch(function(error) {
            console.warn('Error loading default settings:', error);
        });
}

// Initialize by loading settings and fetching weather data
loadDefaultSettings();
updateLocationTitles(); // Set initial location name in titles
fetchWeatherData();

var resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateChart, 250);
});

