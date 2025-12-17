//parseService.js

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Parse un fichier CV (PDF ou DOCX) et extrait le texte brut
 * @param {Object} file - Fichier Multer (avec buffer)
 * @returns {Promise<string>} - Texte brut extrait
 */
export async function parseCV(file) {
  try {
    const buffer = file.buffer;
    const mimeType = file.mimetype;
    
    // Parser PDF
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    }
    
    // Parser DOCX
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    
    throw new Error('Format de fichier non supporté. Utilisez PDF ou DOCX.');
    
  } catch (error) {
    console.error('Parse error:', error);
    throw new Error(`Erreur de parsing: ${error.message}`);
  }
}