import { BackBar } from "@/components/back-bar";
import { AppearanceControls } from "@/components/appearance-controls";

export default function AppearancePage() {
  return (
    <>
      <BackBar title="Appearance" />
      <main className="px-4 pt-4">
        <AppearanceControls />
      </main>
    </>
  );
}
