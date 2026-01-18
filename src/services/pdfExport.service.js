import { findActiveUserPdf, insertPdfExport, findPdfExportByCvId, updateAccessCount } from '../repositories/pdf.repository.js'

export const inDbCreatePdfExport = async ({ cvId, r2Key, publicUrl }) => {
    const result = await insertPdfExport({ cvId, r2Key, publicUrl })
    return result.rows[0]
}

export const inDbFindActiveUserPdf = async (userId, templateId) => {
    const result = await findActiveUserPdf(userId, templateId)
    return result.rows
}

export const inDbFindPdfExportByCvId = async (cvId) => {
    const result = await findPdfExportByCvId(cvId)
    return result.rows[0]
}

export const inDbUpdateAccessCount = async (cvId) => {
    const result = await updateAccessCount(cvId)
    return result.rows[0]?.access_count
}
