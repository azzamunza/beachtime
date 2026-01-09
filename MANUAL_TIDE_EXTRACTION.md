# Manual Tide Data Extraction Template

Based on the structure described in TIDE_PNG_STRUCTURE.md, this file provides a template for manually extracting tide data from the BOM PNG files.

## Extraction Process

For each PNG file:

1. Open the image
2. For each month on the page:
   - For each of the 4 columns (weeks):
     - For each day in that column (up to 8 days):
       - Extract day number, day name
       - Extract all tide times and heights for that day
       - Record in CSV format

## CSV Format

```csv
location,latitude,longitude,date,day_name,time,height,tide_type
FREMANTLE HARBOUR,-32.05,115.733,2026-01-01,Thursday,05:09:00,0.36,low
FREMANTLE HARBOUR,-32.05,115.733,2026-01-01,Thursday,19:39:00,1.25,high
```

## Example: Fremantle January 2026 (from WA-0060.png)

Based on the visible data in the image:

### January 1, 2026 (Thursday)
```csv
FREMANTLE HARBOUR,-32.05,115.733,2026-01-01,Thursday,05:09:00,0.36,low
FREMANTLE HARBOUR,-32.05,115.733,2026-01-01,Thursday,19:39:00,1.25,high
```

### January 2, 2026 (Friday)  
```csv
FREMANTLE HARBOUR,-32.05,115.733,2026-01-02,Friday,05:48:00,0.31,low
FREMANTLE HARBOUR,-32.05,115.733,2026-01-02,Friday,20:24:00,1.27,high
```

### January 3, 2026 (Saturday)
```csv
FREMANTLE HARBOUR,-32.05,115.733,2026-01-03,Saturday,06:29:00,0.30,low
FREMANTLE HARBOUR,-32.05,115.733,2026-01-03,Saturday,21:09:00,1.25,high
```

### January 4, 2026 (Sunday)
```csv
FREMANTLE HARBOUR,-32.05,115.733,2026-01-04,Sunday,07:07:00,0.33,low
FREMANTLE HARBOUR,-32.05,115.733,2026-01-04,Sunday,21:53:00,1.21,high
```

### January 5, 2026 (Monday)
```csv
FREMANTLE HARBOUR,-32.05,115.733,2026-01-05,Monday,07:41:00,0.39,low
FREMANTLE HARBOUR,-32.05,115.733,2026-01-05,Monday,13:28:00,0.74,?
FREMANTLE HARBOUR,-32.05,115.733,2026-01-05,Monday,18:07:00,1.07,?
FREMANTLE HARBOUR,-32.05,115.733,2026-01-05,Monday,22:29:00,1.13,high
```

Note: On days with 4 tides, the middle two tides need to be classified based on relative heights.

## Tide Type Determination

For days with 2 tides:
- Lower height = low tide
- Higher height = high tide

For days with 3-4 tides:
- Look at the pattern of heights
- Generally alternates: low, high, low, high
- Or: high, low, high, low

## Locations and File IDs

| Location | File IDs | Coordinates |
|----------|----------|-------------|
| Fremantle | 0060, 0061, 0062 | -32.05, 115.733 |
| Hillarys | 0069, 0070, 0071 | -31.817, 115.733 |
| Mandurah | 0075, 0076, 0077 | -32.517, 115.7 |
| Peel Inlet | 0087, 0088, 0089 | -32.583, 115.7 |
| Rottnest Island | 0090, 0091, 0092 | -31.95, 115.533 |

## Monthly Coverage

Each location typically has 3 PNG files covering:
- File 1: January - April
- File 2: May - August  
- File 3: September - December

## Data Entry Tips

1. Work systematically: one month at a time, left to right, top to bottom
2. Double-check day numbers match the calendar
3. Verify times are in 24-hour format and chronological
4. Cross-reference heights with online sources for spot checks
5. Mark uncertain extractions for review

## Quality Assurance

After extraction, validate:
- ✅ All days 1-31 are present for each month
- ✅ Times are chronological within each day
- ✅ Heights are reasonable (0.0-2.0m for most WA locations)
- ✅ At least 2 tides per day (rarely 1 or 5+)
- ✅ Spot check against online sources

## Estimated Effort

- Each PNG file: ~4 months × 30 days × 3 tides = ~360 data points
- 15 PNG files × 360 = ~5,400 total data points
- Manual entry time: ~10-15 hours for complete dataset

## Alternative: Semi-Automated Approach

1. Use OCR to extract text from each PNG
2. Post-process OCR output using the grid structure rules
3. Manually verify and correct OCR errors
4. This could reduce effort to 5-8 hours

---

*This manual extraction template provides a structured approach to converting BOM PNG tide tables into usable CSV data.*
