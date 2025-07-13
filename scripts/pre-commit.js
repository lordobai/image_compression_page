const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Running pre-commit hook...');

// Update sitemap date
const today = new Date().toISOString().split('T')[0];
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');

if (fs.existsSync(sitemapPath)) {
  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  
  // Replace all lastmod dates with today's date
  sitemapContent = sitemapContent.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${today}</lastmod>`
  );
  
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log(`✅ Sitemap updated with date: ${today}`);
  
  // Add the updated sitemap to the commit
  try {
    execSync('git add public/sitemap.xml', { stdio: 'inherit' });
    console.log('✅ Updated sitemap added to commit');
  } catch (error) {
    console.log('⚠️ Could not add sitemap to git (not a git repo or no changes)');
  }
} else {
  console.log('⚠️ Sitemap not found, skipping update');
}

console.log('✅ Pre-commit hook completed'); 