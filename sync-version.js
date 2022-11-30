const plist = require('plist');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const { execSync } = require("child_process");
const { parse: parseEnv } = require('dotenv');
const stringifyEnv = require('dotenv-stringify');

const package_json = require('./package.json');

const info = {
    APP_VERSION_NAME: (() => {
        const buildCommit = execSync('git rev-parse --short HEAD').toString().trim();
        return package_json.version + '-' + buildCommit;
    })(),
    APP_VERSION_CODE: execSync('git rev-list --first-parent --count origin/master').toString().trim(),
    APP_BUILD_DATE: (() => {
        const date = new Date();
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    })()
}

// Get .env
const filesToLookFor = ['.env']
if (process.env.NODE_ENV) {
    filesToLookFor.unshift(`.env.${process.env.NODE_ENV}`);
}

/** @type {Record<string, any>} */
let existingEnvData = {};
let envToUse = '.env';

for (const name of filesToLookFor) {
    const path = join(__dirname, name);
    if (existsSync(path)) {
        existingEnvData = parseEnv(readFileSync(path));
        envToUse = name;
        break;
    }
}

// converted to array to preserve entry orders
const envEntries = Object.entries(existingEnvData).map(en => ({ name: en[0], value: en[1] ?? null }));

// Set dotenv
function replaceEnvEntry(name, value) {
    const idx = envEntries.findIndex(n => n.name == name);
    if (idx == -1) {
        envEntries.push({ name, value });
        return;
    }

    envEntries[idx] = { ...envEntries[idx], value };
}

replaceEnvEntry('VITE_APP_VERSION_NAME', info.APP_VERSION_NAME);
replaceEnvEntry('VITE_APP_VERSION_CODE', info.APP_VERSION_CODE);
replaceEnvEntry('VITE_APP_BUILD_DATE', info.APP_BUILD_DATE);

const finalEnvEntries = envEntries.reduce((p,v) => {
    p[v.name] = v.value;
    return p;
}, {});

writeFileSync(join(__dirname, envToUse), stringifyEnv(finalEnvEntries), {
    encoding: 'utf-8',
    flag: 'w'
});

// Set app.properties (android)
writeFileSync(join(__dirname, 'android', 'app', 'app.properties'), `
versionName=${info.APP_VERSION_NAME}
versionCode=${info.APP_VERSION_CODE}
`.trim(), {
    encoding: 'utf-8',
    flag: 'w'
});

// Set Info.plist (iOS)
const infoPlistPath = join(__dirname, 'ios', 'App', 'App', 'Info.plist');
const infoPlist = plist.parse(readFileSync(infoPlistPath, { encoding: 'utf-8' }));
infoPlist.CFBundleShortVersionString = info.APP_VERSION_NAME;
infoPlist.CFBundleVersion = info.APP_VERSION_CODE;

writeFileSync(infoPlistPath, plist.build(infoPlist), { encoding: "utf8", flag: 'w' });