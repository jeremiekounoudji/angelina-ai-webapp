"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Textarea, Button } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import toast from "react-hot-toast";

export function PolicyCard() {
  const { company } = useAuth();
  const { updateCompany } = useCompany();
  const [policy, setPolicy] = useState(company?.policy || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handlePolicyChange = (value: string) => {
    setPolicy(value);
    setIsDirty(value !== (company?.policy || ""));
  };

  const handleSaveClick = () => {
    if (isDirty) {
      setShowSaveConfirm(true);
    }
  };

  const handleConfirmSave = async () => {
    if (!isDirty) return;

    try {
      setIsLoading(true);
      setShowSaveConfirm(false);
      await updateCompany({ policy });
      setIsDirty(false);
      toast.success("Company policy updated successfully");
    } catch (error) {
      console.error("Error updating policy:", error);
      toast.error("Failed to update company policy");
    } finally {
      setIsLoading(false);
    }
  };

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const policyHints = [
    "What type of business are you? (Restaurant, retail, service, etc.)",
    "What are your delivery options and areas?",
    "What payment methods do you accept?",
    "What are your business hours?",
    "Where is your business located?",
    "What are your return/refund policies?",
    "Do you offer special services or promotions?",
    "What are your contact details for customer support?"
  ];

  return (
    <Card className="bg-background border border-secondary shadow-lg shadow-secondary/20">
      <CardHeader className="flex gap-3">
        <DocumentTextIcon className="w-6 h-6 text-primary" />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-white">Company Policy</h3>
          <p className="text-sm text-gray-50">
            Define your business policies to help the AI assistant provide accurate information to customers
          </p>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <Textarea
          value={policy}
          onValueChange={handlePolicyChange}
          placeholder={`Please describe your company policies. Consider including:\n\n${policyHints.map(hint => `• ${hint}`).join('\n')}`}
          minRows={8}
          maxRows={12}
          variant="bordered"
          classNames={{
            input: "text-white",
            inputWrapper: "border-secondary bg-background",
            description: "text-gray-50"
          }}
          description="This information will be used by the AI assistant to provide accurate responses to customer inquiries"
        />
        
        {isDirty && (
          <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-orange-800 font-medium">
                You have unsaved changes
              </span>
            </div>
            <Button
              color="primary"
              onPress={handleSaveClick}
              isLoading={isLoading}
              size="sm"
            >
              Save Policy
            </Button>
          </div>
        )}
        
        {!policy && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Why is this important?</h4>
            <p className="text-sm text-blue-700">
              A well-defined company policy helps the AI assistant provide consistent and accurate information 
              about your business to customers, improving their experience and reducing confusion.
            </p>
          </div>
        )}
      </CardBody>

      <ConfirmationModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        title="Save Company Policy"
        message="Are you sure you want to save these policy changes? This will update your company's AI assistant behavior."
        confirmText="Save Policy"
        cancelText="Cancel"
        variant="info"
      />
    </Card>
  );
}