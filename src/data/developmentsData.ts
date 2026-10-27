import { Development, RentalProperty } from '../types';

export const developments: Development[] = [
  {
    id: 'mararu',
    slug: 'mararu',
    title: 'Bairro Mararu',
    subtitle: 'Mararu Ville · Santarém, PA',
    location: 'Bairro Mararu, Santarém - PA',
    city: 'Santarém',
    badge: 'Lançamento Oficial',
    heroImage: '/imagens/mararu-hero-loteamento.jpg',
    entrancePrice: 'R$ 600',
    installmentPrice: 'R$ 255,56',
    totalLots: 376,
    description: 'Realize o sonho da casa própria no Mararu Ville. Lotes com infraestrutura completa, entrada facilitada e parcelas que cabem no seu bolso em Santarém, PA.',
    features: [
      'Infraestrutura completa com ruas demarcadas',
      'Localização em expansão e valorização garantida',
      'Entrada de R$ 600 facilitada',
      'Sem burocracia e direto com a imobiliária'
    ],
    pricingPlans: [
      {
        title: 'Lote Padrão · 376 Lotes',
        total: 'R$ 23.000,00',
        entrance: 'R$ 600,00',
        installment: '80x de R$ 255,56'
      }
    ],
    gallery: [
      '/imagens/mararu-foto1.jpg',
      '/imagens/mararu-foto2.jpeg',
      '/imagens/mararu-foto3.jpg',
      '/imagens/mararu-foto4.jpg',
      '/imagens/mararu-foto5.jpg'
    ],
    videos: ['/imagens/mararu-video1.mov', '/imagens/mararu-video2.mov'],
    whatsappMessage: 'Olá Rafael! Gostaria de saber mais informações sobre o loteamento Bairro Mararu (Mararu Ville).'
  },
  {
    id: 'bela-vista-mararu',
    slug: 'bela-vista-mararu',
    title: 'Bela Vista do Mararu',
    subtitle: 'Loteamento em Santarém, PA',
    location: 'Bairro Mararu, Santarém - PA',
    city: 'Santarém',
    badge: 'Destaque de Vendas',
    heroImage: '/imagens/bela-vista-mararu-hero-v2.jpg',
    entrancePrice: 'R$ 600',
    installmentPrice: 'R$ 194,45',
    totalLots: 450,
    description: 'Localização privilegiada no Mararu com vista panorâmica e excelente índice de valorização. Garanta seu lote com entrada de R$ 600.',
    features: [
      'Vista privilegiada e ambiente arborizado',
      'Próximo a vias de acesso rápido',
      'Planos de pagamento flexíveis até 120x',
      'Desconto especial para pagamento à vista'
    ],
    pricingPlans: [
      {
        title: 'Lotes até 300 m²',
        total: 'R$ 46.600,00',
        entrance: 'R$ 600,00',
        installment: '120x de R$ 383,33'
      },
      {
        title: 'Lotes acima de 300 m² / Esquina',
        total: 'R$ 52.000,00',
        entrance: 'R$ 600,00',
        installment: '120x de R$ 428,00'
      }
    ],
    gallery: [
      '/imagens/bela-vista-mararu-foto3.jpg',
      '/imagens/bela-vista-mararu-capa.jpg'
    ],
    whatsappMessage: 'Olá Rafael! Tenho interesse no loteamento Bela Vista do Mararu.'
  },
  {
    id: 'alenquer',
    slug: 'alenquer',
    title: 'Jardim Alenquer',
    subtitle: 'Bairro Grande Vitória · Estrada da Praia de Uruxi · Alenquer, PA',
    location: 'Estrada da Praia de Uruxi, Alenquer - PA',
    city: 'Alenquer',
    badge: 'Novo Lançamento',
    heroImage: '/imagens/alenquer-obra-7.jpeg',
    entrancePrice: 'R$ 500',
    installmentPrice: 'R$ 200',
    totalLots: 1150,
    description: 'Novo lançamento em Bairro Grande Vitória · Estrada da Praia de Uruxi · Alenquer, PA. A apenas 1,5 km da praia com entrada a partir de R$ 500.',
    features: [
      'Apenas 1,5 km da Praia de Uruxi',
      'Entrada única de R$ 500',
      'Parcelas a partir de R$ 200',
      'Quem chega primeiro garante os melhores lotes'
    ],
    pricingPlans: [
      {
        title: 'Lote Padrão 10 × 30 m²',
        total: 'R$ 16.500,00',
        entrance: 'R$ 500,00',
        installment: '80x de R$ 200,00'
      }
    ],
    gallery: [
      '/imagens/alenquer-obra-1.jpeg',
      '/imagens/alenquer-obra-2.jpeg',
      '/imagens/alenquer-obra-3.jpeg',
      '/imagens/alenquer-obra-4.jpeg',
      '/imagens/alenquer-obra-7.jpeg'
    ],
    whatsappMessage: 'Olá Rafael! Quero garantir meu lote no Jardim Alenquer.'
  },
  {
    id: 'cucuruna',
    slug: 'cucuruna',
    title: 'Cucurunã',
    subtitle: 'Empreendimento Vitória Régia · Santarém, PA',
    location: 'Cucurunã — Ramal dos Coelhos, Santarém - PA',
    city: 'Santarém',
    badge: 'Vitória Régia',
    heroImage: '/imagens/cucuruna-foto4.jpg',
    entrancePrice: 'R$ 500',
    installmentPrice: 'R$ 312,50',
    totalLots: 280,
    description: 'Empreendimento Vitória Régia, em Cucurunã — Ramal dos Coelhos, Santarém, PA. Entrada de R$ 500 e 80 parcelas de R$ 312,50.',
    features: [
      'Localização em Cucurunã · Ramal dos Coelhos',
      'Excelente oportunidade para morar ou investir',
      'Entrada de R$ 500,00',
      '80 parcelas fixas'
    ],
    pricingPlans: [
      {
        title: 'Lote Vitória Régia',
        total: 'R$ 25.500,00',
        entrance: 'R$ 500,00',
        installment: '80x de R$ 312,50'
      }
    ],
    gallery: [
      '/imagens/cucuruna-foto2.jpg',
      '/imagens/cucuruna-foto3.jpg',
      '/imagens/cucuruna-foto4.jpg'
    ],
    whatsappMessage: 'Olá Rafael! Tenho interesse no empreendimento Vitória Régia em Cucurunã.'
  },
  {
    id: 'espirito-santo',
    slug: 'espirito-santo',
    title: 'Bairro Espírito Santo',
    subtitle: 'Loteamento em Santarém, PA',
    location: 'Bairro Espírito Santo, Santarém - PA',
    city: 'Santarém',
    badge: 'Lançamento',
    heroImage: '/imagens/espirito-santo-hero.jpg',
    entrancePrice: 'R$ 2.000',
    installmentPrice: 'R$ 312,50',
    totalLots: 320,
    description: 'Realize o sonho da casa própria no Bairro Espírito Santo. Entrada de R$ 2.000 e parcelas acessíveis em Santarém, PA.',
    features: [
      'Infraestrutura de qualidade',
      'Opções de lotes Tipo 1, Tipo 2 e Tipo 3',
      'Descontos especiais para pagamento à vista'
    ],
    pricingPlans: [
      {
        title: 'Tipo 1',
        total: 'R$ 42.000,00',
        entrance: 'R$ 2.000,00',
        installment: '80x de R$ 500,00 (À vista: R$ 35.000)'
      },
      {
        title: 'Tipo 2',
        total: 'R$ 37.000,00',
        entrance: 'R$ 2.000,00',
        installment: '80x de R$ 437,50 (À vista: R$ 30.000)'
      },
      {
        title: 'Tipo 3',
        total: 'R$ 27.000,00',
        entrance: 'R$ 2.000,00',
        installment: '80x de R$ 312,50 (À vista: R$ 22.000)'
      }
    ],
    gallery: [
      '/imagens/espirito-santo-foto2.jpg',
      '/imagens/espirito-santo-hero.jpg'
    ],
    whatsappMessage: 'Olá Rafael! Gostaria de informações sobre o Bairro Espírito Santo.'
  },
  {
    id: 'monte-alegre',
    slug: 'monte-alegre',
    title: 'Jussaramia',
    subtitle: 'Empreendimento em Monte Alegre, PA',
    location: 'Monte Alegre - PA',
    city: 'Monte Alegre',
    badge: 'Monte Alegre',
    heroImage: '/imagens/monte-alegre-hero.jpg',
    entrancePrice: 'R$ 600',
    installmentPrice: 'R$ 257',
    totalLots: 658,
    description: 'Realize o sonho da casa própria no Jussaramia em Monte Alegre, PA. Lotes com entrada de R$ 600 e excelentes condições.',
    features: [
      'Localização privilegiada em Monte Alegre',
      'Entrada facilitada a partir de R$ 600',
      'Disponibilidade em tempo real'
    ],
    pricingPlans: [
      {
        title: 'Lote Padrão Jussaramia',
        total: 'R$ 25.000,00',
        entrance: 'R$ 600,00',
        installment: '80x de R$ 300,00'
      }
    ],
    gallery: [
      '/imagens/monte-alegre-foto1.jpg',
      '/imagens/monte-alegre-foto2.jpg',
      '/imagens/monte-alegre-hero.jpg'
    ],
    whatsappMessage: 'Olá Rafael! Tenho interesse no loteamento Jussaramia em Monte Alegre.'
  },
  {
    id: 'pajucara',
    slug: 'pajucara',
    title: 'Pajuçara',
    subtitle: 'Loteamento em Santarém, PA',
    location: 'Pajuçara, Santarém - PA',
    city: 'Santarém',
    badge: 'Lançamento',
    heroImage: '/imagens/pajuca-foto1.jpeg',
    entrancePrice: 'R$ 600',
    installmentPrice: 'R$ 255,56',
    totalLots: 300,
    description: 'Loteamento Pajuçara em Santarém. Infraestrutura garantida, entrada de R$ 600 e parcelas acessíveis.',
    features: [
      'Região em forte crescimento',
      'Entrada facilitada',
      'Condições diretas com o corretor'
    ],
    pricingPlans: [
      {
        title: 'Lote Pajuçara',
        total: 'R$ 23.000,00',
        entrance: 'R$ 600,00',
        installment: '80x de R$ 255,56'
      }
    ],
    gallery: [
      '/imagens/pajuca-foto1.jpeg',
      '/imagens/pajuca-foto2.jpeg',
      '/imagens/pajuca-foto3.jpeg'
    ],
    whatsappMessage: 'Olá Rafael! Quero saber mais sobre o loteamento Pajuçara.'
  },
  {
    id: 'santa-maria',
    slug: 'santa-maria',
    title: 'Santa Maria',
    subtitle: 'Loteamento em Santarém, PA',
    location: 'Santa Maria, Santarém - PA',
    city: 'Santarém',
    badge: 'Oportunidade',
    heroImage: '/imagens/hero-santa-maria.png',
    entrancePrice: 'R$ 600',
    installmentPrice: 'R$ 255,56',
    totalLots: 250,
    description: 'Lotes no Bairro Santa Maria com obras em andamento e alta valorização.',
    features: [
      'Obras avançadas',
      'Localização estratégica',
      'Facilidade na aprovação'
    ],
    pricingPlans: [
      {
        title: 'Lote Santa Maria',
        total: 'R$ 23.000,00',
        entrance: 'R$ 600,00',
        installment: '80x de R$ 255,56'
      }
    ],
    gallery: [
      '/imagens/santa-maria-obra-1.jpeg',
      '/imagens/santa-maria-obra-2.jpeg',
      '/imagens/santa-maria-obra-3.jpeg'
    ],
    whatsappMessage: 'Olá Rafael! Gostaria de detalhes sobre o Santa Maria.'
  },
  {
    id: 'sao-braz',
    slug: 'sao-braz',
    title: 'São Braz',
    subtitle: 'Loteamento em Santarém, PA',
    location: 'São Braz, Santarém - PA',
    city: 'Santarém',
    badge: 'Lançamento',
    heroImage: '/imagens/sao-braz-hero.jpg',
    entrancePrice: 'R$ 600',
    installmentPrice: 'R$ 255,56',
    totalLots: 300,
    description: 'Loteamento São Braz com excelente infraestrutura e condições imperdíveis.',
    features: [
      'Área planejada',
      'Entrada acessível',
      'Parcelamento facilitado'
    ],
    pricingPlans: [
      {
        title: 'Lote São Braz',
        total: 'R$ 23.000,00',
        entrance: 'R$ 600,00',
        installment: '80x de R$ 255,56'
      }
    ],
    gallery: [
      '/imagens/sao-braz-foto2.jpg',
      '/imagens/sao-braz-foto3.jpg',
      '/imagens/sao-braz-foto4.jpg'
    ],
    whatsappMessage: 'Olá Rafael! Tenho interesse no loteamento São Braz.'
  }
];

