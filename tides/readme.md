Western Australia Tide Information for 2026

This directory contains tide prediction tables from the Bureau of Meteorology for various locations in Western Australia.

## Source Data

The PNG files in this directory are extracts from the official 2026 Tide Predictions document published by the Commonwealth of Australia Bureau of Meteorology. Each PNG file contains a table with times and heights of high and low waters for specific locations.

## PNG File Structure

**IMPORTANT**: The structure of these PNG files is documented in detail in [../TIDE_PNG_STRUCTURE.md](../TIDE_PNG_STRUCTURE.md). This guide explains:
- The 4×8 grid layout (4 weeks × 8 days per week)
- How each day cell is subdivided (3 columns: Day, Time, Height)
- How to properly extract tide data for AI/automated systems

## Locations Covered

- **Fremantle** (WA-0060, 0061, 0062) - LAT 32°03'S, LONG 115°44'E
- **Hillarys** (WA-0069, 0070, 0071) - LAT 31°49'S, LONG 115°44'E
- **Mandurah** (WA-0075, 0076, 0077) - LAT 32°31'S, LONG 115°42'E
- **Peel Inlet** (WA-0087, 0088, 0089) - LAT 32°35'S, LONG 115°42'E
- **Rottnest Island** (WA-0090, 0091, 0092) - LAT 31°57'S, LONG 115°32'E

## Data Structure Example

From Fremantle, January 1, 2026:
```
Day | Time | Height (m)
----|------|----------
1   | 0509 | 0.36     (Low tide)
TH  | 1939 | 1.25     (High tide)
```

## Data Usage

**Current Status of CSV File**:
The `../data/tides.csv` file was generated using harmonic predictions, NOT extracted from these PNG files. It contains phase/timing errors.

**For Accurate Tide Data**:
1. Use these PNG images directly (authoritative BOM data)
2. Extract manually using [../MANUAL_TIDE_EXTRACTION.md](../MANUAL_TIDE_EXTRACTION.md)
3. Use the structure guide for automated extraction: [../TIDE_PNG_STRUCTURE.md](../TIDE_PNG_STRUCTURE.md)
4. Refer to online sources listed in [../ONLINE_TIDE_COMPARISON.md](../ONLINE_TIDE_COMPARISON.md)

## Extraction Scripts

- `../scripts/extract_tide_data.py` - Original OCR attempt (limited success)
- `../scripts/extract_tide_data_improved.py` - Improved extraction following grid structure

Note: OCR extraction is challenging due to the complex table layout. Manual extraction or improved OCR preprocessing may be needed.

## Data Format

The PNG images use:
- **Datum**: LAT (Lowest Astronomical Tide / Chart Datum)
- **Times**: 24-hour format (HHMM without colon separator)
- **Heights**: Meters with 2 decimal places
- **Time Zone**: -0800 (Australian Western Standard Time)

---

*These PNG files contain the authoritative BOM tide predictions. See the structure guide for proper data extraction.*
