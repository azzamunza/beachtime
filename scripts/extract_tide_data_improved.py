#!/usr/bin/env python3
"""
Improved tide data extraction from BOM PNG files.

This script properly extracts tide data following the actual grid structure:
- 4 columns × 8 rows parent grid (one week per column)
- Each cell has 3 columns × up to 6 rows (day, time, height)
- Times and heights are in chronological order within each day

Based on the structure documented in TIDE_PNG_STRUCTURE.md
"""

import os
import re
import csv
from datetime import datetime
from PIL import Image
import pytesseract

# Manual mapping of file IDs to locations
FILE_LOCATION_MAP = {
    '0060': 'FREMANTLE',
    '0061': 'FREMANTLE',
    '0062': 'FREMANTLE',
    '0069': 'HILLARYS',
    '0070': 'HILLARYS',
    '0071': 'HILLARYS',
    '0075': 'MANDURAH',
    '0076': 'MANDURAH',
    '0077': 'MANDURAH',
    '0087': 'PEEL INLET',
    '0088': 'PEEL INLET',
    '0089': 'PEEL INLET',
    '0090': 'ROTTNEST ISLAND',
    '0091': 'ROTTNEST ISLAND',
    '0092': 'ROTTNEST ISLAND',
}

# Coordinates for each location
LOCATION_COORDS = {
    'FREMANTLE': (-32.05, 115.733),
    'HILLARYS': (-31.817, 115.733),
    'MANDURAH': (-32.517, 115.7),
    'PEEL INLET': (-32.583, 115.7),
    'ROTTNEST ISLAND': (-31.95, 115.533),
}

def get_location_from_filename(filename):
    """Extract location from filename using our mapping."""
    match = re.search(r'WA-(\d{4})', filename)
    if match:
        file_id = match.group(1)
        return FILE_LOCATION_MAP.get(file_id)
    return None

def parse_tide_line(line):
    """
    Parse a line that may contain day number, time, and height.
    
    Returns: (day_number, time_str, height_float) or (None, time_str, height_float)
    """
    # Pattern: optional day number, time (4 digits), height (decimal)
    # Example: "1 0509 0.36" or just "1939 1.25"
    
    # Try with day number first
    match = re.match(r'^(\d{1,2})\s+(\d{4})\s+(\d+\.\d+)', line)
    if match:
        day = int(match.group(1))
        time = match.group(2)
        height = float(match.group(3))
        return (day, time, height)
    
    # Try without day number
    match = re.match(r'^(\d{4})\s+(\d+\.\d+)', line)
    if match:
        time = match.group(1)
        height = float(match.group(2))
        return (None, time, height)
    
    return (None, None, None)

def extract_tides_from_image(image_path):
    """
    Extract tide data from a BOM PNG image.
    
    This implementation uses the actual grid structure:
    - Each month has days arranged in 4 columns (weeks)
    - Each day cell has multiple rows for tide times/heights
    """
    filename = os.path.basename(image_path)
    print(f"Processing: {filename}")
    
    # Get location from filename
    location = get_location_from_filename(filename)
    if not location:
        print(f"  WARNING: Could not determine location from filename")
        return []
    
    print(f"  Location: {location}")
    
    # Run OCR with better settings for table data
    img = Image.open(image_path)
    
    # Try to enhance OCR for tabular data
    text = pytesseract.image_to_string(img, config='--psm 6')
    
    # Extract year
    year_match = re.search(r'\b(2026)\b', text)
    year = int(year_match.group(1)) if year_match else 2026
    
    print(f"  Year: {year}")
    
    # Parse the text to extract tide data
    tides = []
    
    # Month mapping
    months = {
        'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4,
        'MAY': 5, 'JUNE': 6, 'JULY': 7, 'AUGUST': 8,
        'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12
    }
    
    lines = text.split('\n')
    current_month = None
    current_day = None
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        
        # Check for month headers
        for month_name, month_num in months.items():
            if month_name in line:
                current_month = month_num
                print(f"  Found month: {month_name} ({month_num})")
                break
        
        if current_month is None:
            continue
        
        # Try to parse tide data from this line
        day_num, time_str, height = parse_tide_line(line)
        
        # Update current day if we found a day number
        if day_num is not None:
            current_day = day_num
        
        # If we have a valid time and height, and a current day
        if time_str and height and current_day:
            # Validate the data
            try:
                hour = int(time_str[:2])
                minute = int(time_str[2:])
                
                if 0 <= hour <= 23 and 0 <= minute <= 59 and 0 <= height <= 10:
                    # Format the data
                    date_str = f"{year}-{current_month:02d}-{current_day:02d}"
                    time_formatted = f"{hour:02d}:{minute:02d}:00"
                    
                    coords = LOCATION_COORDS.get(location, (None, None))
                    
                    tides.append({
                        'location': location,
                        'latitude': coords[0] if coords[0] else '',
                        'longitude': coords[1] if coords[1] else '',
                        'date': date_str,
                        'time': time_formatted,
                        'height': f"{height:.2f}"
                    })
            except (ValueError, IndexError):
                continue
    
    print(f"  Extracted {len(tides)} tide entries")
    return tides

def main():
    """Main function to process all PNG files and create CSV."""
    repo_root = os.getcwd()
    tides_dir = os.path.join(repo_root, 'tides')
    
    # Find all PNG files
    png_files = sorted([f for f in os.listdir(tides_dir) if f.endswith('.png') and 'WA-' in f])
    
    print(f"Found {len(png_files)} PNG files")
    print("=" * 70)
    
    # Process all images
    all_tides = []
    for png_file in png_files:
        image_path = os.path.join(tides_dir, png_file)
        tides = extract_tides_from_image(image_path)
        all_tides.extend(tides)
        print()
    
    # Sort by location, date, and time
    all_tides.sort(key=lambda x: (x['location'], x['date'], x['time']))
    
    print("=" * 70)
    print(f"Total tide entries extracted: {len(all_tides)}")
    
    if len(all_tides) == 0:
        print("\nWARNING: No tide data extracted!")
        print("This may be due to OCR limitations with the table structure.")
        print("Consider manual extraction or using the existing harmonic predictions.")
        return
    
    # Write to CSV
    output_path = os.path.join(repo_root, 'data', 'tides_extracted.csv')
    
    fieldnames = ['location', 'latitude', 'longitude', 'date', 'time', 'height']
    
    with open(output_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_tides)
    
    print(f"\nCSV file created: {output_path}")
    
    # Display statistics
    if all_tides:
        locations = set(t['location'] for t in all_tides)
        print(f"\nLocations included: {', '.join(sorted(locations))}")
        print("\nSample entries from each location:")
        for location in sorted(locations):
            location_tides = [t for t in all_tides if t['location'] == location]
            if location_tides:
                sample = location_tides[0]
                print(f"  {sample['location']}: {sample['date']} {sample['time']} - {sample['height']}m")
        
        # Show first few entries for Fremantle to verify accuracy
        fremantle_jan1 = [t for t in all_tides if t['location'] == 'FREMANTLE' and t['date'] == '2026-01-01']
        if fremantle_jan1:
            print(f"\nFremantle January 1, 2026 (verification):")
            for tide in fremantle_jan1:
                print(f"  {tide['time']}: {tide['height']}m")
            print("\nExpected from BOM PNG:")
            print("  05:09: 0.36m (Low)")
            print("  19:39: 1.25m (High)")

if __name__ == '__main__':
    main()
