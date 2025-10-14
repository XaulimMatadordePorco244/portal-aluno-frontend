"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TipoEscala, User } from '@prisma/client';
import { toast } from 'sonner';
import { ArrowLeft, Edit, FileDown, Globe, Save, Trash2 } from 'lucide-react';
import { EscalaCompleta } from './page';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


export function EditEscalaForm({ escalaInicial, alunos }: { escalaInicial: EscalaCompleta, alunos: User[] }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const [escala, setEscala] = useState(escalaInicial);


  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataDaEscala = new Date(escala.dataEscala);
  const isBloqueada = dataDaEscala < hoje;



  const handleSaveChanges = async () => {
    toast.info("Funcionalidade de salvar em desenvolvimento.");
    
    setIsEditing(false);
  };
  
  
  const handleGeneratePdf = () => {
    toast.info("Funcionalidade de gerar PDF em desenvolvimento.");
  };


  const handlePublish = () => {
    toast.info("Funcionalidade de publicar em desenvolvimento.");
  };


  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <Link href="/admin/escalas" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lista de escalas
        </Link>
        <div className="flex gap-2">
            {!isEditing && (
                <>
                    <Button variant="outline" onClick={handleGeneratePdf} disabled={isBloqueada}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Gerar PDF
                    </Button>
                     <Button onClick={handlePublish} disabled={isBloqueada}>
                        <Globe className="mr-2 h-4 w-4" />
                        Publicar
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditing(true)} disabled={isBloqueada}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                </>
            )}
             {isEditing && (
                <>
                     <Button variant="outline" onClick={() => { setIsEditing(false); setEscala(escalaInicial); }}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                    </Button>
                </>
            )}
        </div>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>Data: {format(new Date(escala.dataEscala), "dd/MM/yyyy")} | Tipo: {escala.tipo}</CardDescription>
        </CardHeader>
        <CardContent>
            {isEditing ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <p className="text-muted-foreground">Modo de edição...</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><Label>Data da Escala</Label><p className="font-semibold">{format(new Date(escala.dataEscala), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p></div>
                    <div><Label>Tipo</Label><p className="font-semibold">{escala.tipo}</p></div>
                    <div><Label>Elaborado Por</Label><p className="font-semibold">{escala.elaboradoPor}</p></div>
                </div>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens da Escala</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {escala.itens.map((item, index) => (
                 <div key={item.id} className="grid grid-cols-12 gap-x-4 gap-y-2 border p-3 rounded-md">
                     <div className="col-span-12 md:col-span-2"><Label>Seção</Label><p>{item.secao}</p></div>
                     <div className="col-span-12 md:col-span-3"><Label>Cargo/Função</Label><p>{item.cargo}</p></div>
                     <div className="col-span-6 md:col-span-2"><Label>Horário</Label><p>{item.horarioInicio} - {item.horarioFim}</p></div>
                     <div className="col-span-6 md:col-span-3"><Label>Aluno</Label><p>{item.aluno.nomeDeGuerra}</p></div>
                     <div className="col-span-12 md:col-span-2"><Label>Observação</Label><p>{item.observacao || 'N/A'}</p></div>
                 </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}