<template>
    <teleport to="body">
        <transition name="modal">
            <div v-if="showModal" class="modal-overlay">
                <slot />
            </div>
        </transition>
    </teleport>
</template>

<script>
export default {
    name: "ModalOverlay",

    props: {
        showModal: {
            type: Boolean,
            default: false,
        },
    },

    watch: {
        showModal(newVal) {
            document.body.style.overflow = newVal ? "hidden" : "";
        },
    },

    unmounted() {
        document.body.style.overflow = "";
    },
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(181, 181, 181, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    box-sizing: border-box;
}

.modal-enter-active, .modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
    opacity: 0;
}
</style>