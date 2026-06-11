/* ═══════════════════════════════════════════════════
   CLÍNICA VIDA SANA — app.js
   CRUD completo contra /api/servicios
   ═══════════════════════════════════════════════════ */

const API = '/api/servicios';
let deleteId = null;

// ─────────────────────────────────────────────
//  UTILIDADES
// ─────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

function formatMXN(n) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(n);
}

function showMessage(msg, type = 'success') {
  const el = $('formMessage');
  el.textContent = msg;
  el.className = `form-message form-message--${type}`;
  el.style.display = 'block';
  setTimeout(() => (el.style.display = 'none'), 4000);
}

// ─────────────────────────────────────────────
//  NAV TOGGLE
// ─────────────────────────────────────────────
$('navToggle').addEventListener('click', () => {
  $('navMenu').classList.toggle('open');
});
document.querySelectorAll('.nav__link').forEach((l) =>
  l.addEventListener('click', () => $('navMenu').classList.remove('open'))
);

// ─────────────────────────────────────────────
//  READ — Cargar lista pública de servicios
// ─────────────────────────────────────────────
async function cargarServicios(params = '') {
  const grid = $('serviciosGrid');
  grid.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Cargando...</p></div>`;

  try {
    const res = await fetch(`${API}${params}`);
    const { data } = await res.json();
    renderServicios(data);
  } catch {
    grid.innerHTML = `<div class="empty-state"><p>⚠️</p><span>No se pudo conectar con el servidor</span></div>`;
  }
}

function renderServicios(lista) {
  const grid = $('serviciosGrid');
  if (!lista || lista.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>🔍</p><span>No se encontraron servicios</span></div>`;
    return;
  }
  grid.innerHTML = lista
    .map(
      (s) => `
    <article class="service-card">
      <div class="service-card__icon">${s.icono || '🏥'}</div>
      <div class="service-card__category">${s.categoria}</div>
      <h3 class="service-card__name">${s.nombre}</h3>
      <p class="service-card__desc">${s.descripcion}</p>
      <div class="service-card__footer">
        <div class="service-card__price">
          ${formatMXN(s.precio)}
          <small> MXN</small>
        </div>
        <span class="badge ${s.disponible ? 'badge--available' : 'badge--unavailable'}">
          ${s.disponible ? '✓ Disponible' : 'No disponible'}
        </span>
      </div>
      <div class="service-card__meta" style="margin-top:10px">
        <span>⏱ ${s.duracion}</span>
      </div>
    </article>`
    )
    .join('');
}

// ─────────────────────────────────────────────
//  READ — Cargar lista en panel admin
// ─────────────────────────────────────────────
async function cargarAdmin() {
  const list = $('adminList');
  list.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  try {
    const res = await fetch(API);
    const { data, count } = await res.json();
    $('adminCount').textContent = count;
    renderAdmin(data);
  } catch {
    list.innerHTML = `<p style="color:var(--danger);padding:16px;">Error al cargar</p>`;
  }
}

function renderAdmin(lista) {
  const list = $('adminList');
  if (!lista || lista.length === 0) {
    list.innerHTML = `<p style="color:var(--slate-400);padding:20px;text-align:center;">Sin servicios registrados</p>`;
    return;
  }
  list.innerHTML = lista
    .map(
      (s) => `
    <div class="admin-item" id="item-${s._id}">
      <span class="admin-item__icon">${s.icono || '🏥'}</span>
      <div class="admin-item__info">
        <div class="admin-item__name">${s.nombre}</div>
        <div class="admin-item__meta">${s.categoria} · ${s.duracion}</div>
      </div>
      <span class="admin-item__price">${formatMXN(s.precio)}</span>
      <div class="admin-item__actions">
        <button class="btn-edit" onclick="editarServicio('${s._id}')">✏️ Editar</button>
        <button class="btn-delete" onclick="confirmarEliminar('${s._id}', '${s.nombre.replace(/'/g, "\\'")}')">🗑️</button>
      </div>
    </div>`
    )
    .join('');
}

