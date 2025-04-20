const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Copy .env file to react-email directory
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const reactEmailDir = path.join('node_modules', 'react-email');
  
  if (!fs.existsSync(reactEmailDir)) {
    fs.mkdirSync(reactEmailDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(reactEmailDir, '.env'), envContent);
  console.log('Copied .env file to react-email directory');
} catch (error) {
  console.error('Error copying .env file:', error);
}

// Run react-email dev server
try {
  console.log('Starting react-email dev server...');
  execSync('npx react-email dev --dir email --port 3001', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running react-email dev server:', error);
}
