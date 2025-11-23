import { Plugin } from 'vite';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

interface AsepriteFrame {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
  duration: number;
  sourceSize: { w: number; h: number };
}

interface AsepriteJson {
  frames: AsepriteFrame[];
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
  };
}

export default function spritesPlugin(): Plugin {
  const virtualModuleId = 'virtual:sprites';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-sprites',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const assetsDir = path.resolve(__dirname, 'src/assets/cards{m}');
        console.log(
          `[vite-plugin-sprites] Scanning for sprites in: ${assetsDir}`
        );

        // Find all JSON files in assets/cards
        const files = await glob('**/*.json', { cwd: assetsDir });
        console.log(
          `[vite-plugin-sprites] Found ${files.length} sprite files.`
        );

        const sprites: Record<string, any> = {};

        for (const file of files) {
          const filePath = path.join(assetsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const json = JSON.parse(content) as AsepriteJson;

          // Generate ID from path (remove extension, normalize slashes)
          // e.g. "generals/f1_argeon-highmane.json" -> "generals/f1_argeon-highmane"
          const spriteId = file.replace(/\\/g, '/').replace(/\.json$/, '');

          // Process animations
          const animations: Record<
            string,
            { startFrame: number; endFrame: number; frameDuration: number }
          > = {};

          let currentAnimName: string | null = null;
          let currentAnimStart = 0;
          let currentAnimFrameDuration = 0;

          json.frames.forEach((frame, index) => {
            // Parse animation name from filename (e.g. "attack-0" -> "attack")
            // Assumes format "name-index"
            const match = frame.filename.match(/^(.+)-\d+$/);
            const animName = match ? match[1] : 'default';

            if (animName !== currentAnimName) {
              // Close previous animation
              if (currentAnimName) {
                animations[currentAnimName] = {
                  startFrame: currentAnimStart,
                  endFrame: index - 1,
                  frameDuration: currentAnimFrameDuration
                };
              }
              // Start new animation
              currentAnimName = animName;
              currentAnimStart = index;
              currentAnimFrameDuration = frame.duration;
            }
          });

          // Close last animation
          if (currentAnimName) {
            animations[currentAnimName] = {
              startFrame: currentAnimStart,
              endFrame: json.frames.length - 1,
              frameDuration: currentAnimFrameDuration
            };
          }

          // Extract common data from the first frame
          const firstFrame = json.frames[0];

          sprites[spriteId] = {
            id: spriteId,
            frameSize: {
              w: firstFrame.sourceSize.w,
              h: firstFrame.sourceSize.h
            },
            frameDuration: firstFrame.duration,
            animations
          };
        }

        return `export default ${JSON.stringify(sprites)}`;
      }
    }
  };
}
