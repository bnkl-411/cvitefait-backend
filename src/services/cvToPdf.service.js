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
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage()

        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 3
        })

        // Configuration du cookie d'authentification
        await page.setCookie({
            name: JWT_CONFIG.cookie.name,
            value: token,
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'Lax'
        })

        // Écoute de la réponse d'authentification
        const authPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/me') && response.status() === 200,
            { timeout: 10000 }
        )

        await page.goto(url, { waitUntil: 'domcontentloaded' })

        // Vérification de l'authentification
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

        return await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            metadata: {
                author: 'CVitefait'
            }
        })

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