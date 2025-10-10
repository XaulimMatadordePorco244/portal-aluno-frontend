import { AdminSidebar } from "@/components/AdminSidebar";
import { getCurrentUserWithRelations, canAccessAdminArea } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUserWithRelations();

    if (!user) {

        redirect('/login'); 
    }

    if (!canAccessAdminArea(user)) {
               redirect('/dashboard'); 
    }

    const displayName = user.role === 'ADMIN' ? user.nome : (user.nomeDeGuerra || user.nome);

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
                <AdminHeader userName={displayName} userImage={user.fotoUrl} />
                <main className="flex-1 p-6 md:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}