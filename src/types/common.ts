// Tipo para datas do Firebase
export type FirebaseDate = Date | { toDate(): Date } | string | null | undefined;

// Tipo para documentos com timestamp
export interface TimestampedDocument {
  id: string;
  createdAt?: FirebaseDate;
  updatedAt?: FirebaseDate;
}

// Tipo para filtros comuns
export interface FilterOptions {
  search?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}