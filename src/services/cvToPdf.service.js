import puppeteer from 'puppeteer'
import { JWT_CONFIG } from '../config/jwt.js'

export const generateCvPdf = async ({ token, url, localStorageData, fullName }) => {
    if (!token || !url) {
        throw Object.assign(
            new Error('Paramètres manquants'),
            { status: 400 }
        )
    }

    let browser
    let page

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        page = await browser.newPage()
        page.setDefaultTimeout(15000)
        page.setDefaultNavigationTimeout(15000)

        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 3
        })

        await browser.setCookie({
            name: JWT_CONFIG.cookie.name,
            value: token,
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'Lax'
        })

        await page.goto(url, { waitUntil: 'domcontentloaded' })

        if (localStorageData) {
            const urlObj = new URL(url)
            const slug = urlObj.pathname.split('/').pop()

            await page.evaluate((slug, data) => {
                localStorage.setItem(slug, data)
            }, slug, localStorageData)

            await page.reload({ waitUntil: 'domcontentloaded' })
        }

        await page.evaluate(() => document.fonts.ready)

        await page.evaluate((title) => {
            document.title = title
        }, `CV-${fullName}`)

        await page.emulateMediaType('print')

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            metadata: {
                author: 'CVitefait'
            }
        })

        return pdfBuffer

    } finally {
        if (page) await page.close().catch(() => { })
        if (browser) await browser.close().catch(() => { })
    }
}
