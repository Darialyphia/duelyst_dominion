declare module 'virtual:sprites' {
  export interface SpriteData {
    id: string;
    frameSize: { w: number; h: number };
    frameDuration: number;
    animations: Record<string, { startFrame: number; endFrame: number }>;
  }

  const sprites: Record<string, SpriteData>;
  export default sprites;
}
