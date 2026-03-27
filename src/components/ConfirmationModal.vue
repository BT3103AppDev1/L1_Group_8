<template>
    <modal-overlay :showModal="showModal">
        <div class="confirmation-modal">
            <button class="close-modal" aria-label="Close modal" @click="onClose">
                &times;
            </button>
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-body">
                <slot />
            </p>
            <div class="confirmation-buttons">
                <slot name="buttons" />
            </div>
        </div>
    </modal-overlay>
</template>

<script>
import ModalOverlay from "./ModalOverlay.vue";

export default {
    name: "ConfirmationModal",

    components: { ModalOverlay },

    props: {
        showModal: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: "",
        },
    },

    emits: ["update:showModal"],

    methods: {
        onClose() {
            this.$emit("update:showModal", false);
        },
    }
};
</script>

<style scoped>
.confirmation-modal {
    position: relative;
    background: var(--white);
    border-radius: var(--radius);
    width: 50vw;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 90vh;
    overflow-y: auto;
}


.close-modal {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 1.875rem;
    height: 1.875rem;
    border-radius: var(--radius);
    background: var(--gray4);
    border: none;
    color: var(--white);
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    line-height: 1;
}

.close-modal:hover {
    background-color: var(--gray5);
}

.modal-title {
    font-size: 2rem;
    font-weight: bold;
}

.modal-body {
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
}

.confirmation-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    padding: 0 3.5rem;
}
</style>