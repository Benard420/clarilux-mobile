import { ConceptStrip } from "@/components/concept-notice";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-page">
      <ConceptStrip />
      <div className="mx-auto w-full max-w-[480px] px-4 pb-32 pt-6">{children}</div>
    </div>
  );
}
