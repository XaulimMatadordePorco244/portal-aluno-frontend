export function Footer() {
    const anoAtual = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-border bg-background py-4 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">

                <p className="text-sm text-muted-foreground text-center md:text-left">
                    Mural Guarda Mirim • {anoAtual}
                </p>
                <p className="text-sm text-muted-foreground text-center md:text-right">
                    Desenvolvido por{" "}
                    <a
                        href="https://www.linkedin.com/in/michael-douglas-687419312"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline transition-colors"
                    >
                        Michael Douglas
                    </a>
                </p>

            </div>
        </footer>
    );
}