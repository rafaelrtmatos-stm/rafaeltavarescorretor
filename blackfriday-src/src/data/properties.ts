export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  image: string;
  size: string;
  description: string;
  features: string[];
}

export const PROPERTIES: Property[] = [
  {
    id: 'campo-novo',
    title: 'Campo Novo',
    location: 'Região de Santarém - PA',
    price: 'R$ 11.000',
    originalPrice: 'R$ 18.000',
    image: '/blackfriday/src/assets/images/property_campo_novo_1795281215921.jpg',
    size: '300m² (10x30)',
    description: 'Terreno plano, excelente localização com acesso facilitado e infraestrutura em desenvolvimento.',
    features: ['Escritura pública', 'Próximo à rodovia', 'Energia elétrica', 'Água encanada']
  },
  {
    id: 'ponte-alta',
    title: 'Ponte Alta',
    location: 'Santarém e Região',
    price: 'R$ 3.000',
    originalPrice: 'R$ 7.500',
    badge: 'OFERTA BLACK FRIDAY',
    image: '/blackfriday/src/assets/images/property_ponte_alta_1795281215876.jpg',
    size: '250m² (10x25)',
    description: 'Oportunidade imperdível da Black Friday! Terreno pronto para construir em área de grande valorização.',
    features: ['Documentação 100%', 'Entrada facilitada', 'Parcelamento próprio', 'Topografia plana']
  },
  {
    id: 'sao-francisco',
    title: 'São Francisco do Carapanari',
    location: 'Santarém - PA',
    price: 'R$ 3.500',
    originalPrice: 'R$ 8.000',
    image: '/blackfriday/src/assets/images/property_sao_francisco_1795281226262.jpg',
    size: '400m² (12x33.3)',
    description: 'Área verde exuberante com vista privilegiada e tranquilidade garantida para sua família.',
    features: ['Natureza preservada', 'Ar puro', 'Fácil acesso', 'Excelente investimento']
  },
  {
    id: 'tapajos-village',
    title: 'Tapajós Village',
    location: 'Santarém - PA',
    price: 'R$ 4.500',
    originalPrice: 'R$ 9.000',
    image: '/blackfriday/src/assets/images/property_tapajos_1795281226658.jpg',
    size: '300m² (10x30)',
    description: 'Loteamento planejado próximo às belezas naturais da região do Tapajós.',
    features: ['Ruas abertas', 'Apenas 15 min do centro', 'Valorização rápida', 'Condições especiais']
  },
  {
    id: 'alter-do-chao',
    title: 'Paraíso Alter do Chão',
    location: 'Alter do Chão - Santarém',
    price: 'R$ 6.000',
    originalPrice: 'R$ 12.000',
    image: '/blackfriday/src/assets/images/property_alter_1795281226569.jpg',
    size: '350m² (12x29)',
    description: 'Próximo à vila balneária mais famosa do Pará. Tenha seu refúgio no Caribe brasileiro.',
    features: ['Perto das praias', 'Turismo em alta', 'Potencial comercial', 'Documentação ok']
  }
];
