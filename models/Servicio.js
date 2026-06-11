const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del servicio es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar 100 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [500, 'La descripción no puede superar 500 caracteres'],
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: [
        'Consulta General',
        'Especialidades',
        'Cirugía',
        'Urgencias',
        'Laboratorio',
        'Imagen',
        'Rehabilitación',
        'Odontología',
      ],
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    duracion: {
      type: String,
      default: '30 min',
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    icono: {
      type: String,
      default: '🏥',
    },
  },
  {
    timestamps: true,
    collection: 'servicios',
  }
);

module.exports = mongoose.model('Servicio', servicioSchema);
