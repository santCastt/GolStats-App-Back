// 1. MODO DETECTIVE: Esto imprimirá en consola qué está pasando con el .env
const dotenvResult = require('dotenv').config();
console.log("🔍 REPORTE DOTENV:", dotenvResult);

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const db = require('./database'); 
const sportsRoutes = require('./routes/sports');
const newsRoutes = require('./routes/news');

const app = express();
const PORT = process.env.PORT || 3000;

// Activar las rutas deportivas bajo el prefijo /api/sports
app.use('/api/sports', sportsRoutes);
app.use('/api/news', newsRoutes);
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API GolStats funcionando ');
});

// Ruta para registrar un nuevo usuario
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos (name, email, password) son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Este correo electrónico ya está registrado' });
          }
          return res.status(500).json({ error: 'Error al guardar en la base de datos' });
        }

        res.status(201).json({ 
          message: 'Usuario creado exitosamente ⚽',
          user: {
            id: this.lastID,
            name: name,
            email: email
          }
        });
      }
    );
  } catch (error) {
    console.error("🔥 ERROR REAL EN EL SERVIDOR:", error);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        detalle: error.message 
    });
  }
}); 

// Ruta de login con generación de JWT
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      try {
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
          return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // 2. SALVAVIDAS TEMPORAL: Usamos una clave de respaldo si el .env falla
        const secretoParaToken = process.env.JWT_SECRET || 'secreto_temporal_salvavidas_2026';

        if (!process.env.JWT_SECRET) {
          console.warn("⚠️ ADVERTENCIA: El .env no cargó. Usando clave secreta de respaldo para no bloquearte.");
        }

        const tokenPayload = {
          id: user.id,
          email: user.email,
          isPremium: user.isPremium
        };

        const token = jwt.sign(
          tokenPayload, 
          secretoParaToken, 
          { expiresIn: '30d' }
        );

        res.json({ 
          message: 'Login exitoso',
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isPremium: user.isPremium
          }
        });
      } catch (error) {
        console.error("🔥 ERROR REAL EN EL LOGIN:", error);
        res.status(500).json({ error: 'Error interno durante el login', detalle: error.message });
      }
    }
  );
});

// RUTA TEMPORAL (Solo para nosotros durante el desarrollo)
// Convertimos a un usuario en Premium pasándole su email
app.put('/api/upgrade-to-premium', (req, res) => {
    const { email } = req.body;

    db.run(
        `UPDATE users SET isPremium = 1 WHERE email = ?`,
        [email],
        function (err) {
            if (err) return res.status(500).json({ error: 'Error en la base de datos' });
            if (this.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
            
            res.json({ message: `¡Éxito! El usuario ${email} ahora es PREMIUM 🏆` });
        }
    );
});
 
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});