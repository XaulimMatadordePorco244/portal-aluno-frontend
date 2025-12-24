'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Save, 
  X, 
  Plus, 
  Edit, 
  Loader2,
  Crown,
  GraduationCap,
  School,
  AlertCircle,
  Upload as UploadIcon,
  Image as ImageIcon,
  XCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';

const cargoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  abreviacao: z.string().min(2, 'Abreviação deve ter pelo menos 2 caracteres').max(10),
  codigo: z.number().optional(),
  categoria: z.enum(['FORMACAO', 'QUADRO']),
  tipo: z.enum(['POSTO', 'GRADUACAO', 'CURSO']),
  precedencia: z.number().int().min(1, 'Precedência deve ser pelo menos 1').max(999),
  classe: z.enum(['SUPERIOR', 'INTERMEDIARIO', 'SUBALTERNO']).optional(),
  divisaUrl: z.string().optional(),
});

type CargoFormValues = z.infer<typeof cargoSchema>;

interface CargoData {
  id: string;
  nome: string;
  abreviacao: string;
  codigo?: number;
  categoria: 'FORMACAO' | 'QUADRO';
  tipo: 'POSTO' | 'GRADUACAO' | 'CURSO';
  precedencia: number;
  classe?: 'SUPERIOR' | 'INTERMEDIARIO' | 'SUBALTERNO';
  divisaUrl?: string;
  alunosCount?: number;
  historicoCount?: number;
}

interface CargoFormProps {
  cargo?: CargoData;
  cargosExistentes: CargoData[];
  trigger?: React.ReactNode;
}

