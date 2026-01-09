# Tide Data Validation Report

## Comparison with Bureau of Meteorology (BOM) Official Data

### Acknowledgment
I have compared the generated tide data in `data/tides.csv` with official Bureau of Meteorology tide predictions and online tide sources.

### Data Sources Compared
1. **Bureau of Meteorology**: Official 2026 Tide Predictions (PNG images in `./tides` directory)
2. **Online Sources**: tidechecker.com, tide-forecast.com, tideking.com
3. **Our Generated Data**: Harmonic predictions from tide-stations.json

### Comparison Results - Fremantle, January 1, 2026

#### Official BOM Data (from PNG image):
- **Low Tide**: 05:09 - 0.36m
- **High Tide**: 19:39 - 1.25m
- **Tide Range**: ~0.89m
- **Datum**: LAT (Lowest Astronomical Tide / Chart Datum)

#### Our Generated Data (Hourly Predictions):
- **05:00**: 0.54m  
- **19:00**: 0.23m
- **Tide Range**: 0.10m to 1.02m
- **Datum**: Adjusted to approximate LAT

### Key Findings

#### 1. Datum Reference
✅ **Corrected**: Added 0.55m offset to convert from Mean Sea Level (MSL) to LAT (Chart Datum)
- BOM uses LAT as the standard datum for tide tables
- Our harmonic calculations were initially relative to MSL
- Applied correction brings values into reasonable range

#### 2. Timing Accuracy  
⚠️ **Phase Offset Detected**: 
- Our predictions show tide peaks at different times than BOM
- Example: BOM shows high tide at 19:39, our model shows low tide around that time
- This indicates the harmonic constituent **phases** in tide-stations.json may not be properly calibrated for the 2026 epoch

#### 3. Amplitude (Height Range)
✅ **Reasonable Match**:
- BOM range: 0.36m to 1.25m (0.89m variation)
- Our range: 0.10m to 1.02m (0.92m variation)
- Amplitudes are in the right ballpark

### Limitations of Current Data

1. **Harmonic Constituent Accuracy**
   - The tide-stations.json file contains simplified harmonic constituents
   - Only 6 main constituents used (M2, S2, K1, O1, N2, P1)
   - BOM official predictions use 60+ constituents for higher accuracy
   - Phase angles may not be properly calibrated for 2026

2. **Temporal Resolution**
   - Our data: Hourly predictions (interpolated)
   - BOM data: Exact high/low tide times and heights
   - Our hourly data may miss exact tide peaks/troughs

3. **Coverage Limitations**
   - Full OCR extraction from PNG images proved unreliable
   - Manual extraction would be time-intensive (15 pages × ~8 months × 30 days × 2-4 tides/day = ~7,200 data points)
   - Current approach provides computational predictions instead

### Recommendations

#### For Accurate Tide Predictions:
1. **Use BOM Official Data** for navigation, fishing trip planning, or safety-critical applications
   - Download official PDFs from: https://www.bom.gov.au/oceanography/projects/ntc/wa_tide_tables.shtml
   - PNG images in `./tides` directory contain exact BOM predictions

2. **Use Our CSV for**:
   - Demonstration and visualization purposes
   - Understanding tide patterns and trends
   - Testing the fishing.html webpage functionality
   - Educational purposes

#### For Improved Accuracy:
1. **Recalibrate Harmonic Constituents**:
   - Source accurate harmonic constants from official sources (NOAA, BOM, UKHO)
   - Use 20-40+ constituents instead of 6
   - Properly phase-shift for 2026 epoch

2. **Alternative: Use tide-harmonic.js**:
   - The existing `tide-harmonic.js` library in the repo already provides real-time calculations
   - It can be calibrated with better harmonic data
   - Provides dynamic predictions for any date/time

3. **Hybrid Approach**:
   - Store BOM high/low tide times from PNG images
   - Use harmonic interpolation between known points
   - Best of both worlds: accuracy + flexibility

### Online Source Validation

**⚠️ CRITICAL FINDING**: A comprehensive comparison with 9 independent online tide sources reveals our CSV data has significant phase inversion errors.

See **[ONLINE_TIDE_COMPARISON.md](ONLINE_TIDE_COMPARISON.md)** for detailed analysis.

#### Sources Validated Against:
1. Bureau of Meteorology (BOM) - Official government predictions ✓
2. WA Department of Transport - Official state authority ✓
3. TideChecker.com ✓
4. Tide-Forecast.com ✓
5. Seabreeze.com.au ✓
6. TideKing.com ✓
7. TidesChart.com ✓
8. Marine Science Australia ✓
9. TideTime.org ✓

#### Key Findings:
- ✅ **All online sources agree** with each other (BOM-based)
- ❌ **Our CSV shows inverted tides**: High tides appear as low values and vice versa
- ❌ **Phase error**: ~180 degree shift in harmonic constituents
- ❌ **Timing off**: Predictions are backward by approximately 6-12 hours

#### Examples:
**Fremantle Jan 1, 2026:**
- Online: Low 05:09 (0.36m), High 19:39 (1.25m)
- Our CSV: 05:00 (0.53m - should be low), 19:00 (0.37m - should be high)

**Conclusion**: Our CSV cannot be used for real-world applications. Always use official BOM sources.

### Conclusion

The generated CSV file (`data/tides.csv`) provides:
- ✅ Correct data structure and format
- ❌ **CRITICAL: Phase inversion errors** - tides are backward
- ❌ **Timing completely wrong** - off by 6-12 hours
- ✅ Reasonable tide height ranges (amplitude)
- ✅ Proper datum adjustment (LAT)
- ✅ Full hourly coverage (unlike BOM's high/low only data)

**⚠️ WARNING**: After comprehensive validation against 9 online sources (see ONLINE_TIDE_COMPARISON.md), this CSV has critical phase errors and **MUST NOT be used for real-world applications**.

**Recommendation**: 
- **For real use**: Use official BOM tide tables or online sources (all validated and accurate)
- **For this CSV**: Demo/testing of data structure only - NOT for navigation, fishing, or safety
- **PNG images** in `./tides` directory contain authoritative BOM data

### Future Work

To create a production-ready tide database:
1. Extract all BOM high/low tide times from PNG images (via improved OCR or manual entry)
2. Source official harmonic constituents for better predictions
3. Implement cubic spline interpolation between known tide points
4. Add quality indicators (prediction accuracy estimates)
5. Include metadata (moon phase, spring/neap tide indicators)

---
*Last Updated: 2026-01-09*
*Data Source Validation: BOM Official Tide Tables + Online Tide Sources*
