import { Leaf } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="text-center space-y-6 p-8">
        <div className="flex items-center justify-center gap-3">
          <Leaf className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold text-foreground">
            Friško<span className="text-primary">.hr</span>
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Svježe od lokalnih proizvođača. Marketplace dolazi uskoro.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <div className="px-4 py-2 bg-cream rounded-lg text-sm text-muted-foreground">
            🍎 Voće
          </div>
          <div className="px-4 py-2 bg-pastel-green rounded-lg text-sm text-muted-foreground">
            🥬 Povrće
          </div>
          <div className="px-4 py-2 bg-terracotta rounded-lg text-sm text-muted-foreground">
            🥚 Jaja
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
