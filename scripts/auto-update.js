const fs = require('fs');
const path = require('path');

function updateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  
  console.log(`🔄 Updating sitemap with date: ${today}`);
  
  if (fs.existsSync(sitemapPath)) {
    let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    
    // Replace all lastmod dates with today's date
    sitemapContent = sitemapContent.replace(
      /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
      `<lastmod>${today}</lastmod>`
    );
    
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log(`✅ Sitemap updated successfully!`);
    console.log(`📁 File: ${sitemapPath}`);
    console.log(`📅 New date: ${today}`);
    
    return true;
  } else {
    console.log('❌ Sitemap not found!');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  updateSitemap();
}

module.exports = updateSitemap; 