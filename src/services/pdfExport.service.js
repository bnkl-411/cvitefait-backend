import pool from '../db/database.js'
import { insertPdfExport, findPdfExportByCvId, updateAccessCount } from '../repositories/pdf.repository.js'

export const createPdfExport = async ({ cvId, r2Key, publicUrl, expiresAt }) => {
    const result = await pool.query(insertPdfExport, [cvId, r2Key, publicUrl, expiresAt])
    return result.rows[0]
}

export const getPdfExportByCvId = async (cvId) => {
    const result = await pool.query(findPdfExportByCvId, [cvId])
    return result.rows[0]
}

export const incrementAccessCount = async (cvId) => {
    const result = await pool.query(updateAccessCount, [cvId])
    return result.rows[0]
}