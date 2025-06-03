import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  SendHorizontal, 
  Search, 
  MessageSquare, 
  User, 
  Phone, 
  Award,
  CheckCircle,
  Star,
} from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

// Definir tipo explícito para elogio
interface Praise {
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

// Função utilitária para validar telefone brasileiro (10 ou 11 dígitos, só números)
function isValidPhone(phone: string) {
  return /^\d{10,11}$/.test(phone.replace(/\D/g, ''));
}

const DriverMessaging = () => {
  const { toast } = useToast();
  const [praises, setPraises] = useState<Praise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPraise, setSelectedPraise] = useState<Praise | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSendingOpen, setIsSendingOpen] = useState(false);
  const [messageDetails, setMessageDetails] = useState({
    driverCode: "",
    driverPhone: "",
    customMessage: "",
    includeOriginalFeedback: true,
  });
  const [isCreateMessageOpen, setIsCreateMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    driverCode: "",
    message: "",
  });
  const [selectedPraiseDetails, setSelectedPraiseDetails] = useState<Praise | null>(null);

  useEffect(() => {
    const fetchPraises = async () => {
      setLoading(true);
      const q = query(collection(db, 'elogios'), where('tipo', '==', 'Elogio'));
      const snap = await getDocs(q);
      const elogios = snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          driverCode: data.prefixo || '',
          driverName: data.nome || '',
          passengerName: '-',
          message: data.mensagem || '',
          rating: 5,
          date: data.dataEnvio?.toDate ? data.dataEnvio.toDate() : new Date(),
          isProcessed: data.status === 'arquivado',
          telefone: data.telefone || '',
          email: data.email || '',
        };
      });
      setPraises(elogios);
      setLoading(false);
    };
    fetchPraises();
  }, []);

  const filteredPraises = praises.filter(praise => 
    praise.driverCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    praise.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    praise.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    praise.message.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Sort by processed status first, then by date
    if (a.isProcessed !== b.isProcessed) {
      return a.isProcessed ? 1 : -1;
    }
    return b.date.getTime() - a.date.getTime();
  });

  const handleSendPraise = async () => {
    if (!messageDetails.driverPhone) {
      toast({
        title: "Número de telefone não encontrado",
        description: "Não foi possível encontrar o telefone do motorista. Verifique o código informado.",
        variant: "destructive",
      });
      return;
    }
    if (!isValidPhone(messageDetails.driverPhone)) {
      toast({
        title: "Telefone inválido",
        description: "O telefone deve conter DDD e ter 10 ou 11 dígitos.",
        variant: "destructive",
      });
      return;
    }
    // Envio via WhatsApp (abre link)
    const msg = `${messageDetails.customMessage}\n\n${selectedPraise && messageDetails.includeOriginalFeedback ? `Elogio recebido: \"${selectedPraise.message}\"` : ''}\n\nPassageiro: ${maskPassengerName(selectedPraise?.passengerName)}\nParabéns pelo excelente trabalho!\nEquipe D-TAXI`;
    window.open(`https://wa.me/55${messageDetails.driverPhone}?text=${encodeURIComponent(msg)}`);
    // Arquivar elogio no Firestore
    if (selectedPraise) {
      try {
        // Atualiza status para arquivado
        const ref = doc(collection(db, 'reclamacoes'), selectedPraise.id);
        await setDoc(ref, { status: 'arquivado' }, { merge: true });
        // Copia para reclamacoes-arquivadas
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const originalData = snap.data();
          await setDoc(doc(collection(db, 'reclamacoes-arquivadas'), selectedPraise.id), {
            ...originalData,
            status: 'arquivado',
            dataArquivamento: Timestamp.fromDate(new Date())
          }, { merge: true });
        }
        // Atualiza lista local
        setPraises(prev => prev.map(p => p.id === selectedPraise.id ? { ...p, isProcessed: true } : p));
    toast({
          title: "Elogio enviado e arquivado!",
      description: `A mensagem foi enviada para o motorista ${messageDetails.driverCode}.`,
    });
      } catch (err) {
        toast({
          title: 'Erro ao arquivar elogio',
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      }
    }
    setIsSendingOpen(false);
    setSelectedPraise(null);
    setMessageDetails({
      driverCode: "",
      driverPhone: "",
      customMessage: "",
      includeOriginalFeedback: true,
    });
  };

  const handleCreateNewMessage = () => {
    // Find the driver by code
    const driver = praises.find(d => d.driverCode === newMessage.driverCode);
    
    if (!driver) {
      toast({
        title: "Motorista não encontrado",
        description: "Não foi possível encontrar o motorista com o código informado.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new praise entry
    const newPraise = {
      id: Math.random().toString(36).substring(7),
      driverCode: newMessage.driverCode,
      driverName: driver.driverName,
      passengerName: "Equipe D-TAXI", // Since this is created by admin
      message: newMessage.message,
      rating: 5,
      date: new Date(),
      isProcessed: false,
      telefone: driver.telefone,
    };
    
    setPraises([...praises, newPraise]);
    
    toast({
      title: "Elogio criado com sucesso!",
      description: "O elogio foi registrado e está pronto para ser enviado.",
    });
    
    setIsCreateMessageOpen(false);
    setNewMessage({
      driverCode: "",
      message: "",
    });
  };

  const openSendDialog = (praise: Praise | null = null) => {
    if (praise) {
      // Find driver phone by code
      const driver = praises.find(d => d.driverCode === praise.driverCode);
      
      setSelectedPraise(praise);
      setMessageDetails({
        driverCode: praise.driverCode,
        driverPhone: driver?.telefone || "",
        customMessage: `Olá, motorista! Temos o prazer de compartilhar um elogio recebido sobre o seu atendimento:`,
        includeOriginalFeedback: true,
      });
    } else {
      setSelectedPraise(null);
      setMessageDetails({
        driverCode: "",
        driverPhone: "",
        customMessage: "Olá, motorista! Temos o prazer de compartilhar um elogio recebido sobre o seu atendimento:",
        includeOriginalFeedback: true,
      });
    }
    
    setIsSendingOpen(true);
  };

  const handleDriverCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    const driver = praises.find(d => d.driverCode === code);
    setMessageDetails({
      ...messageDetails,
      driverCode: code,
      driverPhone: driver?.telefone || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Elogios aos Motoristas</h2>
          <p className="text-muted-foreground">
            Envie mensagens de reconhecimento e elogios aos motoristas
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateMessageOpen} onOpenChange={setIsCreateMessageOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                Criar Novo Elogio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Elogio</DialogTitle>
                <DialogDescription>
                  Registre um novo elogio para um motorista.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-driver-code">Código do Motorista</Label>
                  <Input 
                    id="new-driver-code"
                    placeholder="Ex: 215"
                    value={newMessage.driverCode}
                    onChange={(e) => setNewMessage({...newMessage, driverCode: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-message">Mensagem de Elogio</Label>
                  <Textarea 
                    id="new-message"
                    placeholder="Digite aqui a mensagem de elogio para o motorista..."
                    value={newMessage.message}
                    onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateMessageOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateNewMessage}>Criar Elogio</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por código, nome do motorista ou mensagem..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="relative py-8">
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-2 bg-gradient-to-b from-blue-400 via-green-400 to-pink-400 rounded"></div>
        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex items-center mb-8 animate-pulse">
                <div className="w-1/2 px-4">
                  <div className="p-4 rounded-lg shadow-lg bg-gray-100 border-l-4 border-gray-200 h-28" />
                </div>
                <div className="w-1/2 flex justify-center">
                  <div className="w-6 h-6 rounded-full border-4 border-gray-200 bg-white" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPraises.length > 0 ? (
          filteredPraises.map((praise, idx) => (
            <div key={praise.id} className={`flex items-center mb-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              onClick={() => setSelectedPraiseDetails(praise)}>
              <div className="w-1/2 px-4">
                <div className={`p-4 rounded-lg shadow-lg cursor-pointer transition-all duration-150 hover:scale-[1.03] ${praise.isProcessed ? 'bg-green-100' : 'bg-blue-100'} border-l-4 ${praise.isProcessed ? 'border-green-400' : 'border-blue-400'}`}> 
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{praise.driverName}</span>
                    <span className="text-xs text-gray-500">({praise.driverCode})</span>
                  </div>
                  <p className="mt-2 text-gray-700 italic max-h-20 overflow-y-auto">"{praise.message}"</p>
                  <span className="text-xs text-gray-500 block mt-2">{format(praise.date, "dd/MM/yyyy", { locale: ptBR })}</span>
                  <Button size="sm" className="mt-2" onClick={e => { e.stopPropagation(); openSendDialog(praise); }}>
                    {praise.isProcessed ? 'Reenviar' : 'Enviar Elogio'}
                  </Button>
                </div>
              </div>
              <div className="w-1/2 flex justify-center">
                <div className={`w-6 h-6 rounded-full border-4 ${praise.isProcessed ? 'border-green-400' : 'border-blue-400'} bg-white flex items-center justify-center`}>
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhum elogio encontrado. Crie um novo elogio ou ajuste os filtros de busca.
              </p>
            </CardContent>
          </Card>
        )}
        {/* Modal de detalhes do elogio */}
        <Dialog open={!!selectedPraiseDetails} onOpenChange={open => !open && setSelectedPraiseDetails(null)}>
          <DialogContent className="w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Detalhes do Elogio
              </DialogTitle>
            </DialogHeader>
            {selectedPraiseDetails && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">Motorista:</span> {selectedPraiseDetails.driverName} ({selectedPraiseDetails.driverCode})
                </div>
                <div>
                  <span className="font-semibold">Telefone:</span> {selectedPraiseDetails.telefone || '-'}
                </div>
                <div>
                  <span className="font-semibold">Passageiro:</span> {maskPassengerName(selectedPraiseDetails.passengerName)}
                </div>
                <div>
                  <span className="font-semibold">Data:</span> {format(selectedPraiseDetails.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
                <div>
                  <span className="font-semibold">Status:</span> {selectedPraiseDetails.isProcessed ? 'Enviado/Arquivado' : 'Pendente'}
                </div>
                <div>
                  <span className="font-semibold">Mensagem:</span>
                  <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap mt-1 max-h-40 overflow-y-auto">
                    {selectedPraiseDetails.message}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => { openSendDialog(selectedPraiseDetails); setSelectedPraiseDetails(null); }}>
                    {selectedPraiseDetails.isProcessed ? 'Reenviar Elogio' : 'Enviar Elogio'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Send Message Dialog */}
      <Dialog open={isSendingOpen} onOpenChange={setIsSendingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enviar Elogio ao Motorista</DialogTitle>
            <DialogDescription>
              Personalize a mensagem que será enviada ao motorista.
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="driver-code">Código do Motorista</Label>
              <Input 
                id="driver-code"
                placeholder="Ex: 215"
                value={messageDetails.driverCode}
                onChange={handleDriverCodeChange}
                disabled={!!selectedPraise}
              />
              {selectedPraise && (
                <p className="text-sm text-muted-foreground">
                  Motorista: {selectedPraise.driverName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="driver-phone">Telefone do Motorista</Label>
              <Input
                id="driver-phone"
                placeholder="Ex: 11999999999"
                value={messageDetails.driverPhone}
                onChange={e => setMessageDetails({ ...messageDetails, driverPhone: e.target.value })}
                maxLength={15}
                type="tel"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-message">Mensagem Personalizada</Label>
              <Textarea 
                id="custom-message"
                placeholder="Digite aqui uma mensagem personalizada para o motorista..."
                value={messageDetails.customMessage}
                onChange={(e) => setMessageDetails({...messageDetails, customMessage: e.target.value})}
                rows={3}
              />
            </div>
            
            {selectedPraise && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-feedback"
                    checked={messageDetails.includeOriginalFeedback}
                    onChange={(e) => setMessageDetails({
                      ...messageDetails, 
                      includeOriginalFeedback: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="include-feedback">Incluir feedback original</Label>
                </div>
                
                {messageDetails.includeOriginalFeedback && (
                  <div className="rounded-md bg-secondary p-3 mt-2">
                    <div className="flex items-center mb-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-sm italic">"{selectedPraise.message}"</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Prévia da Mensagem</Label>
              <div className="rounded-md bg-secondary p-4 space-y-2">
                <p className="text-sm">{messageDetails.customMessage}</p>
                
                {selectedPraise && messageDetails.includeOriginalFeedback && (
                  <>
                    <p className="text-sm font-medium">Avaliação do Passageiro:</p>
                    <div className="flex items-center mb-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-sm italic">"{selectedPraise.message}"</p>
                  </>
                )}
                
                <p className="text-sm pt-4">Parabéns pelo excelente trabalho!</p>
                <p className="text-sm">Equipe D-TAXI</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendingOpen(false)}>Cancelar</Button>
            <Button disabled={!messageDetails.driverPhone} onClick={handleSendPraise}>
              <SendHorizontal className="mr-2 h-4 w-4" />
              Enviar Elogio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function maskPassengerName(name: string) {
  if (!name) return "*****";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0] + " ****";
  return `${parts[0]} ${parts[1][0]}****`;
}

export default DriverMessaging;
