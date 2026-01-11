import puppeteer from 'puppeteer'
import { JWT_CONFIG } from '../config/jwt.js'

export const generateCvPdf = async ({ token, slug, url, localStorageData, fullName, cvReadySelector = '#experiences' }) => {
    if (!token || !url || !localStorageData) {
        throw Object.assign(
            new Error('Paramètres manquants'),
            { status: 400 }
        )
    }

    let browser
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        })

        const page = await browser.newPage()

        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 3
        })

        let domain = process.env.NODE_ENV === 'production' ? '.cvitefait.app' : 'localhost'

        // Configuration du cookie d'authentification
        await page.setCookie({
            name: JWT_CONFIG.cookie.name,
            value: token,
            domain: domain,
            path: '/',
            secure: true,
            httpOnly: false,
            sameSite: 'strict'
        })

        // Écoute de la réponse d'authentification
        const authPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/me') && response.status() === 200,
            { timeout: 10000 }
        )

        await page.goto(url, { waitUntil: 'domcontentloaded' })

        // // Vérification de l'authentification
        await authPromise

        // Injection du localStorage
        await page.evaluate((slug, data) => {
            localStorage.setItem(slug, data)
        }, slug, localStorageData)

        await page.reload({ waitUntil: 'domcontentloaded' })

        // Attente du chargement complet du CV
        await page.waitForSelector(cvReadySelector, {
            timeout: 10000,
            visible: true
        })

        // Attente des polices
        await page.evaluate(() => document.fonts.ready)

        // Configuration du PDF
        await page.evaluate((title) => {
            document.title = title
        }, `CV-${fullName}`)

        await page.emulateMediaType('print')

        const pdfResult = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            metadata: {
                author: 'CVitefait'
            }
        })

        // Conversion en Buffer si nécessaire (Puppeteer peut retourner Uint8Array, ArrayBuffer, etc.)
        let pdfBuffer
        if (Buffer.isBuffer(pdfResult)) {
            pdfBuffer = pdfResult
        } else if (pdfResult instanceof Uint8Array || pdfResult instanceof ArrayBuffer || Array.isArray(pdfResult)) {
            pdfBuffer = Buffer.from(pdfResult)
        } else if (typeof pdfResult === 'string') {
            throw new Error('Puppeteer a retourné une string au lieu d\'un Buffer')
        } else {
            throw new Error(`Puppeteer a retourné un type inattendu: ${typeof pdfResult}`)
        }

        // Vérification du buffer
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('Puppeteer a retourné un buffer vide ou invalide!')
        }

        // Vérifier que c'est bien un PDF valide
        if (pdfBuffer.length < 4 || pdfBuffer[0] !== 0x25 || pdfBuffer[1] !== 0x50 || pdfBuffer[2] !== 0x44 || pdfBuffer[3] !== 0x46) {
            throw new Error('Le PDF généré par Puppeteer est corrompu')
        }

        return pdfBuffer

    } catch (error) {
        if (error.message.includes('waiting for selector')) {
            throw Object.assign(
                new Error('Le CV n\'a pas terminé de charger'),
                { status: 408 }
            )
        }
        throw Object.assign(
            new Error(error.message || 'Erreur lors de la génération du PDF'),
            { status: error.status || 500 }
        )
    } finally {
        if (browser) await browser.close().catch(() => { })
    }
}