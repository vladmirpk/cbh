import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const LOGO_PATH = path.join(process.cwd(), "public", "cbh_images", "cbh_logo.jpeg");

export async function embedCbhLogo(pdf: PDFDocument) {
  const bytes = await readFile(LOGO_PATH);
  return pdf.embedJpg(bytes);
}

/** Letterhead: white band, logo left, document title right, charcoal/red rules. */
export async function drawLetterhead(
  pdf: PDFDocument,
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  title: string,
  subtitle?: string,
) {
  const logo = await embedCbhLogo(pdf);
  const pageWidth = page.getWidth();
  const bandTop = page.getHeight() - 18;
  const logoHeight = 48;
  const logoWidth = (logo.width / logo.height) * logoHeight;

  page.drawRectangle({
    x: 0,
    y: bandTop - 78,
    width: pageWidth,
    height: 96,
    color: rgb(1, 1, 1),
  });
  page.drawImage(logo, {
    x: 40,
    y: bandTop - 58,
    width: Math.min(logoWidth, 240),
    height: logoHeight,
  });

  const titleX = 40 + Math.min(logoWidth, 240) + 18;
  page.drawText(title, {
    x: titleX,
    y: bandTop - 34,
    size: 14,
    font: fonts.bold,
    color: rgb(0.125, 0.145, 0.16),
  });
  if (subtitle) {
    page.drawText(subtitle, {
      x: titleX,
      y: bandTop - 52,
      size: 11,
      font: fonts.bold,
      color: rgb(0.62, 0.11, 0.12),
    });
  }

  page.drawRectangle({
    x: 0,
    y: bandTop - 78,
    width: pageWidth,
    height: 3,
    color: rgb(0.125, 0.145, 0.16),
  });
  page.drawRectangle({
    x: 0,
    y: bandTop - 81,
    width: pageWidth,
    height: 3,
    color: rgb(0.62, 0.11, 0.12),
  });

  return bandTop - 100;
}
