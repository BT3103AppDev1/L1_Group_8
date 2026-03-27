<template>
    <div class="input-container">
        <label class="input-label" for="username">
            Username *
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
            autocomplete="off"
            maxlength="20"
            @input="onInput"
            @blur="onBlur"
            :disabled="isSubmitting"
        />

        <p v-if="status === 'invalid'" class="input-info input-info--invalid input-info--long"
            aria-live="polite">
            {{ errorMessage }}
        </p>
        <p v-else-if="status === 'valid'" class="input-info input-info--valid input-info--long"
            aria-live="polite">Valid</p>
        <div v-else-if="status === 'checking'" class="input-info--checking" 
            role="status" aria-live="polite" aria-label="Checking username validity">
            <VueSpinnerDots size="24" color="var(--secondary)"/>
        </div>
        <p v-else class="input-info input-info--long">
            3–20 characters. Use letters, numbers, _ or - only. Cannot start or end
            with _ or -. No spaces or other special characters.
        </p>
    </div>
</template>

<script>
import { query, collection, where, getDocs } from 'firebase/firestore'; 
import { db } from '@/firebase.js';
import { VueSpinnerDots } from 'vue3-spinners';

export default {
    name: "UsernameInput",

    components: {
        VueSpinnerDots,
    },

    props: {
        initialValue: {
            type: String,
            default: "",
        },
        isSubmitting: {
            type: Boolean,
            default: false,
        },
    },

    emits: ["status-object"], // {status, value}

    data() {
        return {
            localValue: this.initialValue,
            status: this.initialValue ? "valid" : "idle", // idle or checking or valid or invalid
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
            this.status = "idle";
            if (!this.localValue) {
                return;
            }
            this.debounceTimer = setTimeout(() => this.validate(), 400); // validate if user stops typing for 400ms
        },

        onBlur() {
            const isValid = this.validate();
            if (isValid) {
                this.checkUniquness();
            }
        },

        setError(message) {
            this.status = "invalid";
            this.errorMessage = message;
        },

        validate() {
            const username = this.localValue;

            if (!username) {
                this.setError("Username cannot be left blank.");
                return false;
            }
            if (username.length < 3) {
                this.setError("Username must be at least 3 characters.");
                return false;
            }
            if (username.length > 20) {
                this.setError("Username must be at most 20 characters.");
                return false;
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                this.setError(
                    "Only letters, numbers, underscores, and hyphens are allowed."
                );
                return false;
            }
            if (/^[_-]|[_-]$/.test(username)) {
                this.setError("Username must not start or end with _ or -.");
                return false;
            }
            if (/NUSOS/i.test(username)) {
                this.setError('"NUSOS" is a reserved name.');
                return false;
            }

            this.errorMessage = "";
            return true;
        },

        async checkUniquness() {
            const valueToCheck = this.localValue;
            this.status = "checking";
            try {
                const queryRef = query(collection(db, "users"), where("username", "==", this.localValue));
                const querySnapshot = await getDocs(queryRef);
                if (this.localValue !== valueToCheck) {
                    return false; // user has changed the input while we were checking, so ignore this result
                }
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

        async fullValidation() {
            const isValid = this.validate();
            if (isValid) {
                return await this.checkUniquness();
            }
            return false;
        },
    },

    mounted() {
        this.emitStatus(); // let parent know initial status
    },
};
</script>
