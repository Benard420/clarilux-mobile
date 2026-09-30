import { TabBar } from "@/components/tab-bar";
import { RegisterServiceWorker } from "@/components/register-sw";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-page">
      <div className="mx-auto w-full max-w-[480px] pb-[110px]">{children}</div>
      <TabBar />
      <RegisterServiceWorker />
    </div>
  );
}
