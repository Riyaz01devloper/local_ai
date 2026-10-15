/**
 * ConfirmModal — accessible confirmation dialog.
 * Replaces window.confirm() — fixes P1-8.
 */
function ConfirmModal({ title, description, confirmLabel = "Confirm", confirmDanger = false, onConfirm, onCancel }) {
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="modal">
        <h3 id="modal-title">{title}</h3>
        <p id="modal-desc">{description}</p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={confirmDanger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

