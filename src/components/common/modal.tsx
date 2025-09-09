import React from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ open, title, onClose, actions, children }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && <h3>{title}</h3>}
        <div className="modal-body">{children}</div>
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  );
};
export default Modal;
