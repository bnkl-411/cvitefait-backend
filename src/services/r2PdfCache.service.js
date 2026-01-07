import {
    GetObjectCommand,
    PutObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3"

import { r2Client, BUCKET_NAME } from "../config/r2Client.js"

/**
 * Vérifie l’existence du PDF via HEAD (léger, économique)
 * Retourne true / false
 */
export const pdfExists = async (key) => {
    try {
        await r2Client.send(
            new HeadObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            })
        )
        return true
    } catch (err) {
        if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
            return false
        }
        throw err
    }
}

/**
 * Récupère le PDF (suppose qu’il existe)
 */
export const getPDF = async (key) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    })

    const response = await r2Client.send(command)
    return response.Body
}

/**
 * Upload du PDF
 */
export const uploadPDF = async (pdfBuffer, key) => {
    if (!pdfBuffer) {
        throw new Error("Empty PDF buffer")
    }

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
        CacheControl: "public, max-age=31536000",
    })

    await r2Client.send(command)
    return key
}