// ─────────────────────────────────────────────
//  CREATE / UPDATE — Guardar servicio
// ─────────────────────────────────────────────
async function guardarServicio() {
  const id = $('servicioId').value;

  const nombre     = $('fNombre').value.trim();
  const descripcion = $('fDescripcion').value.trim();
  const categoria  = $('fCategoria').value;
  const precio     = Number($('fPrecio').value);
  const duracion   = $('fDuracion').value.trim() || '30 min';
  const icono      = $('fIcono').value.trim() || '🏥';
  const disponible = $('fDisponible').checked;

  // Validación básica
  if (!nombre || !descripcion || !categoria || !precio) {
    showMessage('Por favor completa todos los campos requeridos (*)', 'error');
    return;
  }

  const payload = { nombre, descripcion, categoria, precio, duracion, icono, disponible };
  const btnGuardar = $('btnGuardar');
  btnGuardar.disabled = true;
  btnGuardar.textContent = id ? 'Actualizando...' : 'Guardando...';

  try {
    const method = id ? 'PUT' : 'POST';
    const url    = id ? `${API}/${id}` : API;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      showMessage(id ? '✅ Servicio actualizado correctamente' : '✅ Servicio agregado correctamente', 'success');
      limpiarFormulario();
      cargarServicios();
      cargarAdmin();
    } else {
      showMessage('❌ ' + (data.message || 'Error al guardar'), 'error');
    }
  } catch {
    showMessage('❌ Error de conexión con el servidor', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = id ? 'Actualizar servicio' : 'Guardar servicio';
  }
}

// ─────────────────────────────────────────────
//  UPDATE — Cargar datos en formulario
// ─────────────────────────────────────────────
async function editarServicio(id) {
  try {
    const res  = await fetch(`${API}/${id}`);
    const { data } = await res.json();

    $('servicioId').value  = data._id;
    $('fNombre').value     = data.nombre;
    $('fDescripcion').value = data.descripcion;
    $('fCategoria').value  = data.categoria;
    $('fPrecio').value     = data.precio;
    $('fDuracion').value   = data.duracion;
    $('fIcono').value      = data.icono;
    $('fDisponible').checked = data.disponible;

    $('formTitle').textContent   = '✏️ Editar servicio';
    $('btnGuardar').textContent  = 'Actualizar servicio';
    $('btnCancelar').style.display = 'inline-flex';

    // Scroll al formulario
    document.querySelector('#admin').scrollIntoView({ behavior: 'smooth' });
  } catch {
    alert('No se pudo cargar el servicio');
  }
}

// ─────────────────────────────────────────────
//  DELETE — Confirmación y eliminación
// ─────────────────────────────────────────────
function confirmarEliminar(id, nombre) {
  deleteId = id;
  $('modalMsg').textContent = `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`;
  $('modalOverlay').style.display = 'flex';

  $('btnConfirmDelete').onclick = async () => {
    try {
      const res = await fetch(`${API}/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        cerrarModal();
        cargarServicios();
        cargarAdmin();
      }
    } catch {
      alert('Error al eliminar');
    }
  };
}

function cerrarModal() {
  $('modalOverlay').style.display = 'none';
  deleteId = null;
}

// Cerrar modal al hacer clic fuera
$('modalOverlay').addEventListener('click', (e) => {
  if (e.target === $('modalOverlay')) cerrarModal();
});

// ─────────────────────────────────────────────
//  LIMPIAR FORMULARIO
// ─────────────────────────────────────────────
function limpiarFormulario() {
  $('servicioId').value  = '';
  $('fNombre').value     = '';
  $('fDescripcion').value = '';
  $('fCategoria').value  = '';
  $('fPrecio').value     = '';
  $('fDuracion').value   = '';
  $('fIcono').value      = '';
  $('fDisponible').checked = true;

  $('formTitle').textContent   = 'Agregar nuevo servicio';
  $('btnGuardar').textContent  = 'Guardar servicio';
  $('btnCancelar').style.display = 'none';
}

// ─────────────────────────────────────────────
//  FILTROS
// ─────────────────────────────────────────────
function filtrarServicios() {
  const search    = $('searchInput').value.trim();
  const categoria = $('categoriaFilter').value;
  const params = [];
  if (search)    params.push(`search=${encodeURIComponent(search)}`);
  if (categoria) params.push(`categoria=${encodeURIComponent(categoria)}`);
  cargarServicios(params.length ? '?' + params.join('&') : '');
}

$('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') filtrarServicios();
});

// ─────────────────────────────────────────────
//  INICIO
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarServicios();
  cargarAdmin();
});
