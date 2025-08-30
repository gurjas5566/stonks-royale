import React from "react";

const Modal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <p>{message}</p>
          <button onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
