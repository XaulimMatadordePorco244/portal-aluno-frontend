import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AlunoPerfilLoading() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Identity Skeleton */}
      <div className="flex flex-col md:flex-row gap-6 items-center border-b pb-8">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 flex-1 w-full">
           <div className="flex gap-2">
             <Skeleton className="h-5 w-16" />
             <Skeleton className="h-5 w-16" />
           </div>
           <Skeleton className="h-8 w-64" />
           <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Skeleton className="h-10 w-32" />
           <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Column 1 */}
         <div className="space-y-6 lg:col-span-1">
             <Card>
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="space-y-4">
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-3/4" />
                   <Skeleton className="h-4 w-5/6" />
                </CardContent>
             </Card>
             <Card>
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="space-y-4">
                   <Skeleton className="h-8 w-full" />
                   <Skeleton className="h-16 w-full" />
                </CardContent>
             </Card>
         </div>

         {/* Column 2 */}
         <div className="space-y-6 lg:col-span-2">
            <Card>
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                   <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-16 w-full col-span-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                   <Skeleton className="h-20 w-full rounded-lg" />
                   <Skeleton className="h-20 w-full rounded-lg" />
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}