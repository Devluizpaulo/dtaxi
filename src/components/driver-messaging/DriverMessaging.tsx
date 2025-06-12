import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Praise } from './types';
import { DriverMessagingHeader } from './components/DriverMessagingHeader';
import { DriverMessagingFilters } from './components/DriverMessagingFilters';
import { PraiseGrid } from './components/PraiseGrid';
import { CreatePraiseDialog } from './components/CreatePraiseDialog';
import { PraiseDetailsDialog } from './components/PraiseDetailsDialog';
import { SendMessageDialog } from './components/SendMessageDialog';
import { PraiseCardPreview } from './components/PraiseCardPreview';
import { usePraiseOperations } from './hooks/usePraiseOperations';

const DriverMessaging = () => {
  const { toast } = useToast();
  const [praises, setPraises] = useState<Praise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "processed">("all");
  const [selectedPraise, setSelectedPraise] = useState<Praise | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCardPreviewOpen, setIsCardPreviewOpen] = useState(false);

  const {
    handleSendPraise,
    handleCreatePraise,
    generatePraiseCard,
    filteredPraises
  } = usePraiseOperations({
    praises,
    setPraises,
    searchTerm,
    filterStatus,
    toast
  });

  useEffect(() => {
    const fetchPraises = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'elogios'));
        const snap = await getDocs(q);
        
        const elogios = snap.docs.map(docSnap => {
          const data = docSnap.data();
          const driverCode = data.vehiclePrefix || '';
          
          return {
            id: docSnap.id,
            driverCode: driverCode,
            driverName: `Motorista ${driverCode}`, // Nome genérico baseado no código
            passengerName: data.name || 'Passageiro não informado', // Nome do passageiro que fez o elogio
            message: data.message || 'Mensagem não informada',
            rating: 5,
            date: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            isProcessed: data.status === 'arquivado',
            telefone: data.phone || '',
            email: data.email || '',
          };
        });
        setPraises(elogios);
      } catch (error) {
        console.error('Erro ao carregar elogios:', error);
        toast({
          title: "Erro ao carregar elogios",
          description: "Não foi possível carregar os elogios.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPraises();
  }, [toast]);

  const openSendDialog = (praise: Praise) => {
    setSelectedPraise(praise);
    setIsSendDialogOpen(true);
  };

  const openDetailsDialog = (praise: Praise) => {
    setSelectedPraise(praise);
    setIsDetailsDialogOpen(true);
  };

  const openCardPreview = (praise: Praise) => {
    console.log('Dados do elogio para preview:', praise); // Debug
    setSelectedPraise(praise);
    setIsCardPreviewOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <DriverMessagingHeader onCreateClick={() => setIsCreateDialogOpen(true)} />
      
      <DriverMessagingFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        praises={praises}
      />
      
      <PraiseGrid
        praises={filteredPraises}
        loading={loading}
        onSendClick={openSendDialog}
        onDetailsClick={openDetailsDialog}
        onCardPreviewClick={openCardPreview}
      />
      
      <CreatePraiseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreatePraise={handleCreatePraise}
        existingPraises={praises}
      />
      
      <PraiseDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        praise={selectedPraise}
        onSendClick={openSendDialog}
        onCardPreviewClick={openCardPreview}
      />
      
      <SendMessageDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        praise={selectedPraise}
        onSendPraise={handleSendPraise}
      />
      
      <PraiseCardPreview
        open={isCardPreviewOpen}
        onOpenChange={setIsCardPreviewOpen}
        praise={selectedPraise}
        onGenerateCard={generatePraiseCard}
      />
    </div>
  );
};

export default DriverMessaging;