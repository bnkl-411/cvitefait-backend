import fs from 'fs'
import { JWT_CONFIG } from '../config/jwt.js'
import { generateCvPdf } from '../services/cvToPdf.service.js'
import { getPdfPathIfExists, savePdf } from '../services/pdfStorage.service.js'
import { createPdfExport } from '../services/pdfExport.service.js'
import { generateHash } from '../services/hash.service.js'

export const cvToPdf = async (req, res, next) => {
    const token = req.cookies?.[JWT_CONFIG.cookie.name]
    const { slug, url, localStorage, fullName, action, cvId } = req.body

    try {
        const hash = generateHash(localStorage, url)

        let pdfBuffer
        let cachedPdfPath = await getPdfPathIfExists(fullName, hash)

        // if (cachedPdfPath) {
        //     pdfBuffer = fs.readFileSync(cachedPdfPath)
        // } else {
        pdfBuffer = await generateCvPdf({
            token,
            slug,
            url,
            localStorageData: localStorage,
            fullName
        })
        // }

        const baseUrl = `${req.protocol}://${req.get('host')}`
        const fileUrl = await savePdf(pdfBuffer, fullName, baseUrl, localStorage, url)

        if (action === 'store') {
            const r2Key = `CV-${fullName.replace(/\s+/g, '-')}-${hash}.pdf`
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

            // On sauvegarde en base seulement si cvId est fourni
            if (cvId) {
                console.log(cvId);
                await createPdfExport(cvId, r2Key, fileUrl, expiresAt)
            }

            return res.json({ url: fileUrl })
        }

        // Sinon, téléchargement direct du PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=CV-${fullName.replace(/\s+/g, '-')}.pdf`,
            'Content-Length': pdfBuffer.length
        })
        res.send(pdfBuffer)

    } catch (error) {
        console.error('Erreur génération PDF :', error)
        next(error)
    }
}