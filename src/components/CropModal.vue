<template>
    <modal-overlay :show-modal="showModal">
        <div class="crop-modal">
            <h3 class="modal-title">Crop Image</h3>

            <div class="crop-wrapper">
                <img ref="cropperImg" :src="imageSrc" alt="Image to crop" class="crop-img" />
            </div>

            <div class="action-buttons">
                <div class="zoom-buttons">
                    <button type="button" class="zoom-btn" aria-label="Zoom out" :disabled="!cropperReady || isSaving" @click="zoom(-0.1)">
                        <ZoomOut :size="28"/>
                    </button>
                    <button type="button" class="zoom-btn" aria-label="Zoom in" :disabled="!cropperReady || isSaving" @click="zoom(0.1)">
                        <ZoomIn :size="28"/>
                    </button>
                </div>

                <div class="complete-buttons">
                    <button type="button" class="btn btn-outline" :disabled="isSaving" @click="onCancel">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-primary" :disabled="!cropperReady || isSaving" @click="onSave">
                        Save
                    </button>
                </div>
            </div>

            <!-- spinner overlay -->
            <transition name="fade">
                <div v-if="isSaving" class="spinner-overlay">
                    <VueSpinner size="48" color="var(--secondary)" aria-label="Saving..."/>
                </div>
            </transition>
        </div>
    </modal-overlay>
</template>

<script>
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";
import ModalOverlay from "./ModalOverlay.vue";
import { ZoomIn, ZoomOut } from "lucide-vue-next";
import { VueSpinner } from "vue3-spinners";

const OUTPUT_SIZE = 400;

export default {
    name: "CropModal",

    components: { 
        ModalOverlay, 
        ZoomIn, 
        ZoomOut, 
        VueSpinner  
    },

    props: {
        showModal: {
            type: Boolean,
            default: false,
        },
        imageSrc: {
            type: String,
            default: "",
        },
    },

    emits: ["update:showModal", "crop-done"], // crop-done: { blob, dataUrl }

    data() {
        return {    
            cropper: null,
            cropperReady: false,
            isSaving: false,
        };
    },

    watch: {
        showModal(val) {
            if (val) {
                this.$nextTick(() => this.initCropper());
            } else {
                this.destroyCropper();
            }
        },
    },

    beforeUnmount() {
        this.destroyCropper();
    },

    methods: {
        initCropper() {
            this.cropperReady = false;
            this.isSaving = false;
            if (this.cropper) {
                this.destroyCropper();
            }

            this.cropper = new Cropper(this.$refs.cropperImg, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: "move",
                autoCropArea: 1,
                cropBoxMovable: false,
                cropBoxResizable: false,
                toggleDragModeOnDblclick: false,
                ready: () => { this.cropperReady = true; },
            });
        },

        destroyCropper() {
            if (this.cropper) {
                this.cropper.destroy();
                this.cropper = null;
            }
            this.cropperReady = false;
            this.isSaving = false;
        },

        zoom(amount) {
            this.cropper?.zoom(amount);
        },

        onCancel() {
            this.$emit("update:showModal", false);
        },

        onSave() {
            if (!this.cropper) {
                return;
            }

            this.isSaving = true;

            const canvas = this.cropper.getCroppedCanvas({
                width: OUTPUT_SIZE,
                height: OUTPUT_SIZE,
                imageSmoothingQuality: "high",
                fillColor: "var(--gray5)",
            });

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        this.isSaving = false;
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.$emit("crop-done", { blob, dataUrl: event.target.result });
                        this.$emit("update:showModal", false);
                        this.isSaving = false;
                    };
                    reader.readAsDataURL(blob);
                },
                "image/jpeg",
                0.85
            );
        },
    },
};
</script>

<style scoped>
.crop-modal {
    position: relative;
    background: var(--white);
    border-radius: var(--radius);
    width: 60vw;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.modal-title {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary);
    margin: 0;
    text-align: center;
}

.crop-wrapper {
    width: 100%;
    aspect-ratio: 1;
    max-height: 55vh;
    overflow: hidden;
    background: var(--gray5);
}

:deep(.cropper-view-box) {
    outline: none;
}

:deep(.cropper-face) {
    background: transparent;
    border-radius: 50%;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    opacity: 1;
}

:deep(.cropper-modal) {
    display: none;
}

:deep(.cropper-dashed), :deep(.cropper-center) {
    display: none;
}

.crop-img {
    display: block;
    max-width: 100%;
}

.action-buttons {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
}

.zoom-buttons{
    display: flex;
    gap: 0.5rem;
}

.zoom-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--primary);
    background-color: var(--white);
    border: none;
}

.zoom-btn:hover:not(:disabled) {
    color: var(--primary-hover);
}

.zoom-btn:disabled {
    color: var(--gray5);
    cursor: not-allowed;
}

.btn {
    display: flex;
    justify-content: center;
    align-content: center;
    padding: 0.75rem 0;
    width: 15vw;
}

.btn:disabled {
    background-color: var(--gray5);
    border: var(--gray5);
    color: var(--white);
    cursor: not-allowed;
}

.complete-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.saving-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>