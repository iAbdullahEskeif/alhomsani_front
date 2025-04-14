import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

function conceptCars() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-medium text-white mb-8">Concept Cars</h2>

        <Card className="bg-zinc-900 border-zinc-800 shadow-md">
          <CardContent className="p-6">
            <p className="text-zinc-400">
              This is an upcoming product and it is not available yet
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/cars/conceptCars")({
  component: conceptCars,
});
