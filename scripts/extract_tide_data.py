#!/usr/bin/env python3
"""
Extract tide prediction data from PNG images using OCR.
Creates a CSV file with tide information for use in the fishing.html webpage.

This script uses pytesseract to extract text from tide prediction PNG images
and parses the data into a structured CSV format.
"""

import os
import re
import csv
from PIL import Image
import pytesseract

# Manual mapping of file IDs to locations based on the PDF structure
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

# Coordinates for each location (from the images)
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

def parse_tide_entry(text_line, year, month, day):
    """
    Parse a single line for time and height entries.
    Returns list of (datetime, height, type) tuples.
    """
    tides = []
    
    # Look for patterns like "0509 0.36" - time followed by height
    # Use a more flexible pattern to handle OCR errors
    pattern = r'(\d{4})\s+(\d+\.\d+)'
    matches = re.findall(pattern, text_line)
    
    for time_str, height_str in matches:
        try:
            hour = int(time_str[:2])
            minute = int(time_str[2:])
            height = float(height_str)
            
            # Validate ranges
            if 0 <= hour <= 23 and 0 <= minute <= 59 and 0 <= height <= 15:
                date_str = f"{year}-{month:02d}-{day:02d}"
                time_formatted = f"{hour:02d}:{minute:02d}:00"
                
                tides.append({
                    'date': date_str,
                    'time': time_formatted,
                    'height': f"{height:.2f}"
                })
        except (ValueError, IndexError):
            continue
    
    return tides

def extract_tides_from_text(text, location, year):
    """Extract all tide entries from OCR text."""
    tides = []
    
    # Month names as they appear in the image
    months = {
        'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4,
        'MAY': 5, 'JUNE': 6, 'JULY': 7, 'AUGUST': 8,
        'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12
    }
    
    # Split text into lines
    lines = text.split('\n')
    
    current_month = None
    current_day = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check if this line contains a month name
        for month_name, month_num in months.items():
            if month_name in line:
                current_month = month_num
                break
        
        if current_month is None:
            continue
        
        # Try to extract day number from the start of the line
        # Look for patterns like "1 0509" or "2 0548" at line start
        day_match = re.match(r'^(\d{1,2})\s+\d{4}', line)
        if day_match:
            try:
                current_day = int(day_match.group(1))
                if 1 <= current_day <= 31:
                    # Parse this line for tide data
                    day_tides = parse_tide_entry(line, year, current_month, current_day)
                    for tide in day_tides:
                        tide['location'] = location
                        coords = LOCATION_COORDS.get(location, (None, None))
                        tide['latitude'] = coords[0] if coords[0] else ''
                        tide['longitude'] = coords[1] if coords[1] else ''
                    tides.extend(day_tides)
            except ValueError:
                continue
    
    return tides

def process_image(image_path):
    """Process a single PNG image and extract tide data."""
    filename = os.path.basename(image_path)
    print(f"Processing: {filename}")
    
    # Get location from filename
    location = get_location_from_filename(filename)
    if not location:
        print(f"  WARNING: Could not determine location from filename")
        return []
    
    print(f"  Location: {location}")
    
    # Run OCR
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img, config='--psm 6')
    
    # Extract year from text (should be 2026)
    year_match = re.search(r'\b(2026)\b', text)
    year = int(year_match.group(1)) if year_match else 2026
    
    # Extract tides
    tides = extract_tides_from_text(text, location, year)
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
        tides = process_image(image_path)
        all_tides.extend(tides)
        print()
    
    # Sort by location, date, and time
    all_tides.sort(key=lambda x: (x['location'], x['date'], x['time']))
    
    print("=" * 70)
    print(f"Total tide entries extracted: {len(all_tides)}")
    
    # Write to CSV
    output_path = os.path.join(repo_root, 'data', 'tides.csv')
    
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

if __name__ == '__main__':
    main()
