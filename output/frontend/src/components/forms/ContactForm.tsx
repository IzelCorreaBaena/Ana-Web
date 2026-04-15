import { useState, type FormEvent } from 'react';

interface ContactFormProps {
  onSuccess?: () => void;
  /** Destinatario del mailto. Por defecto: hola@anacastellano.com */
  mailtoAddress?: string;
}

interface FormState {
  nombre: string;
  email: string;
  mensaje: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

// Sanitizers: strip disallowed chars on input.
const sanitizeName = (v: string): string =>
  v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s-]/g, '');
const sanitizeText = (v: string): string =>
  v.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ\s,.!?\-'"\n\r]/g, '');

const INITIAL: FormState = { nombre: '', email: '', mensaje: '' };
const DEFAULT_MAILTO = 'hola@anacastellano.com';

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
  mailtoAddress = DEFAULT_MAILTO,
}: ContactFormProps) {
  const [state, setState] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [opened, setOpened] = useState(false);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = validate(state);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    const subject = encodeURIComponent(`Contacto desde la web — ${state.nombre}`);
    const body = encodeURIComponent(
      `Nombre: ${state.nombre}\nEmail: ${state.email}\n\n${state.mensaje}`
    );
    const mailtoUrl = `mailto:${mailtoAddress}?subject=${subject}&body=${body}`;

    setOpened(true);
    window.location.href = mailtoUrl;
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm text-charcoal-500 bg-ivory-50 border border-ivory-200 rounded px-4 py-3">
        Al enviar, se abrirá tu cliente de correo con el mensaje listo para enviar a{' '}
        <strong>{mailtoAddress}</strong>.
      </p>

      {opened && (
        <p className="text-sm text-sage-700 bg-sage-50 border border-sage-200 rounded px-4 py-3">
          Hemos abierto tu cliente de correo. Si no ha aparecido, escríbenos
          directamente a {mailtoAddress}.
        </p>
      )}

      <div className="form-group">
        <label htmlFor="contact-nombre" className="form-label">Nombre *</label>
        <input
          id="contact-nombre"
          type="text"
          autoComplete="name"
          className={`input-field ${errors.nombre ? 'input-error' : ''}`}
          value={state.nombre}
          onChange={(e) => update('nombre', sanitizeName(e.target.value))}
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
          onChange={(e) => update('mensaje', sanitizeText(e.target.value))}
        />
        {errors.mensaje && <p className="form-error">{errors.mensaje}</p>}
      </div>

      <button
        type="submit"
        className="btn-primary btn-lg btn-full inline-flex items-center justify-center gap-3"
      >
        Abrir en mi cliente de correo
      </button>
    </form>
  );
}
