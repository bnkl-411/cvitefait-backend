export const errorHandler = (err, req, res, next) => {
    console.error('❌ Erreur:', err);

    // Erreurs Gemini API
    if (err.message?.includes('API key') || err.message?.includes('GEMINI')) {
        return res.status(500).json({
            error: 'Erreur de configuration API'
        });
    }

    // Erreurs de parsing JSON
    if (err instanceof SyntaxError && err.message.includes('JSON')) {
        return res.status(500).json({
            error: 'Erreur de traitement de la réponse IA'
        });
    }

    // Erreurs de validation
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: err.message
        });
    }

    // Erreur générique
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Erreur serveur'
            : err.message
    });
};

export const notFound = (req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.originalUrl
    });
};