/**
 * tide-harmonic.js
 * Client-side harmonic tide prediction module
 * No external dependencies, browser-compatible ES6
 */

// Tidal constituent speeds in degrees per hour
// Expanded to support common NOAA and MarineTides constituents
const TIDAL_SPEEDS = {
    // Semidiurnal constituents (12-hour periods)
    M2: 28.9841042,  // Principal lunar semidiurnal
    S2: 30.0,        // Principal solar semidiurnal
    N2: 28.4397295,  // Larger lunar elliptic semidiurnal
    K2: 30.0821373,  // Lunisolar semidiurnal
    L2: 29.5284789,  // Smaller lunar elliptic semidiurnal
    T2: 29.9589333,  // Larger solar elliptic semidiurnal
    
    // Diurnal constituents (24-hour periods)
    K1: 15.0410686,  // Lunar diurnal
    O1: 13.9430356,  // Lunar diurnal
    P1: 14.9589314,  // Solar diurnal
    Q1: 13.3986609,  // Larger lunar elliptic diurnal
    J1: 15.5854433,  // Smaller lunar elliptic diurnal
    OO1: 16.1391017, // Lunar diurnal
    
    // Shallow water constituents
    M4: 57.9682084,  // Lunar quarter-diurnal (M2 overtide)
    M6: 86.9523127,  // Lunar sixth-diurnal (M2 overtide)
    M8: 115.9364169, // Lunar eighth-diurnal (M2 overtide)
    MK3: 44.0251729, // Shallow water terdiurnal
    S4: 60.0,        // Solar quarter-diurnal
    MN4: 57.4238337, // Shallow water quarter-diurnal
    MS4: 58.9841042, // Shallow water quarter-diurnal
    
    // Long-period constituents
    MM: 0.5443747,   // Lunar monthly
    SSA: 0.0821373,  // Solar semiannual
    SA: 0.0410686,   // Solar annual
    MSF: 1.0158958,  // Lunisolar synodic fortnightly
    MF: 1.0980331,   // Lunisolar fortnightly
    
    // Additional constituents
    NU2: 28.5125831,  // Larger lunar evectional
    LAM2: 29.4556253, // Smaller lunar evectional
    MU2: 27.9682084,  // Variational
    "2N2": 27.8953548, // Lunar elliptical semidiurnal second-order
    "2SM2": 31.0158958 // Shallow water semidiurnal
};

// Store loaded stations globally
let stationsData = [];

/**
 * Load tide stations from a JSON file
 * @param {string} url - URL to the stations JSON file
 * @returns {Promise<Array>} Array of station objects
 */
