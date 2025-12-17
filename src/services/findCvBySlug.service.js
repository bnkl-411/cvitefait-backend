import pool from '../db/database.js'
import { findCvBySlug } from '../repositories/cv.repository.js'

export const findCvBySlugService = async (slug) => {
    const result = await findCvBySlug(pool, slug)
    const cv = result.rows[0]

    if (!cv) {
        throw Object.assign(
            new Error('CV non trouvé'),
            { status: 404 }
        )
    }

    return {
        data: cv.data,
        updatedAt: cv.updated_at
    }
}
