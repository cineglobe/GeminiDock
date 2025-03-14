import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js to use a bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

/**
 * Convert a PDF file to an array of image data URLs
 * @param file The PDF file to convert
 * @param scale The scale factor for rendering (higher = better quality but larger size)
 * @returns Promise resolving to an array of image data URLs
 */
export async function convertPdfToImages(file: File, scale: number = 1.5): Promise<string[]> {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Create a blob URL for the PDF
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(blobUrl);
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    const images: string[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // Get the viewport at the desired scale
      const viewport = page.getViewport({ scale });
      
      // Create a canvas for rendering
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not create canvas context');
      }
      
      // Set canvas dimensions to match the viewport
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render the page to the canvas
      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
      
      // Convert the canvas to a data URL
      const imageDataUrl = canvas.toDataURL('image/png');
      images.push(imageDataUrl);
    }
    
    // Clean up the blob URL
    URL.revokeObjectURL(blobUrl);
    
    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw error;
  }
}

/**
 * Create file objects from data URLs
 * @param dataUrls Array of data URLs
 * @param fileName Base name for the generated files
 * @returns Array of File objects
 */
export function createFilesFromDataUrls(dataUrls: string[], fileName: string): File[] {
  return dataUrls.map((dataUrl, index) => {
    // Convert data URL to Blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeType });
    
    // Create a File object
    return new File(
      [blob],
      `${fileName}_page_${index + 1}.png`,
      { type: 'image/png' }
    );
  });
} 