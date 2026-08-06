import fs from 'fs';
import path from 'path';

const SRC_ROOT = 'd:/daud/projek bisnis/template';
const SHOWCASE_ROOT = 'd:/daud/projek bisnis/template-showcase';

const LIBRARIES = [
    { name: 'Magic UI', dir: 'MagicUI_Selected' },
    { name: 'ReactBits', dir: 'ReactBits_Selected' },
    { name: 'OriginKit', dir: 'OriginKit_Selected' }
];

const PUBLIC_MEDIA = path.join(SHOWCASE_ROOT, 'public', 'media');
const PUBLIC_CODE = path.join(SHOWCASE_ROOT, 'public', 'code');
const PUBLIC_VIDEOS = path.join(SHOWCASE_ROOT, 'public', 'videos');
const DATA_JSON_PATH = path.join(SHOWCASE_ROOT, 'src', 'data.json');

// Ensure directories exist
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
ensureDir(PUBLIC_MEDIA);
ensureDir(PUBLIC_CODE);

const result = {
    categories: ['Magic UI', 'ReactBits', 'OriginKit'],
    items: {
        'Magic UI': [],
        'ReactBits': [],
        'OriginKit': []
    }
};

let totalItems = 0;

// 1. Process New Libraries
for (const lib of LIBRARIES) {
    const libSourceDir = path.join(SRC_ROOT, lib.dir);
    if (!fs.existsSync(libSourceDir)) {
        console.warn(`[!] Direktori tidak ditemukan: ${libSourceDir}`);
        continue;
    }

    const destMediaDir = path.join(PUBLIC_MEDIA, lib.name.replace(/ /g, ''));
    const destCodeDir = path.join(PUBLIC_CODE, lib.name.replace(/ /g, ''));
    
    ensureDir(destMediaDir);
    ensureDir(destCodeDir);

    const folders = fs.readdirSync(libSourceDir);

    for (const folder of folders) {
        const compPath = path.join(libSourceDir, folder);
        if (!fs.statSync(compPath).isDirectory()) continue;

        let mediaType = null;
        let mediaFileName = null;
        let mediaExt = null;
        
        // Cek media (JPG / MP4)
        if (fs.existsSync(path.join(compPath, 'video.mp4'))) {
            mediaType = 'video';
            mediaFileName = 'video.mp4';
            mediaExt = '.mp4';
        } else if (fs.existsSync(path.join(compPath, 'thumbnail.jpg'))) {
            mediaType = 'image';
            mediaFileName = 'thumbnail.jpg';
            mediaExt = '.jpg';
        }

        if (!mediaType) {
            console.log(`[Lewati] ${lib.name}/${folder} - Tidak ada media`);
            continue;
        }

        // Cari file kode
        const files = fs.readdirSync(compPath);
        const codeFile = files.find(f => f.endsWith('.tsx') || f.endsWith('.jsx') || f.endsWith('.vue') || f.endsWith('.ts') || f.endsWith('.js'));
        
        if (!codeFile) {
            console.log(`[Lewati] ${lib.name}/${folder} - Tidak ada file kode`);
            continue;
        }

        // Salin media
        const newMediaName = `${folder.replace(/ /g, '')}${mediaExt}`;
        fs.copyFileSync(path.join(compPath, mediaFileName), path.join(destMediaDir, newMediaName));
        
        // Salin kode
        const newCodeName = `${folder.replace(/ /g, '')}${path.extname(codeFile)}`;
        fs.copyFileSync(path.join(compPath, codeFile), path.join(destCodeDir, newCodeName));

        // Format ID dan Title
        const title = folder.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
        const id = `${lib.name.replace(/ /g, '').toLowerCase()}-${folder.toLowerCase()}`;

        result.items[lib.name].push({
            id,
            title,
            category: lib.name,
            mediaType,
            mediaUrl: encodeURI(`/media/${lib.name.replace(/ /g, '')}/${newMediaName}`),
            codeUrl: encodeURI(`/code/${lib.name.replace(/ /g, '')}/${newCodeName}`)
        });

        totalItems++;
    }
}

// 2. Process Old Components (300 Components) directly from template using symlink
const IGNORED_DIRS = ['MagicUI_Selected', 'ReactBits_Selected', 'OriginKit_Selected', 'node_modules', '.git', '.vscode'];
const categories = fs.readdirSync(SRC_ROOT);

for (const cat of categories) {
    if (cat.startsWith('.')) continue;
    if (IGNORED_DIRS.includes(cat)) continue;

    const catPath = path.join(SRC_ROOT, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;

    if (!result.categories.includes(cat)) {
        result.categories.push(cat);
        result.items[cat] = [];
    }

    const items = fs.readdirSync(catPath);
    for (const itemId of items) {
        if (itemId.startsWith('.')) continue;
        const itemPath = path.join(catPath, itemId);
        if (!fs.statSync(itemPath).isDirectory()) continue;

        const files = fs.readdirSync(itemPath);
        const videoFile = files.find(f => f.endsWith('.mp4'));
        
        if (videoFile) {
            const hasZip = files.includes('code.zip');
            
            const previewPath = path.join(SHOWCASE_ROOT, 'public', 'previews', cat, itemId, videoFile);
            const previewUrl = fs.existsSync(previewPath) ? encodeURI(`/previews/${cat}/${itemId}/${videoFile}`) : null;
            
            result.items[cat].push({
                id: `${cat.replace(/ /g, '').toLowerCase()}-${itemId}`,
                title: `${cat} ${itemId}`,
                category: cat,
                mediaType: 'video',
                mediaUrl: encodeURI(`/old_components/${cat}/${itemId}/${videoFile}`),
                previewUrl: previewUrl,
                codeUrl: hasZip ? encodeURI(`/old_components/${cat}/${itemId}/code.zip`) : null
            });
            totalItems++;
        }
    }
}

fs.writeFileSync(DATA_JSON_PATH, JSON.stringify(result, null, 2));

console.log('==============================================');
console.log(`✅ Sukses! ${totalItems} komponen telah disalin ke Showcase.`);
console.log(`File JSON berhasil diperbarui: ${DATA_JSON_PATH}`);
console.log('==============================================');
