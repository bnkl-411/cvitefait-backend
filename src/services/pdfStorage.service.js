import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadsDir = path.join(__dirname, '..', 'uploads')

export const savePdf = async (pdfBuffer, fullName, baseUrl, hash) => {
    if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
        throw new Error('Le buffer PDF n\'est pas valide')
    }

    // Vérifier le header PDF
    const isValidPdf = pdfBuffer.length > 4 &&
        pdfBuffer[0] === 0x25 &&
        pdfBuffer[1] === 0x50 &&
        pdfBuffer[2] === 0x44 &&
        pdfBuffer[3] === 0x46

    if (!isValidPdf) {
        throw new Error('Le buffer PDF est corrompu (header invalide)')
    }

    const safeName = fullName.replace(/\s+/g, '-')
    const fileName = `CV-${safeName}-${hash}.pdf`
    const filePath = path.join(uploadsDir, fileName)

    await fs.mkdir(uploadsDir, { recursive: true })
    await fs.writeFile(filePath, pdfBuffer, { encoding: null })

    const fileUrl = `${baseUrl}/uploads/${fileName}`
    console.log(`[PDF] ✓ Fichier sauvegardé: ${fileUrl}`)

    return fileUrl
}