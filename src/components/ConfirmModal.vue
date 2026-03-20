<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('cancel')">
      <div class="modal-box">
        <div class="modal-icon">{{ icon }}</div>
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-body">{{ message }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="$emit('cancel')">Cancel</button>
          <button :class="['btn', confirmClass]" @click="$emit('confirm')">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    icon:         { type: String, default: '❓' },
    title:        { type: String, required: true },
    message:      { type: String, required: true },
    confirmLabel: { type: String, default: 'Confirm' },
    confirmClass: { type: String, default: 'btn-primary' },
  },
  emits: ['confirm', 'cancel'],
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 36px 32px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  animation: pop-in 0.18s ease;
}
@keyframes pop-in {
  from { transform: scale(0.92); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
.modal-icon  { font-size: 34px; margin-bottom: 14px; }
.modal-title { font-size: 18px; font-weight: 700; color: #1D1D1D; margin-bottom: 8px; }
.modal-body  { font-size: 14px; color: #6E6E6E; margin-bottom: 24px; line-height: 22px; }
.modal-actions { display: flex; gap: 12px; justify-content: center; }
</style>
