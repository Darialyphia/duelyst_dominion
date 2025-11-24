declare module 'virtual:sprites' {
  export interface SpriteData {
    id: string;
    frameSize: { w: number; h: number };
    sheetSize: { w: number; h: number };
    animations: Record<
      string,
      { startFrame: number; endFrame: number; frameDuration: number }
    >;
  }

  const sprites: Record<string, SpriteData>;
  export default sprites;
}
