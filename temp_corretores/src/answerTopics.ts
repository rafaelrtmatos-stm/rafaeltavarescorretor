export interface AnswerTopic {
  key: string;
  label: string;
  hint: string;
}

// Áreas fixas de resposta: aparecem em TODO empreendimento.
// O admin preenche o texto de cada uma e o corretor só copia.
export const ANSWER_TOPICS: AnswerTopic[] = [
  { key: 'primeiro-contato', label: 'Primeiro contato / quanto custa?', hint: 'Entrada, parcela inicial, localização em uma frase e uma pergunta. Use {nome} onde vai o nome de quem copia (ex.: Aqui é o {nome}).' },
  { key: 'localizacao', label: 'Localização', hint: 'Referências, distância, link do mapa e convite para visitar.' },
  { key: 'preco', label: 'Preço e formas de pagamento', hint: 'Planos, entrada, parcelas e valor do lote.' },
  { key: 'reajuste', label: 'Reajuste e amortização', hint: 'Como a parcela é reajustada e como o cliente pode amortizar.' },
  { key: 'diferenciais', label: 'Diferenciais (por que vale a pena)', hint: 'Pode construir, entorno, documentação, energia.' },
  { key: 'objecoes', label: 'Objeções (está caro, vou pensar, é seguro...)', hint: 'Uma resposta para cada objeção comum.' },
  { key: 'visita', label: 'Convite para visita', hint: 'Convite com proposta de dia e horário.' },
  { key: 'fechamento', label: 'Fechamento / reserva', hint: 'Valor da reserva e como garantir o lote.' },
];

// {nome} no texto vira o nome do corretor que está copiando.
export const fillName = (text: string, name?: string): string => {
  const clean = (name || '').replace(/\s*\(admin\)\s*$/i, '').trim();
  return text.replace(/\{nome\}/gi, clean || '[seu nome]');
};
