import ExcelJS from 'exceljs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ano = Number(searchParams.get('ano')) || new Date().getFullYear();

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Águia';

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const instrutores = await prisma.instrutor.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });

    const tipos = ['GERAL', ...instrutores.map(i => i.id)];
    const tipoNomes: Record<string, string> = {
      'GERAL': 'Geral'
    };
    
    instrutores.forEach(inst => {
      tipoNomes[inst.id] = `Inst. ${inst.nome}`;
    });

    const alunos = await prisma.perfilAluno.findMany({
      where: { usuario: { status: 'ATIVO' } },
      include: { usuario: true, cargo: true },
      orderBy: [
        { cargo: { precedencia: 'asc' } },
        { dataUltimaPromocao: 'asc' },
        { numero: 'asc' },
        { usuario: { nomeDeGuerra: 'asc' } }
      ]
    });

    const dataInicioAno = new Date(ano, 0, 1);
    const dataFimAno = new Date(ano, 11, 31, 23, 59, 59);

    const [frequenciasAno, eventosAno] = await Promise.all([
      prisma.frequencia.findMany({ where: { data: { gte: dataInicioAno, lte: dataFimAno } } }),
      prisma.gmEventoCalendario.findMany({ 
        where: { data: { gte: dataInicioAno, lte: dataFimAno } },
        orderBy: { data: 'asc' }
      })
    ]);

    const mapaFreq: Record<string, Record<number, Record<number, Record<string, string>>>> = {};
    
    frequenciasAno.forEach(f => {
      const t = f.instrutorId || 'GERAL';
      const m = f.data.getMonth();
      const d = f.data.getDate();
      const aId = f.alunoId;

      if (!mapaFreq[t]) mapaFreq[t] = {};
      if (!mapaFreq[t][m]) mapaFreq[t][m] = {};
      if (!mapaFreq[t][m][d]) mapaFreq[t][m][d] = {};
      
      mapaFreq[t][m][d][aId] = f.status;
    });

    for (let m = 0; m < 12; m++) {
      const aba = workbook.addWorksheet(meses[m]);
      let linhaAtual = 2; 
      const eventosMes = eventosAno.filter(e => e.data.getMonth() === m);

      for (const tipo of tipos) {
        const diasAtivos = new Set<number>();
        if (mapaFreq[tipo] && mapaFreq[tipo][m]) {
          Object.keys(mapaFreq[tipo][m]).forEach(dia => diasAtivos.add(Number(dia)));
        }

        const diasOrdenados = Array.from(diasAtivos).sort((a, b) => a - b);

        if (diasOrdenados.length === 0) continue; 

        const linhaInicioTabela = linhaAtual;

        const ultimaColunaTabela = 3 + diasOrdenados.length + 4;
        aba.mergeCells(linhaAtual, 1, linhaAtual, ultimaColunaTabela);
        const tituloCell = aba.getCell(linhaAtual, 1);
        
        tituloCell.value = `Frequência - ${tipoNomes[tipo]} (${meses[m]}/${ano})`;
        tituloCell.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
        tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
        linhaAtual++;

        const rowHeader = aba.getRow(linhaAtual);
        const cabecalhos = ['Cargo', 'Nº', 'Nome de Guerra', ...diasOrdenados.map(d => d.toString()), 'P', 'F', 'J', '%'];
        rowHeader.values = cabecalhos;
        rowHeader.font = { bold: true };
        rowHeader.eachCell((cell) => {
           cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } }; 
           cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
           cell.alignment = { horizontal: 'center' };
        });
        linhaAtual++;

        for (const aluno of alunos) {
          const row = aba.getRow(linhaAtual);
          
          row.getCell(1).value = aluno.cargo?.abreviacao || 'AL';
          row.getCell(2).value = aluno.numero ? Number(aluno.numero) : '-';
          row.getCell(3).value = aluno.usuario?.nomeDeGuerra || aluno.usuario?.nome;

          let totalP = 0, totalF = 0, totalJ = 0;

          diasOrdenados.forEach((diaAula, index) => {
            const cell = row.getCell(4 + index); 
            const status = mapaFreq[tipo][m][diaAula][aluno.id];

            if (status) {
              if (status === 'PRESENTE') { 
                cell.value = 'P'; totalP++;
                cell.font = { color: { argb: 'FF00B050' }, bold: true }; 
              } 
              else if (status === 'FALTA') { 
                cell.value = 'F'; totalF++;
                cell.font = { color: { argb: 'FFFF0000' }, bold: true }; 
              } 
              else if (status === 'JUSTIFICADA') { 
                cell.value = 'J'; totalJ++;
                cell.font = { color: { argb: 'FFED7D31' }, bold: true }; 
              }
              cell.alignment = { horizontal: 'center' };
            }
          });

          row.getCell(4 + diasOrdenados.length).value = totalP;
          row.getCell(4 + diasOrdenados.length + 1).value = totalF;
          row.getCell(4 + diasOrdenados.length + 2).value = totalJ;

          const totalRegistros = totalP + totalF + totalJ;
          const porcentagem = totalRegistros > 0 
            ? Math.round(((totalP + totalJ) / totalRegistros) * 100) 
            : 0;

          const cellPerc = row.getCell(4 + diasOrdenados.length + 3);
          cellPerc.value = `${porcentagem}%`;
          
          if (porcentagem < 75 && totalRegistros > 0) {
             cellPerc.font = { color: { argb: 'FFFF0000' }, bold: true };
          } else {
             cellPerc.font = { bold: true };
          }

          row.getCell(4 + diasOrdenados.length + 1).font = { color: { argb: 'FFFF0000' }, bold: true };

          row.eachCell((cell, colNum) => {
            cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            if (colNum !== 3) cell.alignment = { horizontal: 'center' };
          });

          linhaAtual++;
        }

        if (eventosMes.length > 0) {
          const colunaCalendario = ultimaColunaTabela + 2; 
          let linhaCalendario = linhaInicioTabela;

          aba.mergeCells(linhaCalendario, colunaCalendario, linhaCalendario, colunaCalendario + 1);
          const calTitulo = aba.getCell(linhaCalendario, colunaCalendario);
          calTitulo.value = 'Acontecimentos do Mês';
          calTitulo.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          calTitulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF595959' } }; 
          calTitulo.alignment = { horizontal: 'center' };
          linhaCalendario++;

          eventosMes.forEach(evento => {
            const diaFormato = String(evento.data.getDate()).padStart(2, '0');
            
            const cellData = aba.getCell(linhaCalendario, colunaCalendario);
            cellData.value = `Dia ${diaFormato}`;
            cellData.font = { bold: true };
            cellData.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            
            const cellDesc = aba.getCell(linhaCalendario, colunaCalendario + 1);
            cellDesc.value = `[${evento.tipo}] ${evento.titulo}`;
            if (evento.tipo === 'CANCELADO') cellDesc.font = { color: { argb: 'FFFF0000' } }; 
            if (evento.tipo === 'FERIADO') cellDesc.font = { color: { argb: 'FFED7D31' } }; 
            
            cellDesc.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            
            linhaCalendario++;
          });
          
          aba.getColumn(colunaCalendario).width = 10;
          aba.getColumn(colunaCalendario + 1).width = 30;
        }

        linhaAtual += 3; 
      }

      aba.views = [{ state: 'frozen', xSplit: 3 }];

      aba.getColumn(1).width = 10; 
      aba.getColumn(2).width = 8;  
      aba.getColumn(3).width = 28; 
      
      for (let c = 4; c <= 40; c++) {
        aba.getColumn(c).width = 6; 
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="Mapa_Frequencia_${ano}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error) {
    console.error('Erro ao gerar excel:', error);
    return new NextResponse('Erro ao gerar arquivo Excel', { status: 500 });
  }
}