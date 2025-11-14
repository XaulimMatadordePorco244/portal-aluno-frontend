import jsPDF from 'jspdf';
import { Parte, Usuario, Cargo } from '@prisma/client';

type ParteData = Parte & {
    autor: Usuario & { cargo: Cargo | null }
};

const toBase64 = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Falha ao carregar a imagem: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export async function generatePartePDF(data: ParteData) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const logoUrl = '/img/logo.png'; 
    const logoGuardaMirim = await toBase64(logoUrl); 
    const brasaoMarcaDagua = await toBase64(logoUrl);
    
    
    const numero = data.numeroDocumento || 'DOC-S/N';
    const nome = data.autor.nome;
    const registro = data.autor.numero || 'N/A';
    const cargo = data.autor.cargo?.nome || 'Não informado';
    const dataCriacao = new Date(data.createdAt).toLocaleDateString('pt-BR');
    const assunto = data.assunto;
    const descricao = data.conteudo;
    const responsavel = data.autor.nome; 

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 25;
    const maxW = pageW - margin * 2;
    let y = 0;

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
        doc.text("Rua Bandeirantes, nº 365 – Centro -79947-079- Naviraí/MS", pageW / 2, footerY - 2, { align: 'center' });
        doc.text("Contato: 67-99999-4341 / e-mail: gmnaviraims@gmail.com", pageW / 2, footerY + 2, { align: 'center' });
    };
    
    const addWatermark = () => {
        const imgWidth = 150;
        const imgHeight = 150;
        const imgX = (pageW - imgWidth) / 2;
        const imgY = (pageH - imgHeight) / 2;
        doc.saveGraphicsState();
        type GStateConstructor = new (options: { opacity: number }) => object;
        doc.setGState(new (doc.GState as unknown as GStateConstructor)({ opacity: 0.1 }));
        doc.addImage(brasaoMarcaDagua, 'PNG', imgX, imgY, imgWidth, imgHeight);
        doc.restoreGraphicsState();
    };

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
    doc.text(`Graduação/Posto: ${cargo}`, margin, y);
    y += 7;
    doc.text(`Data: ${dataCriacao}`, margin, y);
    y += 7;
    doc.text(`Assunto: ${assunto}`, margin, y);
    y += 12;

    const addTextSection = (title: string, content: string | null) => {
        if (!content) return;
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(content, maxW);
        lines.forEach((line: string) => {
            if (y > pageH - margin - 20) {
                addFooter();
                addWatermark();
                doc.addPage();
                addHeader();
                y = margin + 15;
            }
            doc.text(line, margin, y, { align: 'justify' });
            y += 6;
        });
        y += 6;
    };

    addTextSection('HISTÓRICO:', descricao);
    
    const signatureY = pageH - margin - 20;
    if (y > signatureY - 10) {
        addFooter();
        addWatermark();
        doc.addPage();
        addHeader();
        y = signatureY;
    } else {
        y = signatureY;
    }

    doc.line(pageW / 2 - 40, y, pageW / 2 + 40, y);
    doc.text(responsavel, pageW / 2, y + 5, { align: 'center' });
    doc.setFontSize(9);
    doc.text('Responsável pela Parte', pageW / 2, y + 9, { align: 'center' });
    
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addWatermark();
        if (i > 1) addHeader();
        addFooter();
    }
    
    doc.save(`PARTE_${numero}.pdf`);
}