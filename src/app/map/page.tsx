import { TreasureMapView } from "@/components/map/TreasureMapView";

export default function MapPage() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 to-amber-100/80">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 pb-12">
        <TreasureMapView />
      </main>
    </div>
  );
}