export const rentalProperties: RentalProperty[] = [
  {
    id: 'r1',
    title: 'Casa — Av. Maracanã, nº 1149',
    bairro: 'Santarém · Maracanã',
    price: 'R$ 3.500',
    type: 'casa',
    status: 'disponivel',
    specs: ['3 Quartos', 'Suíte', 'Garagem', 'Área de Serviço'],
    mapsUrl: 'https://maps.google.com/?q=Av+Maracan%C3%A3+1149+Santar%C3%A9m+PA'
  },
  {
    id: 'r2',
    title: 'Apartamento — Centro, Ed. Tapajós',
    bairro: 'Santarém · Centro',
    price: 'R$ 2.800',
    type: 'apto',
    status: 'disponivel',
    specs: ['2 Quartos', 'Varanda', 'Elevador', 'Garagem Coberta'],
    mapsUrl: 'https://maps.google.com/?q=Centro+Santar%C3%A9m+PA'
  },
  {
    id: 'r3',
    title: 'Ponto Comercial — Av. Rui Barbosa',
    bairro: 'Santarém · Prainha',
    price: 'R$ 5.000',
    type: 'comercial',
    status: 'disponivel',
    specs: ['Salão Amplo', '2 Banheiros', 'Excelente Localização Comercial'],
    mapsUrl: 'https://maps.google.com/?q=Av+Rui+Barbosa+Santar%C3%A9m+PA'
  }
];