export default function CargoForm({ cargo, cargosExistentes, trigger }: CargoFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(cargo?.divisaUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isEdit = !!cargo;
  const title = isEdit ? 'Editar Cargo' : 'Adicionar Novo Cargo';
  const description = isEdit 
    ? 'Atualize as informações do cargo existente' 
    : 'Preencha os dados para criar um novo cargo no sistema';

  const defaultValues: Partial<CargoFormValues> = cargo ? {
    nome: cargo.nome,
    abreviacao: cargo.abreviacao,
    codigo: cargo.codigo,
    categoria: cargo.categoria,
    tipo: cargo.tipo,
    precedencia: cargo.precedencia,
    classe: cargo.classe,
    divisaUrl: cargo.divisaUrl,
  } : {
    nome: '',
    abreviacao: '',
    categoria: 'QUADRO',
    tipo: 'POSTO',
    precedencia: 1,
  };

  const form = useForm<CargoFormValues>({
    resolver: zodResolver(cargoSchema),
    defaultValues,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Tipo de arquivo inválido', {
          description: 'Apenas imagens (JPG, PNG, GIF, WebP, SVG) são permitidas',
        });
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande', {
          description: 'A imagem deve ter no máximo 5MB',
        });
        return;
      }

      setFile(selectedFile);
      setUploadProgress(0);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(cargo?.divisaUrl || null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadDivisa = async (): Promise<string | null> => {
    if (!file) return null;

    try {
      setUploading(true);
      setUploadProgress(10);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('cargoNome', form.getValues('nome'));
      formData.append('cargoAbreviacao', form.getValues('abreviacao'));

      setUploadProgress(30);
      
      const response = await fetch('/api/upload/divisa', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(70);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer upload da divisa');
      }

      const data = await response.json();
      setUploadProgress(100);
      
      toast.success('Upload realizado!', {
        description: 'Divisa enviada para o Vercel Blob Storage',
      });

      return data.url;

    } catch (error) {
      toast.error('Erro no upload', {
        description: error instanceof Error ? error.message : 'Não foi possível fazer upload da divisa',
      });
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'POSTO': return <Crown className="h-4 w-4" />;
      case 'GRADUACAO': return <GraduationCap className="h-4 w-4" />;
      case 'CURSO': return <School className="h-4 w-4" />;
      default: return null;
    }
  };

  const getPrecedenciaSugerida = () => {
    if (cargosExistentes.length === 0) return 1;
    
    const precedencias = cargosExistentes.map(c => c.precedencia).sort((a, b) => a - b);
    const maxPrecedencia = Math.max(...precedencias);
    
    for (let i = 1; i <= maxPrecedencia + 10; i++) {
      if (!precedencias.includes(i)) {
        return i;
      }
    }
    return maxPrecedencia + 1;
  };

  const onSubmit = async (data: CargoFormValues) => {
    try {
      setLoading(true);

      const abreviacaoExistente = cargosExistentes.find(
        c => c.abreviacao.toLowerCase() === data.abreviacao.toLowerCase() && 
        (!isEdit || c.id !== cargo!.id)
      );

      if (abreviacaoExistente) {
        form.setError('abreviacao', {
          type: 'manual',
          message: 'Esta abreviação já está em uso por outro cargo',
        });
        return;
      }

      const nomeExistente = cargosExistentes.find(
        c => c.nome.toLowerCase() === data.nome.toLowerCase() && 
        (!isEdit || c.id !== cargo!.id)
      );

      if (nomeExistente) {
        form.setError('nome', {
          type: 'manual',
          message: 'Este nome já está em uso por outro cargo',
        });
        return;
      }

      const precedenciaExistente = cargosExistentes.find(
        c => c.precedencia === data.precedencia && 
        (!isEdit || c.id !== cargo!.id)
      );

      if (precedenciaExistente) {
        form.setError('precedencia', {
          type: 'manual',
          message: `Esta precedência já está em uso pelo cargo: ${precedenciaExistente.nome}`,
        });
        return;
      }

      let divisaUrl = data.divisaUrl;
      if (file && !uploading) {
        const uploadedUrl = await uploadDivisa();
        if (uploadedUrl) {
          divisaUrl = uploadedUrl;
        } else {
          throw new Error('Falha ao fazer upload da divisa para o Vercel Blob');
        }
      }

      const payload = {
        ...data,
        divisaUrl: divisaUrl || null,
        codigo: data.codigo || null,
        classe: data.classe || null,
      };

      const url = isEdit ? `/api/cargos/${cargo.id}` : '/api/cargos';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar cargo');
      }


      toast.success(isEdit ? 'Cargo atualizado!' : 'Cargo criado!', {
        description: (
          <div className="flex flex-col gap-1">
            <span>{isEdit ? `O cargo ${data.nome} foi atualizado com sucesso.` : `O cargo ${data.nome} foi criado com sucesso.`}</span>
            {divisaUrl && (
              <span className="text-sm text-muted-foreground">
                Divisa armazenada no Vercel Blob
              </span>
            )}
          </div>
        ),
      });

      setOpen(false);
      setFile(null);
      setPreviewUrl(null);
      form.reset();
      router.refresh();

    } catch (error) {
      toast.error('Erro', {
        description: error instanceof Error ? error.message : 'Não foi possível salvar o cargo',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrecedenciaSugestao = () => {
    const sugestao = getPrecedenciaSugerida();
    form.setValue('precedencia', sugestao);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFile(null);
      setPreviewUrl(cargo?.divisaUrl || null);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cargo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField<CargoFormValues>
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cargo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Comandante Geral" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField<CargoFormValues>
                  control={form.control}
                  name="abreviacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abreviação *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CMDT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField<CargoFormValues>
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 1001" 
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField<CargoFormValues>
                  control={form.control}
                  name="precedencia"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Precedência *</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handlePrecedenciaSugestao}
                          className="text-xs h-7"
                        >
                          Sugerir
                        </Button>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 1" 
                          min="1"
                          max="999"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Valor mais baixo = cargo mais alto na hierarquia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Classificação</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField<CargoFormValues>
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value as string}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="QUADRO">Quadro</SelectItem>
                          <SelectItem value="FORMACAO">Formação</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField<CargoFormValues>
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value as string}>
                        <FormControl>
                          <SelectTrigger>
                            <div className="flex items-center gap-2">
                              {getTipoIcon(field.value as string)}
                              <SelectValue placeholder="Selecione o tipo" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="POSTO">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Posto
                            </div>
                          </SelectItem>
                          <SelectItem value="GRADUACAO">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              Graduação
                            </div>
                          </SelectItem>
                          <SelectItem value="CURSO">
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4" />
                              Curso
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField<CargoFormValues>
                  control={form.control}
                  name="classe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value as string}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a classe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SUPERIOR">Superior</SelectItem>
                          <SelectItem value="INTERMEDIARIO">Intermediário</SelectItem>
                          <SelectItem value="SUBALTERNO">Subalterno</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Divisa do Cargo</h3>
              
              <div className="space-y-4">
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                      <Image
                        src={previewUrl}
                        alt="Preview da divisa"
                        fill
                        className="object-contain p-2"
                        sizes="192px"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeFile}
                        disabled={uploading}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="w-full space-y-2">
                      {file && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Arquivo:</span>
                          <span className="font-medium">{file.name}</span>
                        </div>
                      )}
                      
                      {file && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tamanho:</span>
                          <span className="font-medium">{formatFileSize(file.size)}</span>
                        </div>
                      )}
                      
                      {uploading && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progresso:</span>
                            <span className="font-medium">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            Enviando para Vercel Blob Storage...
                          </p>
                        </div>
                      )}
                      
                      {cargo?.divisaUrl && !file && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Armazenada no Vercel Blob
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Faça upload da imagem da divisa
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Formatos: JPG, PNG, GIF, WebP, SVG • Máximo: 5MB
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="divisa-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                      <UploadIcon className="h-4 w-4" />
                      {previewUrl ? 'Alterar Divisa' : 'Selecionar Divisa'}
                    </div>
                    <Input
                      id="divisa-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </Label>
                  
                  {cargo?.divisaUrl && !file && (
                    <div className="mt-2 flex items-center gap-2">
                      <a 
                        href={cargo.divisaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver divisa atual no blob
                      </a>
                    </div>
                  )}
                </div>

                <FormField<CargoFormValues>
                  control={form.control}
                  name="divisaUrl"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>As divisas são armazenadas no <strong>Vercel Blob Storage</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Arquivos são automaticamente otimizados e servidos via CDN global</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading || uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {(loading || uploading) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploading ? 'Enviando divisa...' : 'Salvando...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? 'Atualizar Cargo' : 'Criar Cargo'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}