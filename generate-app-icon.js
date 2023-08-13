const puppeteer = require('puppeteer-core');
const { compressSync } = require('fflate');
const base64 = require('base64-js');
const path = require('path');
const extractZip = require('extract-zip');
const del = require('del');
const { readdirSync } = require('fs');
const { copySync: cpSync } = require('fs-extra');

const textEncoder = new TextEncoder();
const androidAssets = [
    'play_store_512.png',
    path.join('res', 'mipmap-anydpi-v26'),
    path.join('res', 'mipmap-hdpi'),
    path.join('res', 'mipmap-mdpi'),
    path.join('res', 'mipmap-xhdpi'),
    path.join('res', 'mipmap-xxhdpi'),
    path.join('res', 'mipmap-xxxhdpi'),
];

const androidMainFolder = (p) => path.join(__dirname, 'android', 'app', 'src', 'main', p);
const iosMainFolder = (p) => path.join(__dirname, 'ios', 'App', p);
const destAssetPaths = {
    'ios': (p) => iosMainFolder(path.join('App', 'Assets.xcassets', 'AppIcon.appiconset', p)),
    'android': androidMainFolder,
    'web': (p) => path.join(__dirname, 'public', 'icons', p)
}

const destAssetsIgnoreList = {
    'web': ['README.md']
}

const toBeDeletedWeb = [path.join('public', 'icons')];
const toBeDeletedAndroid = androidAssets.map(androidMainFolder);
const toBeDeletedIos = [path.join('App', 'Assets.xcassets', 'AppIcon.appiconset', '*')].map(iosMainFolder);

function configToUrl(config) {
    return encodeURIComponent(base64.fromByteArray(
        compressSync(textEncoder.encode(JSON.stringify(config)), { mtime: 0 })
    ));
}

async function downloadAsset(config) {
    console.log('> Generating assets...');
    const downloadPath = path.join(__dirname, '.cache');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        executablePath: process.env.PUPPETEER_EXEC_PATH,
        headless: false
    });

    const page = await browser.newPage();
    const configHash = configToUrl(config);
    await page.goto(`https://icon.kitchen/i/${configHash}`);
    const client = await page.target().createCDPSession();
    const iconUploadHandle = await page.$('[data-type="image"] input[type="file"]');

    // upload icon and download assets
    if (iconUploadHandle) {
        await iconUploadHandle.uploadFile(path.relative(process.cwd(), path.join(__dirname, 'resources', 'icon-foreground.png')));
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath
        });
        console.log('> Downloading assets...');
        await page.click('[aria-label="Download"]');
        await page.waitForTimeout(3000);
    }

    return downloadPath;
}

async function extractDownloadedAsset(downloadPath) {
    console.log('> Extracting zip content...');
    // extract zip
    const extractedFolder = path.join(downloadPath, 'extracted');
    const zipFileName = 'IconKitchen-Output.zip';
    await extractZip(path.join(downloadPath, zipFileName), { dir: extractedFolder });
    return extractedFolder;
}

async function copyAssets(extractedFolder) {
    for (const platform in destAssetPaths) {
        console.log(`> Copying ${platform} assets...`);
        const assetPaths = readdirSync(path.join(extractedFolder, platform));
        for (let i = 0; i < assetPaths.length; i++) {
            const assetPath = assetPaths[i];
            if (destAssetsIgnoreList[platform] && destAssetsIgnoreList[platform].includes(assetPath)) {
                continue;
            }
            const src = path.join(extractedFolder, platform, assetPath);
            const dest = destAssetPaths[platform](assetPath);
            console.log(`> (${i + 1}/${assetPaths.length}) Copying ${src} to ${dest}...`);
            cpSync(src, dest, { recursive: true });
        }
    }
}

(async () => {
    let success = true;

    await del(['.cache', ...toBeDeletedWeb, ...toBeDeletedAndroid, ...toBeDeletedIos], { cwd: __dirname });

    try {
        const downloadPath = await downloadAsset({
            values: {
                fgType: 'image',
                fgMask: false,
                bgType: 'gradient',
                fgPadding: { top: 0, right: 0, bottom: 0, left: 0 },
                bgShape: 'circle',
                fgScaling: 'center',
                bgGradient: { color1: '#e65b7a', color2: '#f1a2b3', angle: -45 }
            },
            modules: ['android', 'ios', 'web']
        });

        const extractedFolder = await extractDownloadedAsset(downloadPath);
        copyAssets(extractedFolder);
    } catch (e) {
        success = false;
        console.error(e);
    } finally {
        console.log('> Deleting cache...');
        await del(['.cache'], { cwd: __dirname });
        console.log('> Done!');
        process.exit(success ? 0 : 1);
    }
})();
