import { useEffect, useState } from 'react';
import { servicesApi } from '@services/services.api';
import type { Servicio } from '@types/models';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

type ModalMode = 'createService' | 'editService' | 'manageBlocks' | null;

export default function AdminServices() {
  const { success, error: toastError } = useToast();
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Servicio | null>(null);
  const [saving, setSaving] = useState(false);

  // Form servicio
  const [formS, setFormS] = useState({ titulo: '', descripcion: '' });
  // Form bloque
  const [formB, setFormB] = useState({ titulo: '', descripcion: '', orden: 1 });

  const fetchServices = () => {
    setLoading(true);
    servicesApi.list()
      .then((data) => setServices(data))
      .catch(() => toastError('Error al cargar servicios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setFormS({ titulo: '', descripcion: '' });
    setSelected(null);
    setModal('createService');
  };

  const openEdit = (s: Servicio) => {
    setFormS({ titulo: s.titulo, descripcion: s.descripcion });
    setSelected(s);
    setModal('editService');
  };

  const openBlocks = (s: Servicio) => {
    setSelected(s);
    setFormB({ titulo: '', descripcion: '', orden: (s.bloques.length + 1) });
    setModal('manageBlocks');
  };

  const saveService = async () => {
    if (!formS.titulo.trim()) return;
    setSaving(true);
    try {
      if (modal === 'createService') {
        await servicesApi.create({ titulo: formS.titulo, descripcion: formS.descripcion });
        success('Servicio creado correctamente');
      } else if (selected) {
        await servicesApi.update(selected.id, { titulo: formS.titulo, descripcion: formS.descripcion });
        success('Servicio actualizado');
      }
      setModal(null);
      fetchServices();
    } catch {
      toastError('Error al guardar el servicio');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('¿Eliminar este servicio? Esta acción no se puede deshacer.')) return;
    try {
      await servicesApi.remove(id);
      success('Servicio eliminado');
      fetchServices();
    } catch {
      toastError('No se puede eliminar. Puede tener reservas activas.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-800">Servicios</h1>
          <p className="text-charcoal-500 mt-1 font-sans text-sm">{services.length} servicios publicados</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Nuevo servicio
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-sm border border-ivory-200">
          <p className="text-charcoal-400 font-sans mb-4">No hay servicios creados aún.</p>
          <button onClick={openCreate} className="btn-primary text-sm">Crear primer servicio</button>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-sm border border-ivory-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-serif text-xl text-charcoal-800">{s.titulo}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${s.activo ? 'bg-sage-100 text-sage-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-charcoal-500 text-sm leading-relaxed">{s.descripcion}</p>
                  <p className="text-xs text-charcoal-400 mt-2 font-sans">{s.bloques.length} bloques</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openBlocks(s)}
                    className="text-xs px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 transition-colors font-sans"
                  >
                    Bloques
                  </button>
                  <button
                    onClick={() => openEdit(s)}
                    className="text-xs px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 transition-colors font-sans"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteService(s.id)}
                    className="text-xs px-3 py-1.5 rounded border border-red-100 text-red-500 hover:bg-red-50 transition-colors font-sans"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {s.bloques.length > 0 && (
                <div className="mt-4 pt-4 border-t border-ivory-100">
                  <div className="flex flex-wrap gap-2">
                    {s.bloques.map((b) => (
                      <span key={b.id} className="text-xs bg-ivory-100 text-charcoal-600 px-3 py-1 rounded-full font-sans">
                        {b.titulo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar servicio */}
      <Modal
        isOpen={modal === 'createService' || modal === 'editService'}
        onClose={() => setModal(null)}
        title={modal === 'createService' ? 'Nuevo servicio' : 'Editar servicio'}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Título *</label>
            <input
              className="input-field"
              value={formS.titulo}
              onChange={(e) => setFormS({ ...formS, titulo: e.target.value })}
              placeholder="Ej: Diseño Floral Personalizado"
            />
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              value={formS.descripcion}
              onChange={(e) => setFormS({ ...formS, descripcion: e.target.value })}
              placeholder="Descripción del servicio..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={saveService} disabled={saving || !formS.titulo.trim()} className="btn-primary flex-1">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </div>
      </Modal>

      {/* Modal gestionar bloques */}
      <Modal
        isOpen={modal === 'manageBlocks'}
        onClose={() => setModal(null)}
        title={`Bloques de "${selected?.titulo ?? ''}"`}
      >
        {selected && (
          <div className="space-y-6">
            {/* Lista bloques existentes */}
            {selected.bloques.length === 0 ? (
              <p className="text-charcoal-400 text-sm font-sans text-center py-4">Sin bloques todavía.</p>
            ) : (
              <ul className="space-y-2">
                {selected.bloques.map((b) => (
                  <li key={b.id} className="flex items-center justify-between p-3 bg-ivory-50 rounded text-sm">
                    <div>
                      <span className="font-medium text-charcoal-700">{b.titulo}</span>
                      {b.descripcion && <span className="text-charcoal-400 ml-2">— {b.descripcion}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Añadir bloque */}
            <div className="border-t border-ivory-100 pt-4 space-y-3">
              <p className="text-xs uppercase tracking-wider text-charcoal-400 font-sans">Añadir bloque</p>
              <input
                className="input-field"
                placeholder="Título del bloque *"
                value={formB.titulo}
                onChange={(e) => setFormB({ ...formB, titulo: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Descripción"
                value={formB.descripcion}
                onChange={(e) => setFormB({ ...formB, descripcion: e.target.value })}
              />
              <button
                disabled={!formB.titulo.trim()}
                className="btn-primary w-full text-sm"
                onClick={() => {
                  // TODO: llamar a blocksApi.create cuando esté implementado en el api service
                  toastError('API de bloques pendiente de integración');
                }}
              >
                Añadir bloque
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
