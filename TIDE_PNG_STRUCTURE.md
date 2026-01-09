# Tide Data PNG Structure Guide

## Overview

This document describes the structure of the Bureau of Meteorology (BOM) tide prediction PNG files to enable accurate data extraction by AI systems and automated tools.

## File Format

**Filename Pattern**: `MAR_P_2026_Tide_Predictions_by_Location_WA-[ID].png`

**Content**: Times and heights of high and low waters for a specific Western Australian location for the year 2026.

## Page Layout Structure

### Header Information
- **Location Name**: e.g., "FREMANTLE – WESTERN AUSTRALIA"
- **Coordinates**: LAT (latitude) and LONG (longitude)
- **Year**: Large font on right side
- **Time Zone**: e.g., "TIME ZONE -0800"
- **Title**: "TIMES AND HEIGHTS OF HIGH AND LOW WATERS"

### Monthly Grid Layout

Each page contains 2-4 months arranged horizontally.

**Parent Grid**: 4 columns × 8 rows (each column represents one week of days)

#### Column Structure
- Column 1: Days 1-8
- Column 2: Days 9-16
- Column 3: Days 17-24
- Column 4: Days 25-31 (or 28/29/30 depending on month)

### Cell Structure (Per Day)

Each cell contains tide data for one day and is subdivided into:

**Sub-grid**: 3 columns × up to 6 rows

#### Header Row (Row 1)
- Column 1: (empty)
- Column 2: "Time"
- Column 3: "m" (indicating meters for tide height)

#### Data Rows (Rows 2-6)
Each data row contains:
- **Column 1**: Day number (appears only in first data row) and day name abbreviation
  - Format: `[DAY_NUMBER] [DAY_ABBREV]`
  - Examples: "1 TH" (Thursday), "2 FR" (Friday)
  - Day abbreviations: MO, TU, WE, TH, FR, SA, SU
- **Column 2**: Time in 24-hour format (HHMM)
  - Format: `HHMM` (no colon separator)
  - Examples: "0509" (5:09 AM), "1939" (7:39 PM)
- **Column 3**: Tide height in meters
  - Format: Decimal number with 2 decimal places
  - Examples: "0.36", "1.25"

#### Moon Phase Symbols
Special symbols may appear in Column 1 alongside day names:
- ● : New Moon
- ◐ : First Quarter
- ○ : Full Moon
- ◑ : Last Quarter

## Data Interpretation

### Example: Fremantle, January 1, 2026

```
Column Layout:
Day | Time | m
------------------
1   | 0509 | 0.36
TH  | 1939 | 1.25
```

**Interpretation**:
- Date: January 1, 2026 (Thursday)
- First tide: 05:09 (5:09 AM), height 0.36m (LOW tide)
- Second tide: 19:39 (7:39 PM), height 1.25m (HIGH tide)

### Multiple Tides Per Day

Some days have 3-4 tides (semi-diurnal tides can have 2 highs and 2 lows):

```
Day | Time | m
------------------
5   | 0741 | 0.39
MO  | 2229 | 1.13
    | 1328 | 0.74
    | 1807 | 1.07
```

**Interpretation**:
- Date: January 5, 2026 (Monday)
- Tide 1: 07:41, height 0.39m
- Tide 2: 13:28, height 0.74m
- Tide 3: 18:07, height 1.07m
- Tide 4: 22:29, height 1.13m

Note: Times are listed in chronological order from top to bottom.

## OCR Extraction Guidelines

### Key Points for AI/Automated Extraction

1. **Locate Month Headers**: Search for month names (JANUARY, FEBRUARY, etc.)

2. **Identify Grid Structure**:
   - Find the 4-column weekly layout
   - Each column processes 8 days

3. **Parse Each Cell**:
   - First data row contains day number in Column 1
   - Subsequent rows have times and heights but no day number
   - Continue reading until reaching the next day number

4. **Handle Formatting Variations**:
   - Times are always 4 digits (HHMM)
   - Heights are always decimal with 2 places (X.XX)
   - Day names are 2 letters (except Thursday = TH)
   - Moon symbols may appear adjacent to day names

5. **Data Flow**:
   - Read left to right, top to bottom within each month
   - Process columns: 1-8, 9-16, 17-24, 25-31
   - Within each column, read from top (day 1/9/17/25) to bottom (day 8/16/24/31)

### Example Extraction Algorithm

```python
for each month in page:
    for week_column in [1, 2, 3, 4]:  # 4 columns per month
        for day_row in range(8):  # Up to 8 days per column
            day_number = extract_day_number()
            day_name = extract_day_name()
            
            tides = []
            current_row = day_row
            
            # Keep reading until we hit the next day or end
            while current_row has data and no new day_number:
                time = extract_time(column=2)
                height = extract_height(column=3)
                tides.append((time, height))
                current_row += 1
            
            save_tides(date=(year, month, day_number), tides=tides)
```

## Datum Reference

**Datum**: Chart Datum (LAT - Lowest Astronomical Tide)

All tide heights are measured relative to LAT, which is approximately 0.5-0.6m below Mean Sea Level (MSL) for Western Australian locations.

## Footer Information

Each page includes:
- Copyright notice: "© Copyright Commonwealth of Australia 2025, Bureau of Meteorology"
- Datum statement: "Datum of Predictions is Chart Datum"
- Moon phase legend
- Quality statement (on some pages): "Caution: Predictions are of secondary quality"

## Validation Checklist

When extracting tide data, verify:

1. ✅ Day numbers are sequential (1-28/29/30/31)
2. ✅ Times are in chronological order within each day
3. ✅ Heights are positive decimals (typically 0.00 to 2.00m for most WA locations)
4. ✅ Each day has 2-4 tide entries (rarely 1 or 5)
5. ✅ Day names match the calendar (cross-reference with 2026 calendar)

## Common Extraction Errors to Avoid

❌ **DO NOT**:
- Treat the entire grid as a single table
- Assume fixed number of tides per day
- Ignore day number changes
- Mix data from different days
- Assume times have colon separators (they don't: "0509" not "05:09")

✅ **DO**:
- Track day number changes carefully
- Handle variable number of tides per day
- Preserve chronological order within each day
- Validate extracted data against known patterns
- Cross-reference with online sources for spot checks

## Location-Specific Files

The repository contains PNG files for the following Western Australian locations:

| File IDs | Location |
|----------|----------|
| 0060-0062 | Fremantle |
| 0069-0071 | Hillarys |
| 0075-0077 | Mandurah |
| 0087-0089 | Peel Inlet |
| 0090-0092 | Rottnest Island |

Each location typically has 3 PNG files covering different months of 2026.

## Example Complete Day Entry

**Source Image Text**:
```
1   0509  0.36
TH  1939  1.25
```

**Extracted Data**:
```json
{
  "date": "2026-01-01",
  "day_name": "Thursday",
  "location": "FREMANTLE",
  "tides": [
    {"time": "05:09", "height": 0.36, "type": "low"},
    {"time": "19:39", "height": 1.25, "type": "high"}
  ]
}
```

## Integration with Fishing.html

The extracted data should be formatted as CSV:

```csv
location,latitude,longitude,date,time,height,type
FREMANTLE HARBOUR,-32.05,115.733,2026-01-01,05:09:00,0.36,low
FREMANTLE HARBOUR,-32.05,115.733,2026-01-01,19:39:00,1.25,high
```

Where `type` indicates whether it's a high or low tide (determined by comparing adjacent tide heights).

---

*This guide ensures accurate extraction of Bureau of Meteorology tide prediction data from PNG images for use in tide prediction applications.*
