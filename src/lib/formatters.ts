// === Utilitários de formatação para o sistema ===

/** Formata valor monetário em BRL */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/** Formata data para exibição brasileira */
export function formatarData(dataStr: string): string {
  const data = new Date(dataStr + 'T00:00:00');
  return data.toLocaleDateString('pt-BR');
}

/** Calcula dias restantes até uma data */
export function diasRestantes(dataStr: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataStr + 'T00:00:00');
  const diff = alvo.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Retorna texto descritivo dos dias restantes */
export function textoUrgencia(dataStr: string): string {
  const dias = diasRestantes(dataStr);
  if (dias < 0) return 'Vencido';
  if (dias === 0) return 'Hoje!';
  if (dias === 1) return 'Amanhã';
  if (dias <= 3) return `${dias} dias - Urgente`;
  if (dias <= 7) return `${dias} dias`;
  return `${dias} dias`;
}
