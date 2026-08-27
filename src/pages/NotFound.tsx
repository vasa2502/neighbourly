import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-[hsl(155,45%,92%)] flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-[Plus_Jakarta_Sans] font-extrabold text-[hsl(155,45%,32%)]">404</span>
        </div>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">
          This page doesn't exist.
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          The page you're looking for may have been moved or doesn't exist.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild>
            <Link to="/dashboard/home">
              <Home className="w-4 h-4 mr-2" /> Go Home
            </Link>
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
