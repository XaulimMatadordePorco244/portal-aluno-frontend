export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 w-max-[90%] lg:max-w-[90%] space-y-6">
      {children}
    </div>
  );
}
