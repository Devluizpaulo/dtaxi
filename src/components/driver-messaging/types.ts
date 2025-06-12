export interface Praise {
  id: string;
  driverCode: string;
  driverName: string;
  passengerName: string;
  message: string;
  rating: number;
  date: Date;
  isProcessed: boolean;
  telefone?: string;
  email?: string;
}

export interface MessageDetails {
  driverCode: string;
  driverPhone: string;
  customMessage: string;
  includeOriginalFeedback: boolean;
}

export interface NewPraise {
  driverCode: string;
  message: string;
  passengerName: string;
}