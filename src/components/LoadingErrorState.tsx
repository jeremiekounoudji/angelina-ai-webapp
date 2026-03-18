"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  ClockIcon 
} from "@heroicons/react/24/outline";

interface LoadingErrorStateProps {
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function LoadingErrorState({ 
  error, 
  onRetry,
  title = "Something went wrong",
  description = "We couldn't load the data. This might be due to a network issue or timeout."
}: LoadingErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full border-red-200 bg-red-50">
        <CardBody className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {error?.toLowerCase().includes('timeout') ? (
              <ClockIcon className="w-8 h-8 text-red-600" />
            ) : (
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {title}
          </h3>
          <p className="text-red-700 mb-1">
            {error || description}
          </p>
          <p className="text-sm text-red-600 mb-6">
            Please check your internet connection and try again.
          </p>
          {onRetry && (
            <Button
              color="danger"
              variant="flat"
              startContent={<ArrowPathIcon className="w-4 h-4" />}
              onPress={onRetry}
            >
              Retry
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
