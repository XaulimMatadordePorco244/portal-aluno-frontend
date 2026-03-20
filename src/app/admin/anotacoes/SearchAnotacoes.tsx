"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchAnotacoesProps {
  defaultValue: string;
}

export default function SearchAnotacoes({ defaultValue }: SearchAnotacoesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState(defaultValue);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      
      if (text) {
        params.set("q", text);
      } else {
        params.delete("q");
      }
      
      params.set("page", "1"); 

      router.replace(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [text, pathname, router, searchParams]);

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pesquisar nome de guerra..."
        className="pl-9 h-10 border-muted-foreground/20 bg-background focus-visible:ring-1 w-full"
      />
    </div>
  );
}