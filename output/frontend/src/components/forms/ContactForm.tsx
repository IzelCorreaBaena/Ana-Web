import { useState, type FormEvent } from 'react';
import { http } from '@services/http';
import { toast } from '@hooks/useToast';
import LoadingSpinner from '@components/ui/LoadingSpinner';

interface ContactFormProps {
  onSuccess?: () => void;
  /** Si se proporciona, fallback a mailto cuando falla el endpoint */
  fallbackEmail?: string;
}

interface FormState {
  nombre: string;
  email: string;
  mensaje: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const INITIAL: FormState = { nombre: '', email: '', mensaje: '' };

function validate(state: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!state.nombre.trim()) errors.nombre = 'Indícanos tu nombre.';
  if (!state.email.trim()) {
    errors.email = 'El email es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.email = 'Introduce un email válido.';
  }
  if (!state.mensaje.trim()) errors.mensaje = 'Escribe un mensaje.';
  return errors;
}

export default function ContactForm({
  onSuccess,
  fallbackEmail,
}: ContactFormProps) {
  const [state, setState] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate(state);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    try {
      await http.post('/contacto', {
        name: state.nombre,
        email: state.email,
        message: state.mensaje,
      });
      setSuccess(true);
      toast.success('Mensaje enviado. ¡Gracias por escribirnos!');
      setState(INITIAL);
      onSuccess?.();
    } catch {
      if (fallbackEmail) {
        const subject = encodeURIComponent(`Contacto desde la web — ${state.nombre}`);
        const body = encodeURIComponent(state.mensaje);
        window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
      } else {
        toast.error('No pudimos enviar tu mensaje. Inténtalo más tarde.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10 px-6 bg-ivory-100 border border-ivory-300 rounded-lg animate-fade-in">
        <h3 className="font-serif text-2xl text-charcoal-900 mb-2">
          Mensaje recibido
        </h3>
        <p className="text-charcoal-700">Te responderemos lo antes posible.</p>
        <button
          type="button"
          className="btn-secondary btn-sm mt-5"
          onClick={() => setSuccess(false)}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="form-group">
        <label htmlFor="contact-nombre" className="form-label">Nombre *</label>
        <input
          id="contact-nombre"
          type="text"
          autoComplete="name"
          className={`input-field ${errors.nombre ? 'input-error' : ''}`}
          value={state.nombre}
          onChange={(e) => update('nombre', e.target.value)}
        />
        {errors.nombre && <p className="form-error">{errors.nombre}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="contact-email" className="form-label">Email *</label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          className={`input-field ${errors.email ? 'input-error' : ''}`}
          value={state.email}
          onChange={(e) => update('email', e.target.value)}
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="contact-mensaje" className="form-label">Mensaje *</label>
        <textarea
          id="contact-mensaje"
          rows={5}
          className={`input-field ${errors.mensaje ? 'input-error' : ''}`}
          value={state.mensaje}
          onChange={(e) => update('mensaje', e.target.value)}
        />
        {errors.mensaje && <p className="form-error">{errors.mensaje}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary btn-lg btn-full inline-flex items-center justify-center gap-3"
      >
        {submitting && <LoadingSpinner size="sm" className="border-white/40 border-t-white" />}
        {submitting ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
