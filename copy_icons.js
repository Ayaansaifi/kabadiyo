const fs = require('fs');
const path = require('path');

const source = 'C:/Users/ACER/.gemini/antigravity/brain/e96c0c62-9dab-4b06-bcda-9938af6ca14c/kabadiwala_icon_1765136621247.png';
const destDir = 'e:/kabadiwala/public/icons';
const files = [
    'icon-72x72.png',
    'icon-96x96.png',
    'icon-128x128.png',
    'icon-144x144.png',
    'icon-152x152.png',
    'icon-192x192.png',
    'icon-384x384.png',
    'icon-512x512.png',
    'shortcut-market.png',
    'shortcut-orders.png',
    'shortcut-chat.png'
];

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

files.forEach(file => {
    fs.copyFileSync(source, path.join(destDir, file));
    console.log(`Copied to ${file}`);
});
