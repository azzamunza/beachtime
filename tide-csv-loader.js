/**
 * Tide CSV Data Loader for Fishing Page
 * Loads tide data from the BOM-extracted CSV file
 */

// Global tide data storage
var tideCSVData = [];
var tideDataByLocation = {};

/**
 * Load tide data from CSV file
 */
function loadTideCSVData() {
    return fetch('data/tides_bom_sample.csv')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load tide CSV data');
            }
            return response.text();
        })
        .then(function(csvText) {
            tideCSVData = parseCSV(csvText);
            
            // Organize by location for faster lookup
            tideDataByLocation = {};
            tideCSVData.forEach(function(tide) {
                if (!tideDataByLocation[tide.location]) {
                    tideDataByLocation[tide.location] = [];
                }
                tideDataByLocation[tide.location].push(tide);
            });
            
            console.log('Loaded ' + tideCSVData.length + ' tide entries from CSV');
            return tideCSVData;
        })
        .catch(function(error) {
            console.warn('Could not load tide CSV data:', error);
            return [];
        });
}

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText) {
    var lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    var headers = lines[0].split(',');
    var data = [];
    
    for (var i = 1; i < lines.length; i++) {
        var values = lines[i].split(',');
        var row = {};
        
        for (var j = 0; j < headers.length; j++) {
            var header = headers[j].trim();
            var value = values[j] ? values[j].trim() : '';
            row[header] = value;
        }
        
        data.push(row);
    }
    
    return data;
}

/**
 * Get tide data for a specific location and date
 */
function getTidesForLocationAndDate(locationName, date) {
    // Match location name (case-insensitive, partial match)
    var locationKey = null;
    for (var key in tideDataByLocation) {
        if (key.toUpperCase().indexOf(locationName.toUpperCase()) !== -1) {
            locationKey = key;
            break;
        }
    }
    
    if (!locationKey) {
        console.warn('No tide data found for location:', locationName);
        return [];
    }
    
    // Format date as YYYY-MM-DD
    var dateStr = date instanceof Date ? 
        date.getFullYear() + '-' + 
        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(date.getDate()).padStart(2, '0') :
        date;
    
    // Filter tides for this date
    var tides = tideDataByLocation[locationKey].filter(function(tide) {
        return tide.date === dateStr;
    });
    
    return tides;
}

/**
 * Get tide height at a specific time using linear interpolation
 */
function getTideHeightAtTime(locationName, dateTime) {
    var date = dateTime instanceof Date ? dateTime : new Date(dateTime);
    var tides = getTidesForLocationAndDate(locationName, date);
    
    if (tides.length === 0) {
        return null; // No data available
    }
    
    // Convert current time to minutes since midnight
    var currentMinutes = date.getHours() * 60 + date.getMinutes();
    
    // Convert tide times to minutes and parse heights
    var tideTimes = tides.map(function(tide) {
        var timeParts = tide.time.split(':');
        var minutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
        var height = parseFloat(tide.height);
        return { minutes: minutes, height: height };
    }).sort(function(a, b) {
        return a.minutes - b.minutes;
    });
    
    // Find surrounding tide times
    var before = null;
    var after = null;
    
    for (var i = 0; i < tideTimes.length; i++) {
        if (tideTimes[i].minutes <= currentMinutes) {
            before = tideTimes[i];
        }
        if (tideTimes[i].minutes > currentMinutes && !after) {
            after = tideTimes[i];
            break;
        }
    }
    
    // Handle edge cases
    if (!before && after) {
        // Before first tide of the day
        return after.height;
    }
    if (before && !after) {
        // After last tide of the day
        return before.height;
    }
    if (!before && !after && tideTimes.length > 0) {
        // Use first available
        return tideTimes[0].height;
    }
    
    // Linear interpolation between two tides
    if (before && after) {
        var timeDiff = after.minutes - before.minutes;
        var heightDiff = after.height - before.height;
        var timeFromBefore = currentMinutes - before.minutes;
        
        var interpolatedHeight = before.height + (heightDiff * timeFromBefore / timeDiff);
        return interpolatedHeight;
    }
    
    return null;
}

/**
 * Convert tide height to percentage (0-100)
 * Based on typical WA tide range of 0-1.5m
 */
function tideHeightToPercentage(heightMeters) {
    if (heightMeters === null) return 50; // Default middle
    
    // Typical range: 0m to 1.5m
    // Convert to 0-100%
    var maxHeight = 1.5;
    var percentage = (heightMeters / maxHeight) * 100;
    
    // Clamp to 0-100
    return Math.max(0, Math.min(100, percentage));
}

// Initialize on page load
if (typeof window !== 'undefined') {
    // Load tide CSV data when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadTideCSVData();
        });
    } else {
        loadTideCSVData();
    }
}
