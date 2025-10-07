import {Header} from "@/components/header";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
      const user = await getCurrentUser();
    return (
        <>
            <Header user={user} />
            <main className="container mx-auto py-10 max-w-7xl">
                {children}
            </main>
        </>
    );
}