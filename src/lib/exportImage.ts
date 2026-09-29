import { toBlob } from "html-to-image";

export async function exportImage(card: HTMLElement, username: string): Promise<void> {
  await document.fonts.ready;
  await Promise.all(Array.from(card.querySelectorAll("img")).map(async (image) => {
    if (!image.complete) {
      await new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }
    if (image.complete && image.naturalWidth) await image.decode().catch(() => {});
  }));

  const blob = await toBlob(card, {
    width: 540,
    height: 960,
    pixelRatio: 2,
    cacheBust: true,
    skipFonts: true,
  });
  if (!blob) throw new Error("The image could not be created. Please try another browser.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `devcard-${username}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
