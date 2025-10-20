"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { ArrowUpIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface UpgradePromptProps {
  title: string;
  description: string;
  currentLimit: number;
  limitType: "users" | "products" | "tokens";
  className?: string;
}

export function UpgradePrompt({
  title,
  description,
  currentLimit,
  limitType,
  className = ""
}: UpgradePromptProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/dashboard/subscription");
  };

  const getIcon = () => {
    switch (limitType) {
      case "users":
        return "👥";
      case "products":
        return "📦";
      case "tokens":
        return "🪙";
      default:
        return "⚡";
    }
  };

  return (
    <Card className={`border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 ${className}`}>
      <CardBody className="text-center py-8">
        <div className="text-4xl mb-4">{getIcon()}</div>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-orange-800">{title}</h3>
          <Chip size="sm" color="warning" variant="flat">
            Limit: {currentLimit}
          </Chip>
        </div>
        
        <p className="text-orange-700 mb-6 max-w-sm mx-auto">
          {description}
        </p>
        
        <div className="space-y-3">
          <Button
            color="warning"
            variant="solid"
            startContent={<ArrowUpIcon className="w-4 h-4" />}
            onPress={handleUpgrade}
            className="font-semibold"
          >
            Upgrade Plan
          </Button>
          
          <div className="flex items-center justify-center gap-1 text-sm text-orange-600">
            <SparklesIcon className="w-4 h-4" />
            <span>Unlock more features with a paid plan</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}