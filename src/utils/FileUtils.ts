import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

// Helper: Read text from a .txt file
const readTxtFile = async (file: File): Promise<string> => {
  return await file.text();
};

// Helper: Extract text from .docx file using Mammoth
const readDocxFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

// Helper: Extract text from PDF pages with OCR fallback for image-based pages
const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Extract text from page items
    const textItems = content.items.filter(
      (item: any) => item.str && typeof item.str === 'string'
    );
    const text = textItems.map((item: any) => item.str).join(' ');

    if (text.trim().length < 10) {
      // If not enough text, render page to canvas and do OCR
      const canvas = document.createElement('canvas');
      const viewport = page.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      if (!context) continue;

      await page.render({ canvasContext: context, viewport }).promise;

      const imageDataUrl = canvas.toDataURL('image/png');
      const ocrResult = await Tesseract.recognize(imageDataUrl, 'eng');
      fullText += '\n' + ocrResult.data.text;
    } else {
      fullText += '\n' + text;
    }
  }

  return fullText.trim();
};

// Master handler: Detect file type and use the right parser
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith('.txt')) return await readTxtFile(file);
    if (fileName.endsWith('.docx')) return await readDocxFile(file);
    if (fileName.endsWith('.pdf')) return await extractTextFromPdf(file);

    return 'Unsupported file type.';
  } catch (error) {
    console.error(`Error processing ${file.name}:`, error);
    return 'Failed to extract content.';
  }
};
