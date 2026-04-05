<template>
    <modal-overlay :showModal="showModal">
        <div class="info-modal">
            <button class="close-modal" aria-label="Close modal" @click="onClose">
                &times;
            </button>
            <p class="modal-body">
                <slot />
            </p>
        </div>
    </modal-overlay>
</template>

<script>
import ModalOverlay from "./ModalOverlay.vue";

export default {
    name: "InfoModal",

    components: { ModalOverlay },

    props: {
        showModal: {
            type: Boolean,
            default: false,
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
.info-modal {
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

.modal-body {
    font-size: 0.875rem;
    text-align: center;
}
</style>