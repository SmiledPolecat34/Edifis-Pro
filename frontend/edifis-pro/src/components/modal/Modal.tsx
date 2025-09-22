import React from 'react';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ show, onClose, children }: ModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        {/* bouton fermer */}
        <button
          onClick={onClose}
          aria-label="Fermer la fenêtre modale"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-tr-lg p-1 transition"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
