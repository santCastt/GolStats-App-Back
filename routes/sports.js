// routes/sports.js
const express = require('express');
const axios = require('axios');
const verifyToken = require('../middleware/auth'); // <-- 1. Importamos el guardia
const requirePremium = require('../middleware/premium'); // <-- 2. Importamos el filtro de Premium

const router = express.Router();

// 2. Añadimos "verifyToken" justo en el medio, antes de la función de la ruta
router.get('/teams', verifyToken, async (req, res) => {
    
    const teamName = req.query.name || 'Barcelona';

    try {
        const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${teamName}`);
        
        if (!response.data.teams) {
            return res.status(404).json({ error: `No se encontró información para el equipo: ${teamName}` });
        }

        const teamData = response.data.teams[0];

        res.json({
            message: 'Información obtenida exitosamente 🏆',
            data: {
                id: teamData.idTeam,
                name: teamData.strTeam,
                sport: teamData.strSport,
                league: teamData.strLeague,
                stadium: teamData.strStadium,
                description: teamData.strDescriptionES || teamData.strDescriptionEN,
                badge: teamData.strBadge 
            }
        });

    } catch (error) {
        console.error("🔥 ERROR EN THE SPORTS DB:", error.message);
        res.status(500).json({ error: 'Error al conectar con la API deportiva externa' });
    }
});

// Ruta: GET /api/sports/advanced-stats
// Fíjate cómo ponemos a los DOS guardias en fila
router.get('/advanced-stats', verifyToken, requirePremium, (req, res) => {
    // Si el código llega hasta aquí, es porque el usuario está logueado Y es Premium
    res.json({
        message: "¡Bienvenido a la zona VIP de GolStats! 🌟",
        data: {
            possession: "65%",
            expectedGoals: 2.4,
            heatMapUrl: "https://ejemplo.com/mapa-calor-barcelona.jpg",
            coachNotes: "El equipo está dominando el centro del campo. Se recomienda mantener la presión alta."
        }
    });
});

module.exports = router;