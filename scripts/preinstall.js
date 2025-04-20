#!/usr/bin/env node

// This script must be Javascript and it MUST NOT have npm depedencies
// because it is run before install has completed.

// Skip checks if running in Docker
if (process.env.DOCKER) {
  console.log('Skipping checks for Docker build ...');
  process.exit(0);
}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const red = (text) => `\x1b[31m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

function semverSatisfies(version, requirement) {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(version)) {
    return false;
  }
  const requirementMatch = requirement.match(/^([<>=^~]*)(.+)$/);

  const operator = requirementMatch ? requirementMatch[1] : '>=';
  const requiredVersion = requirementMatch ? requirementMatch[2] : requirement;

  const versionParts = version.split('.').map((part) => parseInt(part, 10));
  const requiredParts = requiredVersion.split('.').map((part) => parseInt(part, 10));

  while (versionParts.length < requiredParts.length) versionParts.push(0);
  while (requiredParts.length < versionParts.length) requiredParts.push(0);

  for (let i = 0; i < versionParts.length; i++) {
    if (versionParts[i] > requiredParts[i]) {
      return operator === '>' || operator === '>=' || operator === '^' || operator === '~' || operator === '';
    }
    if (versionParts[i] < requiredParts[i]) {
      return operator === '<' || operator === '<=';
    }
  }
  return operator === '=' || operator === '>=' || operator === '<=' || operator === '' || operator === '^' || operator === '~';
}

const satisfies = (version, required) => {
  return semverSatisfies(version, required);
};

const getOutput = (command) => {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    return null;
  }
};

const nodeVersionSatisfied = (pkg) => {
  const requiredNodeVersion = pkg.engines?.node?.replace('>=', '').trim() || null;
  if (!requiredNodeVersion) {
    return {
      status: 'error',
      msg: 'Could not find Node version requirement in package.json',
    };
  }
  const nodeVersion = process.version.replace('v', '');
  if (satisfies(nodeVersion, requiredNodeVersion)) {
    return { status: 'ok' };
  } else {
    return {
      status: 'error',
      msg: `Node.js version must be "${requiredNodeVersion}", found: "${nodeVersion}". Install it through https://github.com/nvm-sh/nvm.`,
    };
  }
};

const pnpmVersionSatisfied = (pkg) => {
  const requiredPnpmVersion = pkg.packageManager?.split('@')[1] || null;

  if (!requiredPnpmVersion) {
    return {
      status: 'error',
      msg: 'Could not find pnpm version requirement in package.json',
    };
  }
  const pnpmVersion = getOutput('pnpm --version');

  if (satisfies(pnpmVersion, requiredPnpmVersion)) {
    return { status: 'ok' };
  } else {
    return {
      status: 'error',
      msg: `The pnpm version must be "${requiredPnpmVersion}", found: "${pnpmVersion}". Install it through https://pnpm.io/installation.`,
    };
  }
};

const dockerVersionSatisfied = () => {
  const requiredDockerVersion = '>=26.0.0';
  const dockerVersionString = getOutput('docker --version');
  const match = dockerVersionString.match(/Docker version (\d+\.\d+\.\d+)/);
  const dockerVersion = match[1] ?? null;

  if (satisfies(dockerVersion, requiredDockerVersion)) {
    return { status: 'ok' };
  } else {
    return {
      status: 'error',
      msg: `Docker version must be "${requiredDockerVersion}", found: "${dockerVersion}". Install here - https://docs.docker.com/desktop/setup/install/mac-install/`,
    };
  }
};

const main = () => {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
  } catch (error) {
    console.error(red('Error reading package.json file'));
    process.exit(1);
  }

  const statuses = [nodeVersionSatisfied(pkg), pnpmVersionSatisfied(pkg), dockerVersionSatisfied()];

  const errors = statuses.filter((s) => s.status === 'error');

  if (errors.length > 0) {
    console.error(bold(red('\nERRORS:')));
    errors.forEach((err) => {
      console.error(red(`  ✗ ${err.msg}`));
    });

    console.error('\nPlease fix these issues and try again.\n');
    process.exit(1);
  } else {
    process.exit(0);
  }
};

void Promise.resolve().then(main);
