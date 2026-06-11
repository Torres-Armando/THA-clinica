require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
//  Middlewares
// ─────────────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
//  Conexión a MongoDB Atlas
// ─────────────────────────────────────────────
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://THA:tha123@ac-ytxbucx-shard-00-00.zbrdfdk.mongodb.net:27017,ac-ytxbucx-shard-00-01.zbrdfdk.mongodb.net:27017,ac-ytxbucx-shard-00-02.zbrdfdk.mongodb.net:27017/?ssl=true&replicaSet=atlas-jbqz0a-shard-0&authSource=admin&appName=proyectofinal';

mongoose
  .connect(MONGODB_URI, {
    dbName: 'hospital_clinica',
  })
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas correctamente');
    seedInitialData();
  })
  .catch((err) => {
    console.error('❌ Error al conectar con MongoDB:', err.message);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado');
});

// ─────────────────────────────────────────────
//  Rutas API
// ─────────────────────────────────────────────
app.use('/api/servicios', require('./routes/servicios'));

// Ruta de salud para Render
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Sirve el index.html para cualquier otra ruta (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────
//  Datos iniciales de ejemplo (seed)
// ─────────────────────────────────────────────
async function seedInitialData() {
  try {
    const Servicio = require('./models/Servicio');
    const count = await Servicio.countDocuments();
    if (count === 0) {
      const serviciosIniciales = [
        {
          nombre: 'Consulta Médica General',
          descripcion:
            'Atención primaria con médicos certificados para diagnóstico y tratamiento de enfermedades comunes.',
          categoria: 'Consulta General',
          precio: 350,
          duracion: '30 min',
          disponible: true,
          icono: '🩺',
        },
        {
          nombre: 'Cardiología',
          descripcion:
            'Especialistas en salud del corazón con tecnología de vanguardia para diagnóstico y tratamiento cardiovascular.',
          categoria: 'Especialidades',
          precio: 800,
          duracion: '45 min',
          disponible: true,
          icono: '❤️',
        },
        {
          nombre: 'Cirugía Laparoscópica',
          descripcion:
            'Procedimientos quirúrgicos mínimamente invasivos con recuperación rápida y mínimo dolor postoperatorio.',
          categoria: 'Cirugía',
          precio: 15000,
          duracion: '2-4 hrs',
          disponible: true,
          icono: '🔬',
        },
        {
          nombre: 'Urgencias 24/7',
          descripcion:
            'Atención de emergencias las 24 horas del día, los 365 días del año con personal altamente capacitado.',
          categoria: 'Urgencias',
          precio: 500,
          duracion: 'Variable',
          disponible: true,
          icono: '🚨',
        },
        {
          nombre: 'Laboratorio Clínico',
          descripcion:
            'Análisis clínicos completos: sangre, orina, cultivos y más, con resultados en el mismo día.',
          categoria: 'Laboratorio',
          precio: 200,
          duracion: '20 min',
          disponible: true,
          icono: '🧪',
        },
        {
          nombre: 'Resonancia Magnética',
          descripcion:
            'Imágenes de alta resolución para diagnóstico preciso de tejidos blandos, cerebro y columna vertebral.',
          categoria: 'Imagen',
          precio: 3500,
          duracion: '1 hr',
          disponible: true,
          icono: '📡',
        },
      ];
      await Servicio.insertMany(serviciosIniciales);
      console.log('🌱 Datos iniciales insertados en MongoDB');
    }
  } catch (err) {
    console.error('Error en seed:', err.message);
  }
}

// ─────────────────────────────────────────────
//  Iniciar servidor
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🏥 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
});
