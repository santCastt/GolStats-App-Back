// middleware/premium.js

const requirePremium = (req, res, next) => {
    // Verificamos si en la petición viene el usuario y si su propiedad isPremium es 1 (true)
    if (req.user && req.user.isPremium === 1) {
        next(); // Tiene el pase VIP, lo dejamos pasar a la ruta
    } else {
        // No es Premium, le bloqueamos el paso educadamente
        res.status(403).json({ 
            error: 'Acceso denegado', 
            message: 'Esta estadística es exclusiva para usuarios Premium. ¡Mejora tu cuenta para ver más!' 
        });
    }
};

module.exports = requirePremium;