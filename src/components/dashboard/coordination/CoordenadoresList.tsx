import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Coordenador } from "./types";

interface CoordenadoresListProps {
  coordenadores: Coordenador[];
  loading: boolean;
  error?: string;
  onEdit: (coordenador: Coordenador) => void;
  onDelete: (id: string) => void;
  podeEditar?: boolean;
  podeExcluir?: boolean;
}

/**
 * Lista de coordenadores com ações de edição.
 */
const CoordenadoresList: React.FC<CoordenadoresListProps> = ({ coordenadores, loading, error, onEdit, onDelete, podeEditar = true, podeExcluir = true }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Erro ao carregar dados: {error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coordenadores.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              Nenhum coordenador encontrado.
            </TableCell>
          </TableRow>
        ) : (
          coordenadores.map((coordenador) => (
            <TableRow key={coordenador.id}>
              <TableCell className="font-medium">{coordenador.nome}</TableCell>
              <TableCell>{coordenador.email}</TableCell>
              <TableCell>{coordenador.telefone}</TableCell>
              <TableCell>
                <Badge 
                  variant={coordenador.status === "ativo" ? "default" : "secondary"} 
                  className={coordenador.status === "ativo" ? "bg-green-500" : "bg-gray-400"}
                >
                  {coordenador.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {podeEditar && <Button variant="ghost" size="sm" onClick={() => onEdit(coordenador)}>Editar</Button>}
                {podeExcluir && <Button variant="destructive" size="sm" onClick={() => onDelete(coordenador.id!)}>Excluir</Button>}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CoordenadoresList; 