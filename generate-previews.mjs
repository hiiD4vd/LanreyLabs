import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const TEMPLATE_DIR = 'd:/daud/projek bisnis/template';
const PREVIEW_DIR = path.join(process.cwd(), 'public', 'previews');

// Categories to skip (like json config or script files)
const EXCLUDED_DIRS = ['node_modules', '.git'];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function compressVideo(inputPath, outputPath) {
  // -vf "scale=-2:480" : scale height to 480px, maintain aspect ratio
  // -r 15 : 15 FPS
  // -crf 35 : very high compression (lower quality)
  // -an : remove audio
  // -t 10 : only take first 10 seconds for preview
  const command = `ffmpeg -i "${inputPath}" -vf "scale=-2:480" -r 15 -c:v libx264 -crf 35 -an -t 10 -y "${outputPath}"`;
  try {
    await execPromise(command);
    return true;
  } catch (error) {
    console.error(`Error compressing ${inputPath}:`, error.message);
    return false;
  }
}

async function run() {
  console.log('Starting preview generation...');
  await ensureDir(PREVIEW_DIR);

  const categories = fs.readdirSync(TEMPLATE_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !EXCLUDED_DIRS.includes(dirent.name))
    .map(dirent => dirent.name);

  const tasks = [];

  for (const category of categories) {
    const categoryPath = path.join(TEMPLATE_DIR, category);
    const outputCategoryPath = path.join(PREVIEW_DIR, category);
    await ensureDir(outputCategoryPath);

    const items = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const itemId of items) {
      const itemPath = path.join(categoryPath, itemId);
      const files = fs.readdirSync(itemPath);
      const videoFile = files.find(f => f.toLowerCase().endsWith('.mp4'));

      if (videoFile) {
        const inputPath = path.join(itemPath, videoFile);
        // Simpan output ke folder public/previews/Kategori/ItemId/video.mp4 agar jalurnya teratur
        const outputItemPath = path.join(outputCategoryPath, itemId);
        await ensureDir(outputItemPath);
        
        const outputPath = path.join(outputItemPath, videoFile);

        // Skip if preview already exists to save time on reruns
        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          if (stats.size > 0) {
            console.log(`Skipping (already exists): ${category}/${itemId}/${videoFile}`);
            continue;
          }
        }

        console.log(`Queueing: ${category}/${itemId}/${videoFile}`);
        tasks.push({ inputPath, outputPath, name: `${category}/${itemId}/${videoFile}` });
      }
    }
  }

  console.log(`Total videos to compress: ${tasks.length}`);

  // Process 4 videos concurrently
  const CONCURRENCY = 4;
  let activeCount = 0;
  let completedCount = 0;
  let currentIndex = 0;

  return new Promise((resolve) => {
    function processNext() {
      if (currentIndex >= tasks.length && activeCount === 0) {
        console.log('All previews generated!');
        resolve();
        return;
      }

      while (activeCount < CONCURRENCY && currentIndex < tasks.length) {
        const task = tasks[currentIndex];
        currentIndex++;
        activeCount++;

        console.log(`Compressing (${completedCount + 1}/${tasks.length}): ${task.name}...`);
        
        compressVideo(task.inputPath, task.outputPath).then(() => {
          activeCount--;
          completedCount++;
          console.log(`Finished: ${task.name}`);
          processNext();
        });
      }
    }

    if (tasks.length > 0) {
      processNext();
    } else {
      console.log('No videos to compress!');
      resolve();
    }
  });
}

run();
