"use client";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  type: "image" | "video";
}

export function MediaPreviewModal({ isOpen, onClose, src, type }: MediaPreviewModalProps) {
  if (!src) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {type === "video" ? "Aperçu vidéo" : "Aperçu image"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </ModalHeader>
        
        <ModalBody className="pb-6">
          {/* 16:9 aspect ratio container (YouTube format) */}
          <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
            {type === "video" ? (
              <video
                key={src}
                src={src}
                controls
                autoPlay
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <img
                src={src}
                alt="Preview"
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "contain" }}
              />
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
