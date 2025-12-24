import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateHash } from './hash.service.js' // import du hash

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadsDir = path.join(__dirname, '..', 'uploads')

// Retourne le path si le PDF existe déjà pour ce hash
export const getPdfPathIfExists = async (fullName, hash) => {
    const safeName = fullName.replace(/\s+/g, '-')
    const fileName = `CV-${safeName}-${hash}.pdf`
    const filePath = path.join(uploadsDir, fileName)
    if (fsSync.existsSync(filePath)) {
        return filePath
    }
    return null
}

// Sauvegarde le PDF et retourne l’URL publique
export const savePdf = async (pdfBuffer, fullName, baseUrl, localStorageData, url) => {
    const hash = generateHash(localStorageData, url)
    const safeName = fullName.replace(/\s+/g, '-')
    const fileName = `CV-${safeName}-${hash}.pdf`
    const filePath = path.join(uploadsDir, fileName)

    await fs.mkdir(uploadsDir, { recursive: true })
    await fs.writeFile(filePath, pdfBuffer)

    return `${baseUrl}/uploads/${fileName}`
}
