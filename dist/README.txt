WYSIWYG Table Editor - Distribution Files
==========================================

This directory contains all the files needed to deploy the WYSIWYG Table Editor.

FILES TO UPLOAD:
- index.html       (Main application file)
- style.css        (Main stylesheet)
- style.custom.css (Custom capability/adoption classes)
- script.js        (Application logic)

DEPLOYMENT INSTRUCTIONS:
1. Upload all 4 files to your web server
2. Keep them in the same directory
3. Open index.html in your browser
4. No server-side processing required
5. Works on any basic HTML hosting

REQUIREMENTS:
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Bootstrap CDN)
- No server-side requirements

The application loads Bootstrap and Bootstrap Icons from CDN, so you don't need to upload those files.

For local development without internet:
- Download Bootstrap 5.3.2 CSS and JS
- Download Bootstrap Icons CSS
- Update the <head> section in index.html to point to local files
