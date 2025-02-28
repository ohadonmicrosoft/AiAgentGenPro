#!/usr/bin/env node
/**
 * Main build script for the project
 * Handles building both client and server components
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Environment configuration
const env = process.env.NODE_ENV || 'development';
console.log(chalk.blue(`Building for ${env} environment`));

// Ensure required directories exist
const dirs = ['dist', 'dist/client', 'dist/server'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Clean existing build
console.log(chalk.yellow('Cleaning previous builds...'));
try {
  fs.rmSync('dist', { recursive: true, force: true });
  fs.mkdirSync('dist');
  fs.mkdirSync('dist/client');
  fs.mkdirSync('dist/server');
} catch (error) {
  console.error(chalk.red('Error cleaning build directory:'), error);
}

// Build client
console.log(chalk.yellow('Building client...'));
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log(chalk.green('Client build completed successfully'));
} catch (error) {
  console.error(chalk.red('Client build failed:'), error);
  process.exit(1);
}

// Build server
console.log(chalk.yellow('Building server...'));
try {
  execSync('cd server && npm run build', { stdio: 'inherit' });
  console.log(chalk.green('Server build completed successfully'));
} catch (error) {
  console.error(chalk.red('Server build failed:'), error);
  process.exit(1);
}

// Copy necessary files
console.log(chalk.yellow('Copying static assets and configuration files...'));
try {
  // Copy package.json and update it for production
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  // Remove dev dependencies and scripts that aren't needed in production
  delete packageJson.devDependencies;
  // Keep only necessary scripts
  packageJson.scripts = {
    start: packageJson.scripts.start,
    'start:prod': packageJson.scripts['start:prod'],
  };
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

  // Copy client build to dist
  execSync('cp -r client/dist/* dist/client/', { stdio: 'inherit' });
  
  // Copy environment files and other configs
  fs.copyFileSync('.env.example', 'dist/.env.example');
  if (fs.existsSync(`.env.${env}`)) {
    fs.copyFileSync(`.env.${env}`, 'dist/.env');
  } else if (fs.existsSync('.env')) {
    fs.copyFileSync('.env', 'dist/.env');
  }
  
  // Copy Firebase config if it exists
  if (fs.existsSync('firebase.json')) {
    fs.copyFileSync('firebase.json', 'dist/firebase.json');
  }
  if (fs.existsSync('.firebaserc')) {
    fs.copyFileSync('.firebaserc', 'dist/.firebaserc');
  }
  
  console.log(chalk.green('Files copied successfully'));
} catch (error) {
  console.error(chalk.red('Error copying files:'), error);
  process.exit(1);
}

// Create version file with build information
const buildInfo = {
  version: packageJson.version,
  environment: env,
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
};
fs.writeFileSync('dist/BUILD_INFO.json', JSON.stringify(buildInfo, null, 2));

console.log(chalk.green.bold('Build completed successfully!'));
console.log(chalk.white('Build information:'));
console.log(chalk.white(JSON.stringify(buildInfo, null, 2))); 