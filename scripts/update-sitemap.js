const fs = require('fs');
const path = require('path');

// Get current date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Read the sitemap
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

// Replace all lastmod dates with today's date
sitemapContent = sitemapContent.replace(
  /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
  `<lastmod>${today}</lastmod>`
);

// Write the updated sitemap
fs.writeFileSync(sitemapPath, sitemapContent);

console.log(`✅ Sitemap updated with date: ${today}`);
console.log(`📁 Updated file: ${sitemapPath}`); 