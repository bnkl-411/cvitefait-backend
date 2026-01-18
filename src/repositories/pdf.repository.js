// repositories/pdf.repository.js
import pool from '../db/database.js'

export const findActiveUserPdf = (userId, templateId) => {
    return pool.query(
        `SELECT id, expires_at 
     FROM user_pdfs 
     WHERE user_id = $1 
       AND pdf_template_id = $2 
       AND expires_at > NOW()`,
        [userId, templateId]
    )
}
export const insertPdfExport = ({ cvId, r2Key, publicUrl, expiresAt }) => {
    const expires = expiresAt
        ? new Date(expiresAt)
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 an à partir de maintenant

    return pool.query(
        `INSERT INTO pdf_exports (cv_id, r2_key, public_url, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (cv_id) 
         DO UPDATE SET 
           r2_key = EXCLUDED.r2_key,
           public_url = EXCLUDED.public_url,
           generated_at = CURRENT_TIMESTAMP,
           expires_at = EXCLUDED.expires_at
         RETURNING *`,
        [cvId, r2Key, publicUrl, expires]
    )
}

export const findPdfExportByCvId = (cvId) => {
    return pool.query(
        `SELECT * FROM pdf_exports 
     WHERE cv_id = $1 AND expires_at > CURRENT_TIMESTAMP`,
        [cvId]
    )
}

export const updateAccessCount = (cvId) => {
    return pool.query(
        `UPDATE pdf_exports 
     SET access_count = access_count + 1,
         last_accessed_at = CURRENT_TIMESTAMP
     WHERE cv_id = $1
     RETURNING access_count`,
        [cvId]
    )
}
