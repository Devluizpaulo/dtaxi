export function formatarData(data: any) {
  if (!data) return '-';
  if (typeof data === 'string') {
    // Tenta converter string ISO
    const d = new Date(data);
    return isNaN(d.getTime()) ? data : d.toLocaleDateString('pt-BR');
  }
  if (typeof data === 'object' && typeof data.toDate === 'function') {
    return data.toDate().toLocaleDateString('pt-BR');
  }
  return '-';
} 