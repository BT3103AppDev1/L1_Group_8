<template>
    <div class="input-container">
        <label class="input-label">
            Profile Picture
            <span class="input-label--optional">(Optional)</span>
        </label>

        <div class="profile-pic-container">
            <img :src="profilePicUrl || defaultProfilePic" alt="Profile picture preview" 
                class="profile-pic-preview"/>
        </div>

        <div v-if="profilePicUrl" class="actions-if-uploaded">
            <button class="btn text-link" @click="revertToDefault" :disabled="isSubmitting">
                Revert To Default
            </button>
            <button type="button" class="btn btn-primary" :disabled="isSubmitting"
                @click="triggerFileInput">
                    Change Photo
            </button>
        </div>

        <div v-else class="action-if-not-uploaded">
             <button type="button" class="btn btn-primary" :disabled="isSubmitting"
                @click="triggerFileInput">   
                    Upload Photo
            </button>
        </div> 

        <input
            ref="fileInput"
            type="file"
            accept=".jpg,.jpeg,.png,.heic,.heif"
            style="display: none"
            @change="onFileSelected"
        />

        <p class="input-info file-requirements">
            Supported file types: jpg, jpeg, png, heic, heif. Maximum file size: 5MB.
        </p>

        <crop-modal :showModal="showCropModal" :imageSrc="rawImageSrc" 
            @update:showModal="onCropModalClose" @crop-done="onCropDone"/>
    </div>
</template>

<script>
import defaultProfilePic from '@/assets/default-profile-pic.png';
import CropModal from './CropModal.vue';

const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|heic|heif)$/i;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default {
    name: "ProfilePictureInput",

    components: { CropModal },

    props: {
        initialUrl: {
            type: String,
            default: null,
        },
        isSubmitting: {
            type: Boolean,
            default: false,
        },
    },

    emits: ["status-object"],

    data() {
        return {
            profilePicUrl: this.initialUrl, 
            status: "idle", // idle or ready 
            // idle: no new file selected or reverted to default
            // ready: file selected and valid, blob ready for parent to upload on submit
            blob: null,
            defaultProfilePic,
            showCropModal: false,
            rawImageSrc: "",
        };
    },

    watch: {
        status() {
            this.emitStatus();
        },
    },

    mounted() {
        this.emitStatus();
    },

    methods: {
        triggerFileInput() {
            this.$refs.fileInput.value = "";
            this.$refs.fileInput.click();
        },

        revertToDefault() {
            this.profilePicUrl = "";
            this.blob = null;
            this.status = "idle";
        },

        onFileSelected(event) {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            if (!ALLOWED_EXTENSIONS.test(file.name) || !ALLOWED_TYPES.includes(file.type)) {
                alert("Invalid file type. Please upload a jpg, jpeg, png, heic, or heif file.");
                return;
            }

            if (file.size > MAX_SIZE_BYTES) {
                alert("File is too large. Maximum allowed size is 5 MB.");
                return;
            }

            this.rawImageSrc = URL.createObjectURL(file);
            this.showCropModal = true;
        },

        onCropModalClose(val) {
            // opening handled by onFileSelected, so just need to clean up when closing
            if (!val) {
                this.showCropModal = false;
                if (this.rawImageSrc) {
                    URL.revokeObjectURL(this.rawImageSrc);
                    this.rawImageSrc = "";
                }
            }
        },

        onCropDone({ blob, dataUrl }) {
            if (this.rawImageSrc) {
                URL.revokeObjectURL(this.rawImageSrc);
                this.rawImageSrc = "";
            }
            this.profilePicUrl = dataUrl;
            this.blob = blob;
            this.status = "ready";
        },

        emitStatus() {
            this.$emit("status-object", {
                status: this.status,
                blob: this.status === "ready" ? this.blob : null,
            });
        },
  },
};
</script>

<style scoped>
.profile-pic-container {
    display: flex;
    justify-content: center
}

.profile-pic-preview {
    width: 9vw;
    height: 9vw;
    border-radius: 50%;
    object-fit: cover;
}

.action-if-not-uploaded {
    margin-top: 0.5rem;
}

.actions-if-uploaded, .action-if-not-uploaded {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    margin-bottom: 0.5rem;
}

.text-link {
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: bold;
    color: var(--primary);
    cursor: pointer;
}

.text-link:hover {
    color: var(--primary-hover);
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

.file-requirements {
    min-height: 0;
}
</style>
