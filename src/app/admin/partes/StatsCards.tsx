import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File, FileCheck, FileClock, FileX } from "lucide-react";


type PartesStats = {
    total: number;
    pendentes: number;
    aprovadas: number;
    negadas: number;
};

export function StatsCards({ stats }: { stats: PartesStats }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Partes</CardTitle>
                    <File className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Todos os registros no sistema</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Aguardando Análise</CardTitle>
                    <FileClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendentes}</div>
                    <p className="text-xs text-muted-foreground">Partes com status &quot;Enviada&quot;</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Partes Aprovadas</CardTitle>
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.aprovadas}</div>
                    <p className="text-xs text-muted-foreground">Total de análises com resultado &quot;Aprovada&quot;</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Partes Negadas</CardTitle>
                    <FileX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.negadas}</div>
                     <p className="text-xs text-muted-foreground">Total de análises com resultado &quot;Negada&quot;</p>
                </CardContent>
            </Card>
        </div>
    );
}