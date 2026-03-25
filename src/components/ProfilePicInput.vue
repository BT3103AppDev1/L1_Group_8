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

        <p class="input-info">
            Supported file types: jpg, jpeg, png, heic, heif. Maximum file size: 5MB.
        </p>
    </div>
</template>

<script>
import defaultProfilePic from '@/assets/default-profile-pic.png';
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|heic|heif)$/i;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const OUTPUT_SIZE = 400; // 400 × 400 px

export default {
    name: "ProfilePictureInput",

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
            status: this.initialUrl ? "ready" : "idle", // idle or ready 
            // idle: no file selected or reverted to default
            // ready: file selected and valid, blob ready for parent to upload on submit
            blob: null,
            defaultProfilePic,
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

        async onFileSelected(event) {
            const file = event.target.files?.[0];
            if (!file) return;

            if (!ALLOWED_EXTENSIONS.test(file.name) || !ALLOWED_TYPES.includes(file.type)) {
                alert("Invalid file type. Please upload a jpg, jpeg, png, heic, or heif file.");

                return;
            }
            if (file.size > MAX_SIZE_BYTES) {
                alert("File is too large. Maximum allowed size is 5 MB.");
                return;
            }

            try {
                const { blob, dataUrl } = await this.processImage(file);
                this.profilePicUrl = dataUrl;
                this.blob = blob;
                this.status = "ready";
            } catch {
                alert("Failed to upload photo. Please try again.");
            }
        },

        processImage(file) {
            return new Promise((resolve, reject) => {
                const image = new Image();
                const objectUrl = URL.createObjectURL(file);

                image.onload = () => {
                    URL.revokeObjectURL(objectUrl);

                    const { naturalWidth: w, naturalHeight: h } = image;
                    const minSide = Math.min(w, h);
                    const x = (w - minSide) / 2;
                    const y = (h - minSide) / 2;

                    const canvas = document.createElement("canvas");
                    canvas.width = OUTPUT_SIZE;
                    canvas.height = OUTPUT_SIZE;
                    const context = canvas.getContext("2d");
                    context.drawImage(image, x, y, minSide, minSide, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) { 
                                reject(new Error("Canvas toBlob failed")); 
                                return; 
                            }
                            const reader = new FileReader();
                            reader.onload = (e) => resolve({ blob, dataUrl: e.target.result });
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        },
                        "image/jpeg",
                        0.85
                    );
                };

                image.onerror = reject;
                image.src = objectUrl;
            });
        },

        getBlob() {
            return this.blob;
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
</style>
