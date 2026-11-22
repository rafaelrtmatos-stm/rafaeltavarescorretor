export interface GalleryItem {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  audio?: boolean;
}

export interface PropertyVariant {
  label: string;
  location: string;
  coordinates: string;
  mapUrl: string;
  price: string;
  originalPrice?: string;
}

export interface Property {
  id: string;
  slug: string;
  catalogUrl: string;
  title: string;
  location: string;
  coordinates: string;
  mapUrl: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  image: string;
  gallery?: GalleryItem[];
  size: string;
  description: string;
  features: string[];
  variants?: PropertyVariant[];
}

export const PROPERTIES: Property[] = [
  {
    id: 'ponte-alta',
    slug: 'ponte-alta',
    catalogUrl: '/blackfriday/ponte-alta/',
    title: 'Ponte Alta',
    location: 'Santarém - PA',
    coordinates: '2°31\'42.2"S 54°48\'44.2"W',
    mapUrl: 'https://www.google.com/maps?q=-2.528389,-54.812278',
    price: 'R$ 3.000,00',
    originalPrice: 'R$ 7.500,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/blackfriday/src/assets/images/property_ponte_alta_1795281215876.jpg',
    size: '300m² (10x30)',
    description: 'Oportunidade imperdível da Black Friday! Terreno pronto para construir em área de grande valorização em Ponte Alta.',
    features: ['Documentação 100%', 'Entrada facilitada', 'Parcelamento próprio', 'Topografia plana']
  },
  {
    id: 'sao-francisco-carapanari',
    slug: 'sao-francisco-do-carapanari',
    catalogUrl: '/blackfriday/sao-francisco-do-carapanari/',
    title: 'São Francisco do Carapanari',
    location: 'Santarém - PA',
    coordinates: '-2.445222, -54.842412',
    mapUrl: 'https://www.google.com/maps?q=-2.445222,-54.842412',
    price: 'R$ 3.500,00',
    originalPrice: 'R$ 8.000,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/imagens/sao-francisco-foto1.jpeg',
    gallery: [
      { type: 'image', src: '/imagens/sao-francisco-foto1.jpeg' },
      { type: 'video', src: '/imagens/sao-francisco-video1.mp4', poster: '/imagens/sao-francisco-video1-poster.jpg' }
    ],
    size: '300m² (10x30)',
    description: 'Área verde exuberante com vista privilegiada e tranquilidade garantida para sua família no Carapanari.',
    features: ['Natureza preservada', 'Ar puro', 'Fácil acesso', 'Excelente investimento']
  },
  {
    id: 'pajucara',
    slug: 'pajucara',
    catalogUrl: '/blackfriday/pajucara/',
    title: 'Pajuçara',
    location: 'Santarém - PA',
    coordinates: '2°26\'35.5"S 54°49\'44.2"W',
    mapUrl: 'https://www.google.com/maps?q=-2.443194,-54.828944',
    price: 'R$ 4.000,00',
    originalPrice: 'R$ 8.500,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/imagens/pajuca-foto1.jpeg',
    gallery: [
      { type: 'image', src: '/imagens/pajuca-foto1.jpeg' },
      { type: 'image', src: '/imagens/pajuca-foto4.jpeg' },
      { type: 'image', src: '/imagens/pajuca-foto5.jpeg' },
      { type: 'video', src: '/imagens/pajuca-video1.mp4', poster: '/imagens/pajuca-video1-poster.jpg' }
    ],
    size: '300m² (10x30)',
    description: 'Terreno em Pajuçara com ótimo acesso, próximo à natureza e em região de crescimento contínuo.',
    features: ['Fácil acesso', 'Área tranquila', 'Documentação regularizada', 'Ótimo custo-benefício']
  },
  {
    id: 'cucuruna',
    slug: 'cucuruna',
    catalogUrl: '/blackfriday/cucuruna/',
    title: 'Cucurunã',
    location: 'Santarém - PA',
    coordinates: '2°27\'47.8"S 54°47\'42.1"W',
    mapUrl: 'https://www.google.com/maps?q=-2.463278,-54.795028',
    price: 'R$ 5.000,00',
    originalPrice: 'R$ 10.000,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/imagens/cucuruna-foto4.jpg',
    gallery: [
      { type: 'image', src: '/imagens/cucuruna-foto4.jpg' },
      { type: 'image', src: '/imagens/cucuruna-foto5.jpeg' },
      { type: 'video', src: '/imagens/cucuruna-video1.mp4', poster: '/imagens/cucuruna-video1-poster.jpg' },
      { type: 'video', src: '/imagens/cucuruna-video2.mp4', poster: '/imagens/cucuruna-video2-poster.jpg' }
    ],
    size: '300m² (10x30)',
    description: 'Terreno localizado no Cucurunã, setor em franca expansão urbana com excelente potencial de valorização.',
    features: ['Expansão urbana', 'Ruas abertas', 'Alto potencial de valorização', 'Parcelamento facilitado']
  },
  {
    id: 'santa-maria',
    slug: 'santa-maria',
    catalogUrl: '/blackfriday/santa-maria/',
    title: 'Santa Maria',
    location: 'Santarém - PA',
    coordinates: '2°27\'17.0"S 54°49\'40.8"W',
    mapUrl: 'https://www.google.com/maps?q=-2.454722,-54.828000',
    price: 'R$ 5.000,00 e R$ 6.000,00',
    originalPrice: 'R$ 10.000,00 e R$ 12.000,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/imagens/santa-maria-obra-1.jpeg',
    gallery: [
      { type: 'image', src: '/imagens/santa-maria-obra-1.jpeg' },
      { type: 'image', src: '/imagens/santa-maria-obra-2.jpeg' },
      { type: 'image', src: '/imagens/santa-maria-obra-4.jpeg' },
      { type: 'image', src: '/imagens/santa-maria-obra-5.jpeg' },
      { type: 'video', src: '/imagens/santa-maria-video1.mp4', poster: '/imagens/santa-maria-video1-poster.jpg' }
    ],
    size: '300m² (10x30)',
    description: 'Dois terrenos na região de Santa Maria, cada um com sua localização e seu valor de Black Friday. Escolha o seu, ideal para moradia ou investimento.',
    features: ['Região consolidada', 'Boa vizinhança', 'Acesso rápido', 'Documentação em ordem', 'Pronto para construir', 'Condição Black Friday'],
    variants: [
      {
        label: 'Terreno 1',
        location: 'Santarém - PA',
        coordinates: '2°27\'17.0"S 54°49\'40.8"W',
        mapUrl: 'https://www.google.com/maps?q=-2.454722,-54.828000',
        price: 'R$ 5.000,00',
        originalPrice: 'R$ 10.000,00'
      },
      {
        label: 'Terreno 2',
        location: 'Santarém - PA',
        coordinates: '2°27\'17.5"S 54°48\'38.6"W',
        mapUrl: 'https://www.google.com/maps?q=-2.454861,-54.810722',
        price: 'R$ 6.000,00',
        originalPrice: 'R$ 12.000,00'
      }
    ]
  },
  {
    id: 'alter-do-chao',
    slug: 'alter-do-chao',
    catalogUrl: '/blackfriday/alter-do-chao/',
    title: 'Alter do Chão',
    location: 'Alter do Chão - Santarém - PA',
    coordinates: '2°31\'39.3"S 54°56\'20.9"W',
    mapUrl: 'https://www.google.com/maps?q=-2.527583,-54.939139',
    price: 'R$ 6.000,00',
    originalPrice: 'R$ 12.000,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/imagens/alter-do-chao-1.jpeg',
    gallery: [
      { type: 'image', src: '/imagens/alter-do-chao-1.jpeg' },
      { type: 'image', src: '/imagens/alter-do-chao-2.jpeg' },
      { type: 'image', src: '/imagens/alter-do-chao-3.jpeg' }
    ],
    size: '300m² (10x30)',
    description: 'Próximo à vila balneária mais famosa do Pará. Garanta seu espaço no Caribe brasileiro com condição de Black Friday.',
    features: ['Perto das praias', 'Turismo em alta', 'Potencial comercial', 'Documentação ok']
  },
  {
    id: 'rocinha',
    slug: 'rocinha',
    catalogUrl: '/blackfriday/rocinha/',
    title: 'Rocinha',
    location: 'Santarém - PA',
    coordinates: '2°28\'17.5"S 54°49\'42.3"W',
    mapUrl: 'https://www.google.com/maps?q=-2.471528,-54.828417',
    price: 'R$ 6.000,00',
    originalPrice: 'R$ 11.500,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/imagens/rocinha-1.jpeg',
    gallery: [
      { type: 'image', src: '/imagens/rocinha-1.jpeg' },
      { type: 'image', src: '/imagens/rocinha-2.jpeg' },
      { type: 'image', src: '/imagens/rocinha-3.jpeg' },
      { type: 'video', src: '/imagens/rocinha-video1.mp4', poster: '/imagens/rocinha-video1-poster.jpg', audio: true }
    ],
    size: '300m² (10x30)',
    description: 'Terreno localizado na Rocinha, área tranquila e bem posicionada com condições especiais de lançamento.',
    features: ['Terreno plano', 'Região valorizada', 'Fácil acesso', 'Negociação direta']
  },
  {
    id: 'tipizal',
    slug: 'tipizal',
    catalogUrl: '/blackfriday/tipizal/',
    title: 'Tipizal',
    location: 'Santarém - PA',
    coordinates: '2°36\'51.5"S 54°36\'27.3"W',
    mapUrl: 'https://www.google.com/maps?q=-2.614306,-54.607583',
    price: 'R$ 6.000,00',
    originalPrice: 'R$ 11.000,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/imagens/tipizal-1.jpeg',
    gallery: [
      { type: 'image', src: '/imagens/tipizal-1.jpeg' },
      { type: 'image', src: '/imagens/tipizal-2.jpeg' }
    ],
    size: '300m² (10x30)',
    description: 'Excelente área no Tipizal cercada pela natureza, ideal para chácara, lazer ou investimento de longo prazo.',
    features: ['Contato com a natureza', 'Amplo espaço', 'Tranquilidade total', 'Condições especiais']
  },
  {
    id: 'mararu',
    slug: 'mararu',
    catalogUrl: '/blackfriday/mararu/',
    title: 'Mararu',
    location: 'Santarém - PA',
    coordinates: '2°29\'48.1"S 54°41\'37.3"W',
    mapUrl: 'https://www.google.com/maps?q=-2.496694,-54.693694',
    price: 'R$ 8.000,00',
    originalPrice: 'R$ 14.500,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/imagens/mararu-black-1.jpeg',
    gallery: [
      { type: 'image', src: '/imagens/mararu-black-1.jpeg' },
      { type: 'image', src: '/imagens/mararu-black-2.jpeg' },
      { type: 'image', src: '/imagens/mararu-black-3.jpeg' }
    ],
    size: '300m² (10x30)',
    description: 'Terreno no Mararu, um dos vetores de maior crescimento de Santarém, com acesso rápido à Rodovia Fernando Guilhon.',
    features: ['Alta valorização', 'Acesso pavimentado próximo', 'Infraestrutura completa', 'Documentação ok']
  },
  {
    id: 'campo-novo',
    slug: 'campo-novo',
    catalogUrl: '/blackfriday/campo-novo/',
    title: 'Campo Novo',
    location: 'Santarém - PA',
    coordinates: '2°28\'56.1"S 54°47\'52.8"W',
    mapUrl: 'https://www.google.com/maps?q=-2.482250,-54.798000',
    price: 'R$ 11.000,00',
    originalPrice: 'R$ 18.000,00',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/imagens/campo-novo-foto1.jpeg',
    gallery: [
      { type: 'image', src: '/imagens/campo-novo-foto1.jpeg' },
      { type: 'image', src: '/imagens/campo-novo-foto2.jpeg' },
      { type: 'video', src: '/imagens/campo-novo-video1.mp4', poster: '/imagens/campo-novo-video1-poster.jpg' }
    ],
    size: '300m² (10x30)',
    description: 'Terreno plano em Campo Novo, excelente localização com acesso facilitado e infraestrutura em desenvolvimento.',
    features: ['Escritura pública', 'Próximo à rodovia', 'Energia elétrica', 'Água encanada']
  }
];

export function buildLocationWhatsAppUrl(property: Pick<Property, 'title' | 'price'>): string {
  const cleanPrice = property.price.replace(/^R\$\s*/i, '').trim();
  const message = `Olá! Quero receber a localização do terreno ${property.title}, no valor de R$ ${cleanPrice}, da Black Friday.`;
  return `https://wa.me/5593992332012?text=${encodeURIComponent(message)}`;
}

export function buildVariantLocationWhatsAppUrl(property: Pick<Property, 'title'>, variant: PropertyVariant): string {
  return buildLocationWhatsAppUrl({ title: `${property.title} (${variant.label})`, price: variant.price });
}

export function findPropertyByPath(pathname: string): Property | null {
  const cleaned = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!cleaned.startsWith('blackfriday/')) return null;
  const sub = cleaned.slice('blackfriday/'.length).split('/')[0];
  if (!sub) return null;
  if (sub === 'santa-maria-1' || sub === 'santa-maria-2') {
    return PROPERTIES.find((p) => p.slug === 'santa-maria') || null;
  }
  return PROPERTIES.find((p) => p.slug === sub || p.id === sub) || null;
}
