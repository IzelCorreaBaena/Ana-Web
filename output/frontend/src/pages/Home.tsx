import { Link } from 'react-router-dom';
import HeroSection from '../components/ui/HeroSection';
import SectionHeader from '../components/ui/SectionHeader';
import ServiceCard from '../components/ui/ServiceCard';
import ReviewCard from '../components/ui/ReviewCard';

interface PreviewService {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

interface PreviewReview {
  id: string;
  author: string;
  role: string;
  text: string;
}

const featuredServices: readonly PreviewService[] = [
  {
    id: 'bodas',
    name: 'Bodas',
    description: 'Diseño floral integral para el día más importante: ramos de novia, ceremonia y banquete.',
  },
  {
    id: 'eventos',
    name: 'Eventos privados',
    description: 'Ambientación floral para celebraciones íntimas, cumpleaños y aniversarios memorables.',
  },
  {
    id: 'corporativo',
    name: 'Eventos corporativos',
    description: 'Decoración floral profesional para presentaciones, galas e inauguraciones.',
  },
  {
    id: 'espacios',
    name: 'Espacios y comercios',
    description: 'Composiciones recurrentes para hoteles, restaurantes y boutiques de marca.',
  },
];

const testimonials: readonly PreviewReview[] = [
  {
    id: 't1',
    author: 'Lucía & Mario',
    role: 'Boda en Finca El Mirador',
    text: 'Ana entendió nuestra visión desde el primer encuentro. Cada arreglo era una pequeña obra de arte, y los invitados aún hablan del ramo de novia.',
  },
  {
    id: 't2',
    author: 'Carolina Méndez',
    role: 'Aniversario familiar',
    text: 'Trabajar con Ana es trabajar con una verdadera artista. Cuidó cada detalle y consiguió un ambiente cálido, sofisticado y muy personal.',
  },
  {
    id: 't3',
    author: 'Hotel Casa Botánica',
    role: 'Decoración semanal',
    text: 'Llevamos más de dos años confiando en Ana para las flores del lobby. Su sensibilidad estética y su compromiso son excepcionales.',
  },
];

export default function Home(): JSX.Element {
  return (
    <>
      <HeroSection
        title="Flores que cuentan tu historia"
        subtitle="Diseño floral artístico para bodas, eventos y espacios únicos"
        primaryCta={{ label: 'Reserva tu cita', to: '/reservations' }}
        secondaryCta={{ label: 'Ver servicios', to: '/services' }}
      />

      {/* Quién soy */}
      <section className="section bg-ivory-50">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="aspect-square w-full rounded-2xl bg-sage-100 shadow-sm" aria-hidden />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage-600 mb-4">Quién soy</p>
            <h2 className="mb-6">Ana Castellano</h2>
            <p className="text-charcoal-700 mb-4">
              Soy florista por vocación y artesana del detalle. Llevo más de una década dando forma a
              historias a través de las flores: desde bodas íntimas en el campo hasta grandes
              celebraciones corporativas.
            </p>
            <p className="text-charcoal-700 mb-8">
              Cada proyecto comienza con una conversación. Escuchar lo que sueñas es el primer paso
              para componer algo que solo pueda ser tuyo.
            </p>
            <Link to="/about" className="btn-ghost">
              Conoce mi historia
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios destacados */}
      <section className="section bg-ivory-100">
        <div className="container-page">
          <SectionHeader
            eyebrow="Mis Servicios"
            title="Arte floral para cada momento"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 mt-12">
            {featuredServices.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                imageUrl={service.imageUrl}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services" className="btn-primary">
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="section bg-ivory-100">
        <div className="container-page">
          <SectionHeader
            eyebrow="Testimonios"
            title="Lo que dicen quienes ya confiaron en mí"
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3 mt-12">
            {testimonials.map((review) => (
              <ReviewCard
                key={review.id}
                author={review.author}
                role={review.role}
                text={review.text}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-sage-600 py-20">
        <div className="container-page text-center text-ivory-50">
          <h2 className="text-ivory-50 mb-6">¿Lista para crear algo único juntas?</h2>
          <p className="text-ivory-100 max-w-content mx-auto mb-8">
            Cuéntame tu idea y diseñemos juntas la propuesta floral que merece tu evento.
          </p>
          <Link to="/reservations" className="btn-gold">
            Reservar ahora
          </Link>
        </div>
      </section>
    </>
  );
}
