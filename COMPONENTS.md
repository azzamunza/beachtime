# Component Structure

This document explains the modular structure of the Beach Conditions website.

## File Organization

The website is now organized into separate, reusable components:

### 1. `index.html` (481 lines)
The main HTML structure containing:
- Page layout and DOM structure
- Form controls (latitude, longitude, timezone selector)
- Chart containers and legends
- Modal dialogs
- All HTML markup without embedded styles or scripts

### 2. `styles.css` (789 lines)
All styling for the website including:
- Global styles and resets
- Layout and positioning
- Component-specific styles (buttons, charts, controls, modals)
- Responsive design rules
- Animations and transitions
- Color schemes and gradients

### 3. `script.js` (2,602 lines)
All JavaScript functionality including:
- Weather data fetching and processing
- Chart rendering (Separated Rings, Overlaid, Stacked, Hourly Rating)
- User interactions (tab switching, day selection, controls)
- Location search and management
- Settings persistence (localStorage)
- Rating calculations and algorithms

## Benefits of This Structure

### Reusability
Other HTML files can easily import the styles and functionality:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Your HTML content -->
    <script src="script.js"></script>
</body>
</html>
```

### Maintainability
- **CSS Changes**: Edit only `styles.css` to update styling across all pages
- **JavaScript Changes**: Edit only `script.js` to update functionality across all pages
- **HTML Changes**: Each page maintains its own structure in its HTML file

### Performance
- Browser caching: CSS and JS files are cached after first load
- Parallel downloads: Browser can download CSS and JS simultaneously
- Faster subsequent page loads

### Code Organization
- Clear separation of concerns (Structure, Style, Behavior)
- Easier to locate specific code sections
- Better for team collaboration
- Simpler code reviews

## File Sizes

- `index.html`: ~27 KB (down from ~189 KB)
- `styles.css`: ~14 KB
- `script.js`: ~121 KB

**Total**: ~162 KB (compared to ~189 KB monolithic HTML)

## Using the Components

### For New Pages

1. Create a new HTML file
2. Include the CSS: `<link rel="stylesheet" href="styles.css">`
3. Add your HTML structure using the existing CSS classes
4. Include the JS: `<script src="script.js"></script>`

### Customizing Styles

You can override default styles by adding a custom CSS file after `styles.css`:
```html
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="custom.css">
```

### Customizing Behavior

You can extend the JavaScript functionality by adding additional scripts after `script.js`:
```html
<script src="script.js"></script>
<script src="custom-features.js"></script>
```

## Best Practices

1. **Don't modify the core files directly** for page-specific changes
2. **Use custom CSS/JS files** for page-specific customizations
3. **Keep the component files generic** so they work across all pages
4. **Test changes** to ensure they don't break existing pages
5. **Document any breaking changes** when updating component files

## Migration from Monolithic HTML

The original `index.html` was 3,873 lines with inline styles and scripts. The components were extracted as follows:

1. **CSS extraction**: Lines 7-797 → `styles.css`
2. **JavaScript extraction**: Lines 1269-3871 → `script.js`
3. **HTML cleanup**: Removed inline styles/scripts, added external references

All functionality remains identical to the original monolithic version.
