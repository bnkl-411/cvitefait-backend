export const findActiveUserPdf = (client, userId, templateId) => {
    return client.query({
        name: 'find-active-user-pdf',
        text: 'SELECT id, expires_at FROM user_pdfs WHERE user_id = $1 AND pdf_template_id = $2 AND expires_at > NOW()',
        values: [userId, templateId]
    })
}

export const insertPdfExport = (client, { cvId, r2Key, publicUrl, expiresAt }) => {
    return client.query({
        name: 'insert-pdf-export',
        text: `INSERT INTO pdf_exports (cv_id, r2_key, public_url, expires_at)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (cv_id) 
               DO UPDATE SET 
                 r2_key = EXCLUDED.r2_key,
                 public_url = EXCLUDED.public_url,
                 generated_at = CURRENT_TIMESTAMP,
                 expires_at = EXCLUDED.expires_at
               RETURNING *`,
        values: [cvId, r2Key, publicUrl, expiresAt]
    })
}

export const findPdfExportByCvId = (client, cvId) => {
    return client.query({
        name: 'find-pdf-export-by-cv-id',
        text: `SELECT * FROM pdf_exports 
               WHERE cv_id = $1 AND expires_at > CURRENT_TIMESTAMP`,
        values: [cvId]
    })
}

export const updateAccessCount = (client, cvId) => {
    return client.query({
        name: 'update-access-count',
        text: `UPDATE pdf_exports 
               SET access_count = access_count + 1,
                   last_accessed_at = CURRENT_TIMESTAMP
               WHERE cv_id = $1
               RETURNING access_count`,
        values: [cvId]
    })
}