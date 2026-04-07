// routes/news.js
const express = require('express');
const axios = require('axios');
const verifyToken = require('../middleware/auth'); // Nuestro guardia de seguridad

const router = express.Router();

// Ruta: GET /api/news
// Protegida con verifyToken
router.get('/', verifyToken, async (req, res) => {
    // Leemos el tema que el usuario quiere buscar (ej: ?q=Lakers)
    // Si no envía nada, por defecto buscaremos noticias del FC Barcelona (tu equipo favorito)
    const searchQuery = req.query.q || 'FC Barcelona';

    try {
        const apiKey = process.env.NEWS_API_KEY || '3a9fb8bf5794448fb45becd80a2c9894';
        
        if (!apiKey) {
            console.error("🔥 ERROR: Falta NEWS_API_KEY en el archivo .env");
            return res.status(500).json({ error: 'Configuración de API de noticias incompleta' });
        }

        // Hacemos la petición a NewsAPI pidiendo artículos en español y ordenados por los más recientes
        const response = await axios.get(
            `https://newsapi.org/v2/everything?q=${searchQuery}&language=es&sortBy=publishedAt&apiKey=${apiKey}`
        );

        // Limpiamos la respuesta y enviamos solo los 10 primeros artículos
        const articles = response.data.articles.slice(0, 10).map(article => ({
            title: article.title,
            description: article.description,
            url: article.url, // Link a la noticia completa
            image: article.urlToImage, // Imagen de portada para Ionic
            source: article.source.name, // Nombre del periódico/web
            publishedAt: article.publishedAt
        }));

        res.json({
            message: `Noticias sobre ${searchQuery} obtenidas exitosamente 📰`,
            totalResults: articles.length,
            data: articles
        });

    } catch (error) {
        console.error("🔥 ERROR EN NEWS API:", error.message);
        res.status(500).json({ error: 'Error al conectar con la API de noticias' });
    }
});

module.exports = router;