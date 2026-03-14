export function registerFont(doc: any, font: string, fontPath?: string): void {
  if (fontPath) {
    doc.registerFont(font, fontPath);
  }
}