import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const storePdf = async (pdfBuffer, fullName, baseUrl) => {
    const filename = `CV-${fullName}-${Date.now()}.pdf`
    const uploadsDir = path.join(__dirname, '..', 'uploads')
    const filepath = path.join(uploadsDir, filename)

    await fs.mkdir(uploadsDir, { recursive: true })
    await fs.writeFile(filepath, pdfBuffer)

    return `${baseUrl}/uploads/${filename}`
}