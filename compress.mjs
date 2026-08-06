import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TEMPLATE_DIR = 'd:\\daud\\projek bisnis\\template';
const PUBLIC_VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos');
const DATA_FILE = path.join(process.cwd(), 'src', 'data.json');

// Limit to 2 items per category for initial showcase building
const LIMIT_PER_CATEGORY = 2; 

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function compressVideo(inputPath, outputPath) {
  console.log(`Compressing ${inputPath} -> ${outputPath}`);
  // -vcodec libx264 -crf 28: Good balance of quality and file size
  // -preset fast: Faster compression
  // -vf scale=-2:720: Scale to 720p height, preserving aspect ratio
  // -an: Remove audio (since these are just hover/preview effects)
  const cmd = `ffmpeg -i "${inputPath}" -vcodec libx264 -crf 28 -preset fast -vf "scale=-2:720" -an -y "${outputPath}"`;
  try {
    await execAsync(cmd);
    console.log(`Success: ${outputPath}`);
  } catch (error) {
    console.error(`Failed to compress ${inputPath}: ${error.message}`);
  }
}

async function main() {
  await ensureDir(PUBLIC_VIDEOS_DIR);
  
  const categories = [];
  const itemsMap = {};
  
  const dirItems = await fs.readdir(TEMPLATE_DIR, { withFileTypes: true });
  
  for (const dir of dirItems) {
    if (dir.isDirectory() && dir.name !== 'node_modules' && !dir.name.startsWith('.')) {
      const categoryName = dir.name;
      categories.push(categoryName);
      itemsMap[categoryName] = [];
      
      const catPath = path.join(TEMPLATE_DIR, categoryName);
      await ensureDir(path.join(PUBLIC_VIDEOS_DIR, categoryName));
      
      const subDirs = await fs.readdir(catPath, { withFileTypes: true });
      let count = 0;
      
      for (const subDir of subDirs) {
        if (subDir.isDirectory() && count < LIMIT_PER_CATEGORY) {
          const itemId = subDir.name;
          const itemPath = path.join(catPath, itemId);
          
          const files = await fs.readdir(itemPath);
          const videoFile = files.find(f => f.endsWith('.mp4'));
          
          if (videoFile) {
            const inputVideoPath = path.join(itemPath, videoFile);
            const outputVideoName = `${itemId}.mp4`;
            const outputVideoPath = path.join(PUBLIC_VIDEOS_DIR, categoryName, outputVideoName);
            
            // Check if already compressed
            try {
              await fs.access(outputVideoPath);
              console.log(`Skipping (already exists): ${outputVideoPath}`);
            } catch {
              await compressVideo(inputVideoPath, outputVideoPath);
            }
            
            itemsMap[categoryName].push({
              id: `${categoryName}-${itemId}`,
              title: `${categoryName} ${itemId}`,
              videoUrl: `/videos/${categoryName}/${outputVideoName}`
            });
            
            count++;
          }
        }
      }
    }
  }
  
  const data = {
    categories: categories,
    items: itemsMap
  };
  
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  console.log('data.json generated successfully!');
}

main().catch(console.error);
