import React, { useState, useMemo } from 'react';
import { doc, setDoc, getDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Praise, MessageDetails, NewPraise } from '../types';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

// Função utilitária para validar telefone brasileiro
function isValidPhone(phone: string): boolean {
  return /^\d{10,11}$/.test(phone.replace(/\D/g, ''));
}

interface UsePraiseOperationsProps {
  praises: Praise[];
  setPraises: React.Dispatch<React.SetStateAction<Praise[]>>;
  searchTerm: string;
  filterStatus: "all" | "pending" | "processed";
  toast: (props: { title: string; description: string; variant?: 'default' | 'destructive' }) => void;
}

export const usePraiseOperations = ({
  praises,
  setPraises,
  searchTerm,
  filterStatus,
  toast
}: UsePraiseOperationsProps) => {
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  const filteredPraises = useMemo(() => {
    return praises.filter(praise => {
      const matchesSearch = 
        praise.driverCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        praise.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        praise.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        praise.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === "pending") return matchesSearch && !praise.isProcessed;
      if (filterStatus === "processed") return matchesSearch && praise.isProcessed;
      return matchesSearch;
    }).sort((a, b) => {
      if (a.isProcessed !== b.isProcessed) {
        return a.isProcessed ? 1 : -1;
      }
      return b.date.getTime() - a.date.getTime();
    });
  }, [praises, searchTerm, filterStatus]);

  const handleSendPraise = async (messageDetails: MessageDetails, praise: Praise) => {
    if (!messageDetails.driverPhone) {
      toast({
        title: "Número de telefone não encontrado",
        description: "Não foi possível encontrar o telefone do motorista.",
        variant: "destructive",
      });
      return false;
    }

    if (!isValidPhone(messageDetails.driverPhone)) {
      toast({
        title: "Telefone inválido",
        description: "O telefone deve conter DDD e ter 10 ou 11 dígitos.",
        variant: "destructive",
      });
      return false;
    }

    const msg = `${messageDetails.customMessage}\n\n${messageDetails.includeOriginalFeedback ? `Elogio recebido: "${praise.message}"` : ''}\n\nPassageiro: ${praise.passengerName}\nParabéns pelo excelente trabalho!\nEquipe D-TAXI`;
    
    window.open(`https://wa.me/55${messageDetails.driverPhone}?text=${encodeURIComponent(msg)}`);

    try {
      const ref = doc(collection(db, 'elogios'), praise.id);
      await setDoc(ref, { status: 'arquivado' }, { merge: true });
      
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const originalData = snap.data();
        await setDoc(doc(collection(db, 'elogios-arquivados'), praise.id), {
          ...originalData,
          status: 'arquivado',
          dataArquivamento: Timestamp.fromDate(new Date())
        }, { merge: true });
      }

      setPraises(prev => prev.map(p => p.id === praise.id ? { ...p, isProcessed: true } : p));
      
      toast({
        title: "Elogio enviado com sucesso!",
        description: `A mensagem foi enviada para o motorista ${messageDetails.driverCode}.`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao arquivar elogio',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleCreatePraise = async (newPraise: NewPraise) => {
    const driver = praises.find(d => d.driverCode === newPraise.driverCode);
    
    if (!driver) {
      toast({
        title: "Motorista não encontrado",
        description: "Não foi possível encontrar o motorista com o código informado.",
        variant: "destructive",
      });
      return false;
    }
    
    const praise: Praise = {
      id: Math.random().toString(36).substring(7),
      driverCode: newPraise.driverCode,
      driverName: driver.driverName,
      passengerName: newPraise.passengerName,
      message: newPraise.message,
      rating: 5,
      date: new Date(),
      isProcessed: false,
      telefone: driver.telefone,
    };
    
    setPraises(prev => [praise, ...prev]);
    
    toast({
      title: "Elogio criado com sucesso!",
      description: "O elogio foi registrado e está pronto para ser enviado.",
    });
    
    return true;
  };

  const generatePraiseCard = async (praise: Praise, cardRef: React.RefObject<HTMLDivElement>) => {
    setIsGeneratingCard(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: null,
          logging: false,
        });
        
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `elogio-motorista-${praise.driverCode}-${format(new Date(), 'dd-MM-yyyy')}.png`;
        link.click();
        
        toast({
          title: "Card gerado com sucesso!",
          description: "A imagem foi baixada para o seu dispositivo.",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar card:", error);
      toast({
        title: "Erro ao gerar card",
        description: "Não foi possível gerar a imagem do card.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCard(false);
    }
  };

  return {
    handleSendPraise,
    handleCreatePraise,
    generatePraiseCard,
    filteredPraises,
    isGeneratingCard
  };
};