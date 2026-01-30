"use client";

import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface CarteirinhaProps {
    aluno: {
        nome: string;
        nomeDeGuerra: string;
        fotoUrl?: string | null;
        cpf: string;
        dataNascimento: Date;
        numero: string | null;
        codigoValidacao: string;
        cargo: string;
        cargoTipo: string;
        validade: Date;
    };
}

export default function Carteirinha({ aluno }: CarteirinhaProps) {
    const validationUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/validar/${aluno.codigoValidacao}`;
    const handlePrint = () => window.print();

    const corBorda = useMemo(() => {
        const nome = aluno.cargo ? aluno.cargo.toUpperCase() : '';
        const tipo = aluno.cargoTipo ? aluno.cargoTipo.toUpperCase() : '';

        if (nome === 'ALUNO SOLDADO') return '#166534';

        if (tipo === 'POSTO') return '#973034';

        return '#fcce38';

    }, [aluno.cargo, aluno.cargoTipo]);

    return (
        <div className='print:block print:h-auto print:overflow-visible'>
            <div className="print:hidden w-full flex justify-between mb-4 ">
                <h1 className="text-2xl font-bold text-left print:hidden text-foreground">
                    Minha Carteirinha Digital
                </h1>
                <Button onClick={handlePrint} className="gap-4 shadow-md">
                    <Printer className="w-4 h-4" /> Imprimir
                </Button>
            </div>

            <div className="flex flex-col items-center p-4 print:p-0 print:min-h-0 bg-muted/40 print:bg-transparent min-h-screen ">

                <div className="flex flex-col xl:flex-row gap-10 items-start justify-center">

                    <div className="print:absolute print:top-0 print:left-0 print:m-0 ">

                        <div className="py-5 md:py-25 transform scale-[1.10] md:scale-[2] flex flex-col md:flex-row print:flex-row items-center gap-0 print:scale-100 print:m-15">

                            <div
                                className="w-[85.6mm] h-[53.98mm] p-[2mm] print:rounded-none overflow-hidden shadow-lg print:shadow-none print:border-none "
                                style={{ backgroundColor: corBorda }}
                            >
                                <div className="w-full h-full bg-white relative overflow-hidden">

                                    <div className="absolute top-0 right-0 w-full h-[12.5mm] bg-[#0b1e45] flex items-center justify-end pr-3 z-10 border-b-[7.5] "
                                        style={{ borderColor: corBorda }}
                                    >
                                        <h1 className="absolute text-white top-2.5 left-22 font-bold text-[13px] text-right leading-none">
                                            GUARDA MIRIM DE NAVIRAÍ-MS<br />
                                        </h1>
                                    </div>

                                    <div
                                        className="absolute top-0.5 left-7.5 bg-white rounded-full flex items-center justify-center z-20 shadow-sm "
                                    >
                                        <Image src="/img/logo.svg" alt="Logo" width={55} height={55} className="object-contain " />
                                    </div>



                                    <div className="absolute top-[20mm] left-[4mm] w-[22mm] h-[27mm] bg-gray-200 border border-gray-300 rounded-[1px] overflow-hidden z-20">
                                        {aluno.fotoUrl ? (
                                            <Image src={aluno.fotoUrl} alt="Aluno" fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-[6px] text-gray-500 font-bold">FOTO</div>
                                        )}
                                    </div>

                                    <h2 className="absolute top-[14mm] left-[23mm] text-center w-[50mm] text-[9px] font-bold border-b border-gray-200 pb-0.5 uppercase text-black z-20 leading-none tracking-tight">
                                        CARTEIRA FUNCIONAL DE IDENTIFICAÇÃO
                                    </h2>

                                    <div className="absolute top-[20mm] left-[28mm] w-[54mm] z-20">
                                        <span className="block text-[9px]  uppercase text-black truncate leading-none">
                                            {aluno.nome}
                                        </span>
                                    </div>

                                    <div className="absolute top-[27.3mm] left-[28mm] w-[54mm] z-20 flex flex-col gap-[0.8mm]">
                                        <LinhaDado label="NOME DE GUERRA" valor={aluno.nomeDeGuerra} />
                                        <LinhaDado label="CARGO" valor={aluno.cargo} />
                                        <LinhaDado label="NÚMERO" valor={aluno.numero} />
                                        <LinhaDado label="CPF" valor={aluno.cpf} />
                                        <LinhaDado label="NASC." valor={aluno.dataNascimento.toLocaleDateString('pt-BR')} />
                                        <LinhaDado label="VALIDADE" valor={aluno.validade.toLocaleDateString('pt-BR')} destaque />
                                    </div>


                                </div>
                            </div>

                            <div className="hidden md:block print:block w-px bg-gray-300 border-l border-dashed border-gray-400 h-[53.98mm]"></div>

                            <div
                                className="w-[85.6mm] h-[53.98mm] p-[2mm]  overflow-hidden shadow-lg print:shadow-none print:border-[0.5px]"
                                style={{ backgroundColor: corBorda }}
                            >
                                <div className="w-full h-full bg-white relative  overflow-hidden">

                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40mm] h-[40mm] opacity-10 pointer-events-none z-0">
                                        <Image
                                            src="/img/logo.svg"
                                            alt="Marca d'agua"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>


                                    <div className="absolute top-[8mm] left-[4mm] w-[50mm] z-10">
                                        <p className="text-[6px] text-justify text-gray-600 leading-relaxed uppercase">
                                            Este cartão é de uso pessoal e intransferível. O portador tem fé pública dentro da instituição. Em caso de perda, devolver na sede.
                                        </p>
                                    </div>

                                    <div className="absolute top-[6mm] right-[3mm] w-[20mm] flex flex-col items-center z-10">
                                        <QRCodeSVG value={validationUrl} size={55} />
                                        <span className="text-[5px] mt-1 font-bold uppercase text-gray-400">Validar</span>
                                    </div>

                                    <div className="absolute bottom-[2mm] left-0 w-full text-center z-10">
                                        <div className="mx-auto w-[90%] border-t border-gray-100 mb-1"></div>

                                        <p className="text-[6px] font-bold text-gray-400 uppercase leading-none">
                                            Rua Bandeirantes, nº 365 – Centro – 79950-000 – Naviraí/MS
                                        </p>
                                        <p className="text-[6px] font-bold text-gray-400 uppercase leading-none mt-[1.5px]">
                                            Contato: 67-99999-9966 • gmnaviraims@gmail.com
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          nav, footer, header, aside { display: none !important; }
        }
      `}</style>
            </div>
        </div>
    );
}

function LinhaDado({ label, valor, destaque }: any) {
    return (
        <div className="flex items-center gap-0 leading-none">
            <span className="text-[8px] font-bold text-black uppercase mt-0.5 shrink-0">{label}:</span>
            <span className={cn(
                "text-[8px] ml-1 mt-0.5 uppercase truncate",
                destaque ? "text-red-600 font-bold" : "text-gray-700 font-medium"
            )}>{valor}</span>
        </div>
    )
}