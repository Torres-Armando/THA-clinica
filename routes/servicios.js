const express = require('express');
const router = express.Router();
const Servicio = require('../models/Servicio');

// ─────────────────────────────────────────────
//  CREATE — Agregar nuevo servicio
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const servicio = new Servicio(req.body);
    const guardado = await servicio.save();
    res.status(201).json({ success: true, data: guardado });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
});

// ─────────────────────────────────────────────
//  READ — Obtener todos los servicios
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { categoria, disponible, search } = req.query;
    const filtro = {};

    if (categoria) filtro.categoria = categoria;
    if (disponible !== undefined) filtro.disponible = disponible === 'true';
    if (search) {
      filtro.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } },
      ];
    }

    const servicios = await Servicio.find(filtro).sort({ createdAt: -1 });
    res.json({ success: true, count: servicios.length, data: servicios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
//  READ — Obtener un servicio por ID
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) {
      return res
        .status(404)
        .json({ success: false, message: 'Servicio no encontrado' });
    }
    res.json({ success: true, data: servicio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
//  UPDATE — Actualizar un servicio
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!servicio) {
      return res
        .status(404)
        .json({ success: false, message: 'Servicio no encontrado' });
    }
    res.json({ success: true, data: servicio });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
//  DELETE — Eliminar un servicio
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndDelete(req.params.id);
    if (!servicio) {
      return res
        .status(404)
        .json({ success: false, message: 'Servicio no encontrado' });
    }
    res.json({
      success: true,
      message: 'Servicio eliminado correctamente',
      data: servicio,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
