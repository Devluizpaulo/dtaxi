import { FirebaseDate } from '@/types/common';

/**
 * Formata uma data do Firebase para string no formato brasileiro
 * @param data - Data do Firebase (Date, Timestamp, string ou null/undefined)
 * @returns String formatada ou '-' se inválida
 */
export function formatarData(data: FirebaseDate): string {
  if (!data) return '-';
  
  try {
    if (typeof data === 'string') {
      const date = new Date(data);
      return isNaN(date.getTime()) ? data : date.toLocaleDateString('pt-BR');
    }
    
    if (data instanceof Date) {
      return data.toLocaleDateString('pt-BR');
    }
    
    // Timestamp do Firestore
    if (typeof data === 'object' && data !== null && 'toDate' in data) {
      return data.toDate().toLocaleDateString('pt-BR');
    }
    
    return '-';
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '-';
  }
}

/**
 * Formata uma data com hora no formato brasileiro
 * @param data - Data do Firebase
 * @returns String formatada com data e hora
 */
export function formatarDataHora(data: FirebaseDate): string {
  if (!data) return '-';
  
  try {
    let date: Date;
    
    if (typeof data === 'string') {
      date = new Date(data);
      if (isNaN(date.getTime())) return data;
    } else if (data instanceof Date) {
      date = data;
    } else if (typeof data === 'object' && data !== null && 'toDate' in data) {
      date = data.toDate();
    } else {
      return '-';
    }
    
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Erro ao formatar data e hora:', error);
    return '-';
  }
}

/**
 * Converte uma data do Firebase para objeto Date
 * @param data - Data do Firebase
 * @returns Date object ou null se inválida
 */
export function toDate(data: FirebaseDate): Date | null {
  if (!data) return null;
  
  try {
    if (data instanceof Date) return data;
    if (typeof data === 'string') {
      const date = new Date(data);
      return isNaN(date.getTime()) ? null : date;
    }
    if (typeof data === 'object' && data !== null && 'toDate' in data) {
      return data.toDate();
    }
    return null;
  } catch (error) {
    console.warn('Erro ao converter para Date:', error);
    return null;
  }
}