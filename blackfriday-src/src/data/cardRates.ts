// Tabela do Mercado Pago Point (crédito, recebimento na hora) de 19/11/2026.
// Cada valor = quanto passar na máquina para receber R$ 10.000,00 líquidos.
const T0 = [10524.10, 11578.84, 11746.75, 11760.48, 12072.02, 12073.08, 12326.54, 12327.60, 12640.19, 12741.58, 12742.63, 12895.77, 12993.98, 13142.89, 13288.63, 13433.31, 13579.05, 13727.95];

export interface Installment {
  n: number;
  total: number;
  parcel: number;
}

export function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
}

export function brl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/ /g, ' ');
}

export function installmentsFor(value: number): Installment[] {
  return T0.map((t, i) => {
    const total = Math.round(value * (t / 10000) * 100) / 100;
    return { n: i + 1, total, parcel: Math.round((total / (i + 1)) * 100) / 100 };
  });
}
