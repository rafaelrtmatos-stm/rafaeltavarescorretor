export interface Development {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  city: string;
  badge: string;
  heroImage: string;
  entrancePrice: string;
  installmentPrice: string;
  totalLots: number;
  description: string;
  features: string[];
  pricingPlans: {
    title: string;
    total: string;
    entrance: string;
    installment: string;
    details?: string;
  }[];
  gallery: string[];
  videos?: string[];
  mapEmbedUrl?: string;
  whatsappMessage: string;
}

export interface RentalProperty {
  id: string;
  title: string;
  bairro: string;
  price: string;
  type: 'casa' | 'apto' | 'comercial';
  status: 'disponivel' | 'alugado';
  image?: string;
  specs: string[];
  mapsUrl: string;
}

export interface Lead {
  id: string;
  created_at: string;
  nome: string;
  telefone: string;
  email?: string;
  empreendimento: string;
  empreendimento_slug: string;
  origem_url: string;
  objetivo?: string;
  planejamento_compra?: string;
  forma_pagamento?: string;
  quer_visitar?: boolean;
  data_visita?: string;
  periodo_visita?: string;
  status: string;
  observacao?: string;
}
