"use client";

import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeButtonProps {
  className?: string;
  children?: React.ReactNode;
  size?: "default" | "sm" | "lg";
}

export function UpgradeButton({
  className,
  children = "Upgrade to Pro",
  size = "default",
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      size={size}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Zap className="h-4 w-4 mr-2" />
      )}
      {loading ? "Redirecting…" : children}
    </Button>
  );
}
