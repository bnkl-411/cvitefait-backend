import pool from '../db/database.js'
import { findCvByUserId } from '../repositories/cv.repository.js'

export const getMyCvService = async (userId) => {
    const result = await findCvByUserId(pool, userId)
    const cv = result.rows[0]

    if (!cv) {
        return {
            data: null,
            slug: null
        }
    }

    return {
        data: cv.data,
        slug: cv.slug,
        updatedAt: cv.updated_at
    }
}
