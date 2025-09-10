#!/usr/bin/env node

/**
 * Test script to verify the improved Playwright scraper works with the real website
 * Run with: node test-real-scraping.js
 * 
 * This will:
 * 1. Launch a visible browser (non-headless)
 * 2. Navigate to the NOTAM website
 * 3. Try to find and click f_getMoreInfo elements
 * 4. Take screenshots for debugging
 * 5. Show detailed logging
 */

const { PlaywrightNotamScraper } = require('./dist/playwrightScraper');

async function testRealScraping() {
  console.log('🚀 Starting real website scraping test...\n');
  
  const scraper = new PlaywrightNotamScraper({
    headless: false,  // Visible browser for debugging
    timeout: 60000,   // Longer timeout for manual observation
    slowMo: 1000,     // Slow down actions so you can see them
    devtools: true    // Open DevTools
  });
  
  try {
    console.log('🌐 Initializing browser...');
    await scraper.initialize();
    
    console.log('📡 Fetching NOTAMs from real website...');
    console.log('   (Browser window should be visible - you can watch the process)\n');
    
    // Test with empty existing IDs to fetch a few NOTAMs
    const notams = await scraper.fetchNotams([]);
    
    console.log(`\n✅ Successfully fetched ${notams.length} NOTAMs!`);
    
    // Show details of first few NOTAMs
    notams.slice(0, 3).forEach((notam, index) => {
      console.log(`\n📄 NOTAM ${index + 1}:`);
      console.log(`   ID: ${notam.id}`);
      console.log(`   ICAO: ${notam.icaoCode}`);
      console.log(`   Expanded: ${notam.isExpanded ? '✅' : '❌'}`);
      console.log(`   Valid From: ${notam.validFrom || 'Not specified'}`);
      console.log(`   Valid To: ${notam.validTo || 'Not specified'}`);
      console.log(`   Description: ${notam.description.substring(0, 100)}...`);
      if (notam.expandedContent) {
        console.log(`   Expanded Content Length: ${notam.expandedContent.length} chars`);
      }
    });
    
    console.log(`\n🎯 Summary:`);
    console.log(`   Total NOTAMs: ${notams.length}`);
    console.log(`   Successfully Expanded: ${notams.filter(n => n.isExpanded).length}`);
    console.log(`   With Valid Dates: ${notams.filter(n => n.validFrom && n.validTo).length}`);
    
  } catch (error) {
    console.error('❌ Error during scraping test:', error.message);
    console.error('   Full error:', error);
  } finally {
    console.log('\n🔧 Cleaning up browser...');
    await scraper.cleanup();
    console.log('✅ Test completed!');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run the test
testRealScraping().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
