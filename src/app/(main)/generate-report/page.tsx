"use client";

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Eye, Trash2 } from 'lucide-react';

export default function GenerateReportPage() {
  const [nome] = useState('Michael Santos');
  const [registro] = useState('2024-015');
  const [cargo, setCargo] = useState('');
  const [data, setData] = useState('');
  const [assunto, setAssunto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [testemunhas, setTestemunhas] = useState('');
  const [responsavel] = useState('Michael Santos');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setData(today);
  }, []);

  const construirPDF = ({ preview = false } = {}) => {

    if (!nome || !registro || !cargo || !data || !assunto || !descricao || !responsavel) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 25;
    const maxW = pageW - margin * 2;
    let y = 0;
    const logoGuardaMirim = new Image();
    logoGuardaMirim.src = '/logo.png';
    const brasaoMarcaDagua = new Image();
    brasaoMarcaDagua.src = '/logo.png';
    const addHeader = () => {
      const logoY = margin - 20;
      const logoSize = 27;
      doc.addImage(logoGuardaMirim, 'PNG', margin, logoY, logoSize, logoSize);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('GUARDA MIRIM DE NAVIRAÍ-MS', pageW / 2 + 13, margin - 5, { align: 'center' });
      doc.setFontSize(16);
      doc.text('ESTADO DE MATO GROSSO DO SUL', pageW / 2 + 13, margin + 2, { align: 'center' });
      doc.setLineWidth(1);
      doc.line(margin - 11, margin + 10, pageW - 14, margin + 10);
      y = margin + 15;
    };
    const addFooter = () => {
      const footerY = pageH - margin + 10;
      doc.setLineWidth(0.6);
      doc.line(margin + 4, footerY - 6, pageW - margin - 4, footerY - 6);
      doc.setFontSize(9);
      doc.text("Rua Bandeirantes, nº 365 – Centro - Naviraí/MS", pageW / 2, footerY - 2, { align: 'center' });
      doc.text("Contato: 67-99999-4341 / e-mail: gmnaviraims@gmail.com", pageW / 2, footerY + 2, { align: 'center' });
    };
    const addWatermark = () => {
      const imgWidth = 150;
      const imgHeight = 150;
      const imgX = (pageW - imgWidth) / 2;
      const imgY = (pageH - imgHeight) / 2;
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
      doc.addImage(brasaoMarcaDagua, 'PNG', imgX, imgY, imgWidth, imgHeight);
      doc.restoreGraphicsState();
    };
    const numeroAuto = () => {
      const numeroParte = String(Date.now()).slice(-4);
      const timestamp = new Date().getFullYear();
      return `DOC-${numeroParte}-${timestamp}`;
    };
    const numero = numeroAuto();
    addHeader();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("PARTE", pageW / 2, y + 2, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.text(`Nº ${numero}`, pageW / 2, y, { align: 'center' });
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Nome: ${nome}`, margin, y);
    doc.text(`Número: ${registro}`, margin + maxW / 2, y);
    y += 7;
    doc.text(`Graduação/Posto: ${cargo || '—'}`, margin, y);
    y += 7;
    doc.text(`Data: ${data.split('-').reverse().join('/')}`, margin, y);
    y += 7;
    doc.text(`Assunto: ${assunto}`, margin, y);
    y += 12;
    const addTextSection = (title: string, content: string) => {
      if (!content) return;
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(content, maxW);
      doc.text(lines, margin, y, { align: 'justify' });
      y += (lines.length * 5) + 6;
    };
    addTextSection('HISTÓRICO:', descricao);
    addTextSection('TESTEMUNHAS:', testemunhas);
    addTextSection('OBSERVAÇÕES:', observacoes);
    const signatureY = pageH - margin - 20;
    y = y > signatureY ? signatureY : y;
    doc.line(pageW / 2 - 40, signatureY, pageW / 2 + 40, signatureY);
    doc.text(responsavel, pageW / 2, signatureY + 5, { align: 'center' });
    doc.setFontSize(9);
    doc.text('Responsável pela Parte', pageW / 2, signatureY + 9, { align: 'center' });
    addFooter();
    addWatermark();
    if (preview) {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`PARTE_${numero}.pdf`);
    }
  };

  const handleReset = () => {
    setCargo('');
    setAssunto('');
    setDescricao('');
    setTestemunhas('');
    setObservacoes('');
  }

  return (
    <div className="container mx-auto py-10">
      <div className="bg-card rounded-xl shadow-lg p-8 max-w-4xl mx-auto border">
        <h1 className="text-2xl font-bold text-foreground mb-6 border-b pb-4">
          Gerador de Parte de Comunicação
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); construirPDF(); }} className="space-y-6">
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <legend className="text-lg font-semibold text-foreground mb-2 w-full col-span-1 md:col-span-2">Identificação</legend>
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} disabled />
            </div>
            <div>
              <Label htmlFor="registro">Número (Matrícula)</Label>
              <Input id="registro" value={registro} disabled />
            </div>
            <div>
              <Label htmlFor="cargo">Graduação/Posto</Label>
              <Select onValueChange={setCargo} value={cargo} required>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aluno Soldado">Aluno Soldado</SelectItem>
                  <SelectItem value="Cabo Aluno">Cabo Aluno</SelectItem>
                  <SelectItem value="3º Sargento Aluno">3º Sargento Aluno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="data">Data</Label>
              <Input type="date" id="data" value={data} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData(e.target.value)} required />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="assunto">Assunto</Label>
              <Input id="assunto" value={assunto} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssunto(e.target.value)} required placeholder="Ex.: Justificativa de falta..." />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-foreground mb-2">Relato</legend>
            <div>
              <Label htmlFor="descricao">Descrição dos Fatos</Label>
              <Textarea id="descricao" value={descricao} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescricao(e.target.value)} required placeholder="Relate de forma objetiva e completa." className="min-h-[150px]" />
            </div>
            <div>
              <Label htmlFor="testemunhas">Testemunhas (Opcional)</Label>
              <Textarea id="testemunhas" value={testemunhas} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestemunhas(e.target.value)} placeholder="Nome(s) e contato(s), se houver." />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações (Opcional)</Label>
              <Input id="observacoes" value={observacoes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setObservacoes(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="responsavel">Responsável pelo Registro</Label>
              <Input id="responsavel" value={responsavel} disabled />
            </div>
          </fieldset>


          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={handleReset}>
              <Trash2 className="mr-2 h-4 w-4" /> Limpar
            </Button>
            <Button type="button" variant="secondary" onClick={() => construirPDF({ preview: true })}>
              <Eye className="mr-2 h-4 w-4" /> Pré-visualizar
            </Button>
            <Button type="submit">
              <FileDown className="mr-2 h-4 w-4" /> Gerar PDF
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}