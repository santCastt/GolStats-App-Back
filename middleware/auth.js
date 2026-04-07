// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Buscamos el token en la cabecera (Header) de la petición
    // El estándar es enviarlo así: "Bearer eyJhbGciOi..."
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Si no hay token, le negamos el acceso inmediatamente
    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere iniciar sesión.' });
    }

    try {
        // 3. Si hay token, verificamos que sea auténtico y no haya expirado
        // (Usamos el mismo salvavidas temporal por si el .env sigue dando guerra)
        const secretoParaToken = process.env.JWT_SECRET || 'secreto_temporal_salvavidas_2026';
        
        const decoded = jwt.verify(token, secretoParaToken);
        
        // 4. Guardamos los datos del usuario (id, email, isPremium) en la petición
        // Esto será súper útil más adelante para saber si le mostramos info Premium o no
        req.user = decoded; 
        
        // 5. Todo está en orden, ¡dejamos pasar al usuario!
        next(); 
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado. Vuelve a iniciar sesión.' });
    }
};

module.exports = verifyToken;