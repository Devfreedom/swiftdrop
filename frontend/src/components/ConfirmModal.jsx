// Confirmation modal for destructive actions (cancel, refund, suspend).
// Focus trap + Escape come from the kit Modal.
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel, danger = true }) {
  return (
    <Modal
      open={open} title={title} onClose={onCancel}
      actions={
        <>
          <Button onClick={onCancel}>Keep it</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
