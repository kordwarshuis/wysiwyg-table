# WYSIWYG Table Editor

A lightweight, standalone WYSIWYG table editor for creating WordPress-ready HTML tables. Built with vanilla JavaScript and Bootstrap 5 for a modern, responsive UI.

**Note:** This project uses vanilla JavaScript with Bootstrap for UI components - no heavy WYSIWYG frameworks like TinyMCE or CKEditor are used. This keeps it fast, lightweight, and easy to deploy.

## Features

✅ **Multiple Input Formats**
- Paste HTML tables directly
- Import TSV (Tab-Separated Values) from Google Sheets
- Import CSV data
- Auto-detects format

✅ **Table Editing**
- Add/remove rows and columns
- Merge and split cells (multi-cell selection with Shift+Click)
- Move columns left/right
- Real-time visual editing with contenteditable

✅ **Styling & Classes**
- Add CSS classes to multiple selected cells
- Add CSS classes to entire rows
- Add CSS classes to entire columns
- Perfect for WordPress table styling

✅ **Modern UI**
- Bootstrap 5 responsive design
- Side-by-side editor and HTML preview
- Collapsible paste section (auto-hides after use)
- Toggle between standard and full viewport width
- Individual panel width toggles

✅ **Export**
- Copy clean HTML ready for WordPress
- Live preview of generated HTML
- Formatted, readable output

## Installation & Usage

### Quick Start (No Installation)

1. Simply open `index.html` in your web browser
2. Start editing tables!

### Using NPM (Development)

```bash
# Install dependencies
npm install

# Start local development server
npm start
```

Then open http://localhost:3000 in your browser.

## Deployment

### Quick Deploy

Use the pre-built distribution files:

1. **Build distribution**: Run `./build-dist.sh` (or copy files manually)
2. **Upload files**: Upload all files from the `dist/` directory to your web host
   - `index.html`
   - `style.css`
   - `style.custom.css`
   - `script.js`
3. **Access**: Open `index.html` in any browser

### Static Hosting

This project consists of static HTML/CSS/JS files and can be deployed to any web hosting

### Compatible Hosts
- GitHub Pages
- Netlify
- Vercel
- Any shared hosting (cPanel, etc.)
- AWS S3 + CloudFront
- Local file system (file://)

## How to Use

### 1. Import Data

**From Google Sheets:**
1. Select cells in Google Sheets
2. Copy (Cmd/Ctrl + C)
3. Paste into the text area
4. Click "Parse & Create Table"

**From HTML:**
- Paste any HTML table code
- Click "Parse & Create Table"

**From CSV:**
- Paste comma-separated data
- Click "Parse & Create Table"

### 2. Edit Table

**Basic Operations:**
- Click any cell to select it
- Shift+Click to select multiple cells
- Use toolbar buttons to add/remove rows/columns

**Merge Cells:**
1. Select multiple cells (Shift+Click)
2. Click "🔗 Merge Cells"

**Split Cells:**
1. Click a merged cell
2. Click "✂️ Split Cell"

**Move Columns:**
1. Click any cell in the column
2. Click "← Move Column Left" or "→ Move Column Right"

### 3. Add CSS Classes

1. Click a cell to select it
2. Enter class name(s) in the input field
3. Choose target: Cell, Row, or Column
4. Click "Add Class"

Example classes for WordPress:
- `table-striped`
- `table-bordered`
- `highlight`
- `text-center`

### 4. Export to WordPress

1. Click "📋 Copy HTML"
2. Go to WordPress editor (Text/HTML mode)
3. Paste the HTML code
4. Switch to Visual mode to see the table

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## File Structure

```
wysiwyg-table/
├── index.html      # Main HTML file
├── style.css       # All styling
├── script.js       # Table editor logic
├── package.json    # NPM configuration
└── README.md       # This file
```

## Technical Details

- **Size**: ~40KB total HTML/CSS/JS (uncompressed, excluding Bootstrap CDN)
- **Dependencies**: Bootstrap 5 (via CDN, no installation needed)
- **Framework**: Vanilla JavaScript + Bootstrap UI components
- **Server**: None required (static files)
- **Browser API**: Uses modern JavaScript (ES6+)
- **No WYSIWYG Framework**: Intentionally avoids heavy editors like TinyMCE/CKEditor

## Tips & Tricks

1. **Google Sheets Import**: The editor handles tab-separated values perfectly, making it ideal for Google Sheets data
2. **Class Naming**: Use WordPress-compatible class names for seamless integration
3. **Cell Selection**: Hold Shift and click to select multiple cells for merging
4. **Undo**: Use browser's undo (Cmd/Ctrl + Z) if needed
5. **Mobile**: Works on tablets and mobile browsers

## WordPress Integration

The generated HTML is clean and WordPress-friendly:

```html
<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
  </tbody>
</table>
```

Add these classes for common WordPress themes:
- `wp-block-table`
- `has-fixed-layout`
- `alignwide`
- `alignfull`

## License

MIT License - Free to use and modify

## Contributing

Feel free to submit issues or pull requests!
