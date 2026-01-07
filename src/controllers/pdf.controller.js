import fs from 'fs'
import { JWT_CONFIG } from '../config/jwt.js'
import { generateCvPdf } from '../services/cvToPdf.service.js'
import { savePdf } from '../services/pdfStorage.service.js'
import { createPdfExport } from '../services/pdfExport.service.js'
import { generateHash } from '../services/hash.service.js'
// import { getCachedPdfBuffer, cachePdfBuffer } from '../services/pdfCache.service.js'
import { uploadPDF, pdfExists, getPDF } from '../services/r2PdfCache.service.js'
import { getRedisClient } from '../config/redis.js';


export const cvToPdf = async (req, res, next) => {
    const token = req.cookies?.[JWT_CONFIG.cookie.name]
    const { slug, url, localStorage, fullName, action, cvId } = req.body

    try {
        console.log(new Date().toLocaleString())
        console.log(`[PDF] Génération PDF - User: ${fullName}, Action: ${action}`)

        const hash = generateHash(localStorage, url)
        const key = `pdfs/${hash}.pdf`

        let pdfBuffer

        const exists = await pdfExists(key)

        if (!exists) {
            console.log('[PDF] Cache non trouvé, génération avec Puppeteer...')

            pdfBuffer = await generateCvPdf({
                token,
                slug,
                url,
                localStorageData: localStorage,
                fullName,
            })

            console.log('[PDF] ✓ PDF généré')

            await uploadPDF(pdfBuffer, key)
        } else {
            const stream = await getPDF(key)
            pdfBuffer = Buffer.from(await stream.transformToByteArray())
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`
        const fileUrl = await savePdf(
            pdfBuffer,
            fullName,
            baseUrl,
            hash
        )

        if (action === 'store') {
            const r2Key = `CV-${fullName.replace(/\s+/g, '-')}-${hash}.pdf`
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

            if (cvId) {
                await createPdfExport(cvId, r2Key, fileUrl, expiresAt)
            }

            return res.json({ url: fileUrl })
        }

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=CV-${fullName.replace(/\s+/g, '-')}.pdf`,
            'Content-Length': pdfBuffer.length,
        })

        res.end(pdfBuffer)

    } catch (error) {
        console.error('\n========================================')
        console.error('ERREUR GÉNÉRATION PDF')
        console.error('========================================')
        console.error('Message:', error.message)
        console.error('Stack:', error.stack)
        console.error('========================================\n')
        next(error)
    }
}

export const clearPdfCache = async (req, res, next) => {
    try {
        const client = await getRedisClient()

        const keys = await client.keys('pdf:*')

        if (keys.length === 0) {
            return res.json({
                success: true,
                message: 'Aucun cache à supprimer'
            })
        }

        await client.del(keys)

        res.json({
            success: true,
            message: `${keys.length} cache(s) PDF supprimé(s)`,
            deleted: keys
        })

    } catch (error) {
        console.error('Erreur suppression cache:', error)
        next(error)
    }
}