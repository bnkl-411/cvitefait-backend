import { createCvService } from '../services/createCv.service.js'
import { findCvBySlugService } from '../services/findCvBySlug.service.js'
import { saveCvService } from '../services/saveCv.service.js'
import { getMyCvService } from '../services/getMyCv.service.js'
import { deleteMyCvService } from '../services/deleteMyCv.service.js'
import { JWT_CONFIG } from '../config/jwt.js'
import jwt from 'jsonwebtoken'

/**
 * POST /api/cv/create
 */
export const createCv = async (req, res, next) => {
    const { firstName, lastName, email } = req.body || {}
    const userId = req.userId

    if (!firstName || !lastName) {
        return res.status(400).json({ error: 'Prénom et nom requis' })
    }

    try {
        const { slug, cvData, updatedAt } = await createCvService({
            userId,
            firstName,
            lastName,
            email
        })

        const token = jwt.sign(
            { userId, slug },
            JWT_CONFIG.secret,
            { expiresIn: JWT_CONFIG.expiresIn }
        )

        res.cookie(
            JWT_CONFIG.cookie.name,
            token,
            JWT_CONFIG.cookie.options
        )

        res.status(201).json({
            slug,
            cvData,
            updatedAt
        })
    } catch (error) {
        next(error)
    }
}

/**
 * GET /api/cv/:slug (public)
 */
export const findCvBySlug = async (req, res, next) => {
    try {
        const { data, updatedAt } = await findCvBySlugService(req.params.slug)

        res.json({
            data,
            updated_at: updatedAt
        })
    } catch (error) {
        next(error)
    }
}

/**
 * POST /api/cv/save
 */
export const saveCv = async (req, res, next) => {
    const { data } = req.body

    if (!data) {
        return res.status(400).json({ error: 'Données du CV requises' })
    }

    try {
        const { updatedAt } = await saveCvService(req.userId, data)

        res.json({
            success: true,
            updatedAt
        })
    } catch (error) {
        next(error)
    }
}

/**
 * GET /api/cv/my/data
 */
export const getMyCv = async (req, res, next) => {
    try {
        const { data, slug, updatedAt } = await getMyCvService(req.userId)

        res.json({
            data,
            slug,
            updated_at: updatedAt ?? null
        })
    } catch (error) {
        next(error)
    }
}

/**
 * DELETE /api/cv/my/data
 */
export const deleteMyCv = async (req, res, next) => {
    try {
        await deleteMyCvService(req.userId)

        res.json({
            success: true,
            message: 'CV supprimé avec succès'
        })
    } catch (error) {
        next(error)
    }
}
