"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, CalendarDays } from "lucide-react";


interface Aluno {
    rank: number;
    nome: string;
    numero: string;
    cargo: string;
}


const cfcData: Aluno[] = [
    { rank: 1, nome: "Bruno Carvalho", numero: "155", cargo: "Aluno Soldado" },
    { rank: 2, nome: "Fulano de Tal", numero: "167", cargo: "Aluno Soldado" },
    { rank: 3, nome: "Michael Santos", numero: "172", cargo: "Aluno Soldado" },
    { rank: 4, nome: "Ciclano da Silva", numero: "180", cargo: "Aluno Soldado" },
];

const cfsData: Aluno[] = [
    { rank: 1, nome: "Ana Beatriz Costa", numero: "101", cargo: "Cabo Aluna" },
    { rank: 2, nome: "Mariana Oliveira", numero: "105", cargo: "Cabo Aluna" },
];

const cfoData: Aluno[] = [];

const allCourses = [
    { name: "Curso de Formação de Soldados (CFS)", data: cfcData },
    { name: "Curso de Formação de Cabos (CFC)", data: cfsData },
    { name: "Curso de Formação de Oficiais (CFO)", data: cfoData },
]

const alunoLogadoNumero = "172";


const CourseRanking = ({ courseName, students }: { courseName: string, students: Aluno[] }) => {
    if (students.length === 0) {
        return null; 
    }

    return (
        <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-3">{courseName}</h2>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] text-center border-r">Posição</TableHead>
                            <TableHead className="border-r">Nome do Aluno</TableHead>
                            <TableHead className="w-[150px] border-r">Nº</TableHead>
                            <TableHead className="w-[200px]">Cargo/Graduação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((aluno) => (
                            <TableRow 
                                key={aluno.rank} 
                                className={aluno.numero === alunoLogadoNumero ? "bg-blue-100 hover:bg-blue-200" : ""}
                            >
                                <TableCell className="font-bold text-lg text-center border-r">{aluno.rank}º</TableCell>
                                <TableCell className="font-medium border-r">{aluno.nome}</TableCell>
                                <TableCell className="font-mono border-r">{aluno.numero}</TableCell>
                                <TableCell>{aluno.cargo}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default function ClassificationPage() {
    const dataAtualizacao = "16/09/2025"; 

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-gray-700" />
                    <h1 className="text-3xl font-bold text-gray-800">Classificação Geral</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 p-2 rounded-lg">
                    <CalendarDays className="h-4 w-4" />
                    <span>Última atualização: {dataAtualizacao}</span>
                </div>
            </div>
            
            {allCourses.map(course => (
                <CourseRanking key={course.name} courseName={course.name} students={course.data} />
            ))}
        </div>
    );
}