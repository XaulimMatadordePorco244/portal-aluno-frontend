import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { EscalaPDFBuilder } from "@/lib/escalaPdfGenerator";
import { EscalaCompleta } from "@/app/admin/escalas/[id]/page"; 

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: escalaId } = await params;

    const escala = await prisma.escala.findUnique({
      where: { id: escalaId },
      include: {
        itens: {
          include: {
            aluno: { include: { perfilAluno: { include: { funcao: true, cargo: true } }, funcaoAdmin: true } }
          }
        }, 
        criadoPor: { include: { funcaoAdmin: true } },
      },
    });

    if (!escala) {
      return NextResponse.json({ error: "Escala não encontrada" }, { status: 404 });
    }

    const pdfBuilder = new EscalaPDFBuilder(escala as EscalaCompleta);
    const pdfBytes = await pdfBuilder.build(); 
    
    const pdfBuffer = Buffer.from(pdfBytes);
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="preview-escala-${escala.dataEscala.toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error("[PREVIEW_PDF_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar pré-visualização do PDF." },
      { status: 500 }
    );
  }
}