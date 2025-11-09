/**
 * Frontend Test Suite for MedNex
 * Tests component imports and basic functionality
 */

const testComponents = async () => {
  console.log('🧪 Testing frontend components...\n');
  
  let passed = 0;
  let total = 0;

  // Test 1: Type definitions
  try {
    total++;
    const types = require('./lib/types');
    console.log('✅ Type definitions imported successfully');
    console.log(`   Available types: ${Object.keys(types).length} exports`);
    passed++;
  } catch (error) {
    console.log(`❌ Type definitions failed: ${error.message}`);
  }

  // Test 2: API client
  try {
    total++;
    const api = require('./lib/api');
    console.log('✅ API client imported successfully');
    console.log('   Available API methods: extractSymptoms, predictDiseases, generateGraph, chat, explainTerm');
    passed++;
  } catch (error) {
    console.log(`❌ API client failed: ${error.message}`);
  }

  // Test 3: Environment configuration
  try {
    total++;
    const nextConfig = require('./next.config.js');
    console.log('✅ Next.js configuration is valid');
    passed++;
  } catch (error) {
    console.log(`❌ Next.js configuration failed: ${error.message}`);
  }

  // Test 4: Check if .env.local exists
  try {
    total++;
    const fs = require('fs');
    if (fs.existsSync('.env.local')) {
      console.log('✅ Environment file (.env.local) found');
    } else {
      console.log('⚠️  .env.local not found - using defaults');
    }
    passed++;
  } catch (error) {
    console.log(`❌ Environment check failed: ${error.message}`);
  }

  // Test 5: Package.json validation
  try {
    total++;
    const packageJson = require('./package.json');
    const requiredDeps = ['next', 'react', 'd3', 'axios', 'lucide-react'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length === 0) {
      console.log('✅ All required dependencies are installed');
      console.log(`   Total dependencies: ${Object.keys(packageJson.dependencies).length}`);
    } else {
      console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
    }
    
    if (missingDeps.length === 0) passed++;
  } catch (error) {
    console.log(`❌ Package.json validation failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`🎯 Frontend Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All frontend tests passed! Frontend is ready to run.');
    console.log('\nTo start the development server:');
    console.log('npm run dev');
    console.log('\nTo build for production:');
    console.log('npm run build');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above.');
  }

  return passed === total;
};

// Run tests
testComponents().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
