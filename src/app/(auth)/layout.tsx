export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-page">
      <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">{children}</div>
    </div>
  );
}
