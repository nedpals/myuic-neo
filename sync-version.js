const plist = require('plist');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const {execSync} = require("child_process");

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

// Set dotenv
writeFileSync(join(__dirname, '.env'), `
VITE_APP_VERSION_NAME="${info.APP_VERSION_NAME}"
VITE_APP_VERSION_CODE="${info.APP_VERSION_CODE}",
VITE_APP_BUILD_DATE="${info.APP_BUILD_DATE}"
`.trim(), {
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