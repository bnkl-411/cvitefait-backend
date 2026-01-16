import fs from 'fs'
import { JWT_CONFIG } from '../config/jwt.js'
import { generateCvPdf } from '../services/cvToPdf.service.js'
import { savePdf } from '../services/pdfStorage.service.js'
import { inDbCreatePdfExport } from '../services/pdfExport.service.js'
import { generateHash } from '../services/hash.service.js'
// import { getCachedPdfBuffer, cachePdfBuffer } from '../services/pdfCache.service.js'
import { uploadPDF, pdfExists, getPDF } from '../services/r2PdfCache.service.js'
import { getRedisClient } from '../config/redis.js';


export const cvToPdf = async (req, res, next) => {
    const token = req.cookies?.[JWT_CONFIG.cookie.name]
    const { slug, url, localStorage, fullName, action } = req.body

    try {
        console.log(`[PDF] ${new Date().toLocaleString()} - User: ${fullName}, Action: ${action}`)

        // 1. Générer hash et key
        const hash = generateHash(localStorage, url)
        const key = `CV-${fullName.replace(/\s+/g, '-')}-${hash}.pdf`

        let pdfBuffer

        // 2. Vérifier si le fichier existe sur R2
        const existsOnR2 = await pdfExists(key)

        if (existsOnR2) {
            console.log('[PDF] ✓ Cache R2 trouvé')
            const stream = await getPDF(key)
            pdfBuffer = Buffer.from(await stream.transformToByteArray())
        } else {
            console.log('[PDF] Génération du PDF...')
            pdfBuffer = await generateCvPdf({
                token,
                slug,
                url,
                localStorageData: localStorage,
                fullName,
            })
            console.log('[PDF] ✓ Upload sur R2...')
            await uploadPDF(pdfBuffer, key)
        }

        if (action === 'store') {
            const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`

            return res.json({
                url: publicUrl,
                key,
                cached: existsOnR2
            })
        }

        // Action 'download'
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