export async function loadStations(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load stations: ${response.statusText}`);
        }
        stationsData = await response.json();
        return stationsData;
    } catch (error) {
        console.error('Error loading tide stations:', error);
        throw error;
    }
}

/**
 * Get all loaded stations
 * @returns {Array} Array of station objects
 */
export function getStations() {
    return stationsData;
}

/**
 * Find a station by ID
 * @param {string} stationId - Station identifier
 * @returns {Object|null} Station object or null if not found
 */
export function findStation(stationId) {
    return stationsData.find(station => station.id === stationId) || null;
}

/**
 * Find the nearest station to given coordinates
 * @param {number} latitude - Target latitude
 * @param {number} longitude - Target longitude
 * @returns {Object|null} Nearest station or null if no stations loaded
 */
export function findNearestStation(latitude, longitude) {
    if (stationsData.length === 0) {
        return null;
    }
    
    let nearest = null;
    let minDistance = Infinity;
    
    for (const station of stationsData) {
        const distance = calculateDistance(
            latitude, longitude,
            station.latitude, station.longitude
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            nearest = station;
        }
    }
    
    return nearest;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Predict tide height at a specific time using harmonic constituents
 * @param {Object} station - Station object with constituents
 * @param {Date} date - Date/time for prediction (UTC)
 * @returns {number} Predicted tide height in meters
 */
export function predictTideHeight(station, date) {
    if (!station || !station.constituents) {
        throw new Error('Invalid station or missing constituents');
    }
    
    const constituents = station.constituents;
    const datum = station.datum || 0;
    
    // Calculate time in hours since epoch (J2000.0: 2000-01-01 12:00:00 UTC)
    // J2000.0 is a standard astronomical epoch used as a reference point for celestial mechanics
    // It provides a common time base for tidal predictions and ensures consistency across
    // different implementations. The tidal constituent speeds and phases are referenced to
    // this epoch, making calculations reproducible and accurate.
    const epoch = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const hoursFromEpoch = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60);
    
    let tideHeight = datum;
    
    // Sum contributions from all constituents
    for (const [name, data] of Object.entries(constituents)) {
        if (!TIDAL_SPEEDS[name]) {
            continue; // Skip unknown constituents
        }
        
        const amplitude = data.amplitude;
        const phase = data.phase; // Phase in degrees
        const speed = TIDAL_SPEEDS[name];
        
        // Calculate the argument (phase angle at this time)
        const argument = speed * hoursFromEpoch + phase;
        const argumentRadians = toRadians(argument);
        
        // Add this constituent's contribution
        tideHeight += amplitude * Math.cos(argumentRadians);
    }
    
    return tideHeight;
}

/**
 * Generate a time series of tide predictions
 * @param {Object} station - Station object with constituents
 * @param {Date} startDate - Start date/time (UTC)
 * @param {number} hours - Duration in hours
 * @param {number} stepMinutes - Time step in minutes (default: 10)
 * @returns {Array} Array of {time: Date, height: number} objects
 */
export function generateTideSeries(station, startDate, hours, stepMinutes = 10) {
    const series = [];
    const totalMinutes = hours * 60;
    const steps = Math.floor(totalMinutes / stepMinutes);
    
    for (let i = 0; i <= steps; i++) {
        const time = new Date(startDate.getTime() + i * stepMinutes * 60 * 1000);
        const height = predictTideHeight(station, time);
        series.push({ time, height });
    }
    
    return series;
}

/**
 * Find high and low tides from a tide series
 * @param {Array} series - Tide series from generateTideSeries
 * @returns {Object} Object with {highs: Array, lows: Array}
 */
export function findHighLowTides(series) {
    if (!series || series.length < 3) {
        return { highs: [], lows: [] };
    }
    
    const highs = [];
    const lows = [];
    
    // Look for local maxima and minima
    for (let i = 1; i < series.length - 1; i++) {
        const prev = series[i - 1].height;
        const current = series[i].height;
        const next = series[i + 1].height;
        
        // Local maximum (high tide)
        if (current > prev && current > next) {
            highs.push({
                time: series[i].time,
                height: series[i].height
            });
        }
        
        // Local minimum (low tide)
        if (current < prev && current < next) {
            lows.push({
                time: series[i].time,
                height: series[i].height
            });
        }
    }
    
    return { highs, lows };
}

/**
 * Calculate tide movement (rate of change) at a specific time
 * @param {Object} station - Station object with constituents
 * @param {Date} date - Date/time for prediction (UTC)
 * @param {number} deltaMinutes - Time delta for derivative calculation (default: 5)
 * @returns {number} Rate of change in meters per hour
 */
export function calculateTideMovement(station, date, deltaMinutes = 5) {
    const deltaMs = deltaMinutes * 60 * 1000;
    
    const before = new Date(date.getTime() - deltaMs);
    const after = new Date(date.getTime() + deltaMs);
    
    const heightBefore = predictTideHeight(station, before);
    const heightAfter = predictTideHeight(station, after);
    
    // Convert to meters per hour
    const deltaHeight = heightAfter - heightBefore;
    const deltaHours = (deltaMinutes * 2) / 60;
    
    return deltaHeight / deltaHours;
}

/**
 * Determine tide state (rising/falling/slack) at a specific time
 * @param {Object} station - Station object with constituents
 * @param {Date} date - Date/time for prediction (UTC)
 * @returns {Object} {state: string, movement: number}
 */
export function getTideState(station, date) {
    const movement = calculateTideMovement(station, date);
    const threshold = 0.01; // meters per hour threshold for "slack"
    
    let state;
    if (Math.abs(movement) < threshold) {
        state = 'slack';
    } else if (movement > 0) {
        state = 'rising';
    } else {
        state = 'falling';
    }
    
    return { state, movement };
}
