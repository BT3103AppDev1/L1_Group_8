<template>
    <div class="input-container">
        <label class="input-label" for="username">
        Username <span class="compulsory">*</span>
        </label>

        <input 
            id="username" 
            type="text" 
            v-model.trim="localValue" 
            class="input-field"
            :class="{
                'input-field--invalid': status === 'invalid',
                'input-field--valid': status === 'valid',
            }"
            autocomplete="username"
            maxlength="20"
            @input="onInput"
            @blur="onBlur"
        />

        <p v-if="status === 'invalid'" class="input-info input-info--invalid"
            aria-live="polite">
            {{ errorMessage }}
        </p>
        <p v-else-if="status === 'valid'" class="input-info input-info--valid"
            aria-live="polite">Valid</p>
        <div v-else-if="status === 'checking'" class="input-info--checking" 
            role="status" aria-live="polite" aria-label="Checking username validity">
            <VueSpinnerDots size="16" color="var(--secondary)"/>
        </div>
        <p v-else class="input-info">
            3–20 characters. Use letters, numbers, _ or - only. Cannot start or end
            with _ or -. No spaces or other special characters.
        </p>
    </div>
</template>

<script>
import { query, collection, where, getDocs } from 'firebase/firestore'; 
import { db } from '@/firebase.js';
import VueSpinnerDots from 'vue-spinner/src/Dots.vue';

export default {
    name: "UsernameInput",

    components: {
        VueSpinnerDots,
    },

    props: {
        initialValue: {
            type: String,
            default: "",
        }
    },

    emits: ["status-object"], // {status, value}

    data() {
        return {
            localValue: this.initialValue,
            status: "untouched", // untouched or touched (focused at least once but currently empty) or checking or valid or invalid
            errorMessage: "",
            debounceTimer: null,
        };
    },

    watch: {
        status() {
            this.emitStatus();
        },
    },

    methods: {
        emitStatus() {
            this.$emit("status-object", { 
                status: this.status, 
                value: this.status === "valid" ? this.localValue : "",
            });
        },

        onInput() {
            clearTimeout(this.debounceTimer);
            if (!this.localValue) {
                this.status = "touched";
                return;
            }
            this.debounceTimer = setTimeout(() => this.validate(), 400); // validate if user stops typing for 400ms
        },

        onBlur() {
            this.validate();
            this.checkUniquness();
        },

        setError(message) {
            this.status = "invalid";
            this.errorMessage = message;
        },

        validate() {
            this.status = "checking";
            const username = this.localValue;

            if (!username) {
                this.setError("Username is required.");
                return;
            }
            if (username.length < 3) {
                this.setError("Username must be at least 3 characters.");
                return;
            }
            if (username.length > 20) {
                this.setError("Username must be at most 20 characters.");
                return;
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                this.setError(
                "Only letters, numbers, underscores, and hyphens are allowed."
                );
                return;
            }
            if (/^[_-]|[_-]$/.test(username)) {
                this.setError("Username must not start or end with _ or -.");
                return;
            }
            if (/NUSOS/i.test(username)) {
                this.setError('"NUSOS" is a reserved name.');
                return;
            }
        },

        async checkUniquness() {
            this.status = "checking";
            try {
                const queryRef = query(collection(db, "users"), where("usernameLower", "==", this.localValue.toLowerCase()));
                const querySnapshot = await getDocs(queryRef);
                if (!querySnapshot.empty) {
                    this.setError("This username is already taken.");
                    return false;
                }
                this.status = "valid";
                this.errorMessage = "";
                return true;
            } catch {
                this.setError("Unable to verify username. Click inside the input box and then click elsewhere to retry.");
                return false;
            }
        },

        // called by parent to trigger validation before submit
        async triggerValidation() {
            await this.validate();
            await this.checkUniquness();
        },
    },

    mounted() {
        this.emitStatus(); // let parent know initial status
    },
};
</script>