"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Input,
  Chip,
} from "@heroui/react";
import { CpuChipIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { tokenService } from "@/lib/tokenService";
import toast from 'react-hot-toast';

interface BuyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess?: () => void;
}

const TOKEN_PACKAGES = [
  {
    tokens: 100000, // 100K tokens
    price: 5,
    popular: false,
    description: "Small boost for light usage"
  },
  {
    tokens: 500000, // 500K tokens
    price: 20,
    popular: true,
    description: "Great value for regular users"
  },
  {
    tokens: 1000000, // 1M tokens
    price: 35,
    popular: false,
    description: "Perfect for heavy usage"
  },
  {
    tokens: 2000000, // 2M tokens
    price: 60,
    popular: false,
    description: "Maximum value package"
  }
];

export default function BuyTokensModal({
  isOpen,
  onClose,
  companyId,
  onSuccess
}: BuyTokensModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<typeof TOKEN_PACKAGES[0] | null>(null);
  const [customTokens, setCustomTokens] = useState("");
  const [loading, setLoading] = useState(false);
  const [useCustom, setUseCustom] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPackage && !customTokens) return;

    setLoading(true);
    try {
      const tokensToAdd = useCustom ? parseInt(customTokens) : selectedPackage?.tokens || 0;
      const amount = useCustom ? (parseInt(customTokens) * 0.00005) : selectedPackage?.price || 0; // $0.00005 per token

      // In a real app, you would integrate with a payment processor here
      // For now, we'll simulate a successful payment
      const success = await tokenService.purchaseTokens(companyId, tokensToAdd, {
        amount,
        currency: 'USD',
        transactionId: `sim_${Date.now()}`
      });

      if (success) {
        onSuccess?.();
        onClose();
      } else {
        toast.error('Failed to purchase tokens. Please try again.');
      }
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toString();
  };

  const customPrice = customTokens ? (parseInt(customTokens) * 0.00005).toFixed(2) : "0.00";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-background border border-secondary",
        header: "border-b border-secondary",
        footer: "border-t border-secondary"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CpuChipIcon className="w-6 h-6 text-primary" />
            <span className="text-white">Buy More Tokens</span>
          </div>
          <p className="text-sm text-gray-50 font-normal">
            Add more tokens to your account to continue using AI features
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Toggle between packages and custom */}
            <div className="flex gap-2">
              <Button
                variant={!useCustom ? "solid" : "bordered"}
                color="primary"
                size="sm"
                onPress={() => setUseCustom(false)}
              >
                Packages
              </Button>
              <Button
                variant={useCustom ? "solid" : "bordered"}
                color="primary"
                size="sm"
                onPress={() => setUseCustom(true)}
              >
                Custom Amount
              </Button>
            </div>

            {!useCustom ? (
              /* Token Packages */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TOKEN_PACKAGES.map((pkg, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all bg-background ${
                      selectedPackage === pkg
                        ? "border-2 border-primary shadow-lg shadow-primary/20"
                        : "border border-secondary hover:border-primary"
                    } ${pkg.popular ? "ring-2 ring-primary/30" : ""}`}
                    isPressable
                    onPress={() => setSelectedPackage(pkg)}
                  >
                    <CardBody className="p-4">
                      {pkg.popular && (
                        <Chip
                          color="success"
                          size="sm"
                          className="absolute -top-2 -right-2"
                        >
                          Popular
                        </Chip>
                      )}
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {formatTokens(pkg.tokens)}
                        </div>
                        <div className="text-sm text-gray-50 mb-2">
                          {pkg.tokens.toLocaleString()} tokens
                        </div>
                        <div className="text-xl font-semibold text-white mb-2">
                          ${pkg.price}
                        </div>
                        <div className="text-xs text-gray-50">
                          {pkg.description}
                        </div>
                        <div className="text-xs text-gray-50 mt-1">
                          ${(pkg.price / pkg.tokens * 1000000).toFixed(2)} per 1M tokens
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              /* Custom Amount */
              <div className="space-y-4">
                <Input
                  type="number"
                  label="Number of Tokens"
                  placeholder="Enter custom amount"
                  value={customTokens}
                  onValueChange={setCustomTokens}
                  min="1000"
                  step="1000"
                  startContent={<CpuChipIcon className="w-4 h-4 text-gray-50" />}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />
                
                {customTokens && (
                  <Card className="bg-secondary border border-secondary">
                    <CardBody className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-50">Total Cost:</span>
                        <span className="text-lg font-semibold text-white">${customPrice}</span>
                      </div>
                      <div className="text-xs text-gray-50 mt-1">
                        Rate: $0.00005 per token
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}

            {/* Payment Info */}
            <Card className="bg-secondary border border-secondary">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <CreditCardIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">
                      Secure Payment
                    </p>
                    <p className="text-blue-200">
                      Tokens will be added to your account immediately after payment confirmation.
                      This is a simulation - no actual payment will be processed.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handlePurchase}
            isLoading={loading}
            isDisabled={(!selectedPackage && !customTokens) || loading}
          >
            {loading ? "Processing..." : "Purchase Tokens"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}