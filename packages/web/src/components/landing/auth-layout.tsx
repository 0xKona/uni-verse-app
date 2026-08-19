interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-cosmic flex min-h-svh flex-col items-center justify-center px-4 py-12 sm:px-6">
      {children}
    </div>
  );
}