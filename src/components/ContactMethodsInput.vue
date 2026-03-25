<template>
    <div class="input-container">
        <h4 class="input-section-title">
            Contact Methods *
        </h4>
        <hr class="divider">
        <p v-if="displayHelper" class="input-info" style="margin-top: 0; margin-bottom: 12px">
            Please provide at least one contact method for communication during
            service exchange.
        </p>
        <p v-else class="input-info input-info--invalid" aria-live="polite">
            Either mobile number or Telegram handle must be provided!
        </p>

        <!-- mobile number input -->
        <div class="mobile-section">
            <label class="input-label" for="mobile-number">
                Mobile Number
            </label>
            <vue-tel-input
                v-model="mobile"
                :default-country="initialCountryCode"
                :auto-default-country="false"
                mode="national"
                :dropdown-options="{
                    showDialCodeInSelection: true,
                    showDialCodeInList: true,
                    showFlags: true,
                    showSearchBox: true,
                    searchBoxPlaceholder: 'Search country…',
                }"
                :input-options="{
                    id: 'mobile-number',
                    name: 'mobile',
                    styleClasses: mobileInputClass,
                }"
                :valid-characters-only="true"
                :disabled="isSubmitting"
                class="mobile-input-wrapper"
                :class="{ 'mobile-input-wrapper--invalid': mobileStatus === 'invalid' || !displayHelper }"
                @validate="onMobileValidate"
                @blur="onMobileBlur"
            />

            <p v-if="mobileStatus === 'invalid'" class="input-info input-info--invalid"
                aria-live="polite">
                    {{ mobileError }}
            </p>
            <p v-else-if="mobileStatus === 'valid'" class="input-info input-info--valid"
                aria-live="polite">
                    Valid
            </p>

            <!-- communication preferences -->
            <transition name="fade">
                <div v-if="mobileStatus === 'valid'" class="preferences">
                    <p class="input-info" :class="{ 'input-info--error': preferencesError }">
                        Please select at least one communication preference.
                    </p>
                    <div class="checkbox-grid">
                        <label class="checkbox-label">
                        <input
                            v-model="acceptCalls"
                            type="checkbox"
                            class="checkbox-input"
                            :class="{'checkbox-input--invalid': preferencesError}"
                            :disabled="isSubmitting"
                            @change="onPreferencesChange"
                        />
                        <span class="checkbox-text">Accept Calls</span>
                        </label>

                        <label class="checkbox-label">
                        <input
                            v-model="acceptMessages"
                            type="checkbox"
                            class="checkbox-input"
                            :class="{'checkbox-input--invalid': preferencesError}"
                            :disabled="isSubmitting"
                            @change="onPreferencesChange"
                        />
                        <span class="checkbox-text">Accept Messages</span>
                        </label>
                        
                        <label class="checkbox-label">
                        <input
                            v-model="acceptWhatsApp"
                            type="checkbox"
                            class="checkbox-input"
                            :class="{'checkbox-input--invalid': preferencesError}"
                            :disabled="isSubmitting"
                            @change="onPreferencesChange"
                        />
                        <span class="checkbox-text">Accept WhatsApp</span>
                        </label>
                    </div>
                    </div>
            </transition>
        </div>
        
        <!-- Telegram Handle -->
        <div class="telegram-section">
            <label class="input-label" for="telegram-handle">
                Telegram Handle
            </label>
            <div class="telegram-row">
                <span class="telegram-prefix">@</span>
                <input
                    id="telegram-handle"
                    v-model="telegram"
                    type="text"
                    class="input-field telegram-input"
                    :class="{
                        'input-field--invalid': telegramStatus === 'invalid',
                        'input-field--valid': telegramStatus === 'valid',
                    }"
                    :disabled="isSubmitting"
                    autocomplete="off"
                    @input="onTelegramInput"
                    @blur="onTelegramBlur"
                />
            </div>
            <p v-if="telegramStatus === 'invalid'" class="input-info input-info--invalid"
                aria-live="polite">
                    {{ telegramError }}
            </p>
            <p v-else-if="telegramStatus === 'valid'" class="input-info input-info--valid"
                aria-live="polite">
                Valid
            </p>
        </div>
    </div>
</template>

<script>
import { VueTelInput } from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";

export default {
    name: "ContactMethodsInput",

    components: { 
        VueTelInput 
    },

    props: {
        isSubmitting: {
            type: Boolean,
            default: false,
        },
        initialMobile: {
            type: String,
            default: "",
        },
        initialCountryCode: {
            type: String,
            default: "SG",
        },
        initialDialCode: {
            type: String,
            default: "+65",
        },  
        initialTelegram: {
            type: String,
            default: "",
        },
        initialAcceptCalls: {
            type: Boolean,
            default: false,
        },
        initialAcceptMessages: {
            type: Boolean,
            default: false,     
        },
        initialAcceptWhatsApp: {
            type: Boolean,
            default: false,
        }
    },

    emits: [
        "contact-change", // {mobile, countryCode, dialCode, acceptCalls, acceptMessages, acceptWhatsApp, telegram}
    ],

    data() {
        return {
            // mobile
            mobile: this.initialMobile,
            mobileStatus: this.initialMobile ? "valid" : "idle", // idle or valid or invalid
            mobileError: "",
            countryCode: this.initialCountryCode,
            dialCode: this.initialDialCode,
            acceptCalls: this.initialAcceptCalls,
            acceptMessages: this.initialAcceptMessages,
            acceptWhatsApp: this.initialAcceptWhatsApp,
            preferencesError: false,

            // Telegram
            telegram: this.initialTelegram,
            telegramStatus: this.initialTelegram ? "valid" : "idle", // idle or valid or invalid
            telegramError: "",

            // global
            triggeredValidation: false, // whether the parent has triggered validation 
        };
    },

    computed: {
        mobileInputClass() {
            if (this.mobileStatus === "invalid") return "input-field--invalid";
            if (this.mobileStatus === "valid") return "input-field--valid";
            return "";
        },
        hasContactMethods() {
            return (
                (this.mobileStatus === "valid" && this.mobile) ||
                (this.telegramStatus === "valid" && this.telegram)
            );
        }
    },

    watch: {
        mobileStatus(newStatus) {
            if (newStatus !== "valid") {
                this.acceptCalls = false;
                this.acceptMessages = false;
                this.acceptWhatsApp = false;
                this.preferencesError = false;
            }
            this.emitChange();
        },
        telegramStatus() {
            this.emitChange();
        },
        acceptCalls() {
            this.emitChange();
        },
        acceptMessages() {
            this.emitChange();
        },
        acceptWhatsApp() {
            this.emitChange();
        },
    },

    methods: {
        emitChange() {
            this.$emit("contact-change", {
                mobile: this.mobileStatus === "valid" ? this.mobile : "",
                countryCode: this.mobileStatus === "valid" ? this.countryCode : "",
                dialCode: this.mobileStatus === "valid" ? this.dialCode : "",
                acceptCalls: this.mobileStatus === "valid" ? this.acceptCalls : false,
                acceptMessages: this.mobileStatus === "valid" ? this.acceptMessages : false,
                acceptWhatsApp: this.mobileStatus === "valid" ? this.acceptWhatsApp : false,
                telegram: this.telegramStatus === "valid" ? this.telegram : "",
            });
        },

        displayHelper() {
            return !this.triggeredValidation || this.hasContactMethods; 
        },        

        // mobile
        onMobileValidate(result) {
            if (!this.mobile || this.mobile.trim() === "") {
                this.mobileStatus = "idle";
                this.mobileError = "";
                return;
            }
            if (result.valid) {
                this.mobileStatus = "valid";
                this.mobileError = "";
                this.countryCode = result.country?.iso2 ?? "SG";
                this.dialCode = result.country?.dialCode ? `+${result.country.dialCode}` : "+65";  
            } else {
                this.mobileStatus = "invalid";
                this.mobileError = "Please enter a valid phone number for the selected country.";
            }
        },

        onMobileBlur() {
            if (!this.mobile || this.mobile.trim() === "") {
                this.mobileStatus = "idle";
            }
        },

        onPreferencesChange() {
            const anyChecked = this.acceptCalls || this.acceptMessages || this.acceptWhatsApp;
            this.preferencesError = !anyChecked;
        },

        // Telegram
        onTelegramInput() {
            if (this.telegram.startsWith("@")) {
                this.telegramStatus = "invalid";
                this.telegramError = 'Do not include "@" as it is shown as a prefix already.';
                return;
            }
            if (this.telegram.trim() === "") {
                this.telegramStatus = "idle";
                this.isTelegramValid = false;
                return;
            }
            this.telegramStatus = "valid";
            this.telegramError = "";
        },

        onTelegramBlur() {
            if (this.telegram && this.telegramStatus === "idle") {
                this.onTelegramInput();
            }
        },

        // call by parent to check if form is valid before submit 
        triggerValidation() {
            this.triggeredValidation = true;
            if (!this.hasContactMethods()) {
                return false;
            }

            if (this.mobileStatus === "valid" && !this.mobile) {
                const anyChecked = this.acceptCalls || this.acceptMessages || this.acceptWhatsApp;
                if (!anyChecked) {
                    this.preferencesError = true;
                    return false;
                }
            }

            return true;
        },
    },
};
</script>

<style scoped>
.input-section-title {
    font-size: 1.125rem;
    font-weight: bold;
    color: var(--gray2);
}

.divider {
    width: 100%;
}

:deep(.vue-tel-input) {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid var(--gray4);
    border-radius: var(--radius);
    background: var(--white);
    font-family: inherit;
    font-size: 1rem;
    color: var(--gray2);
    line-height: 1.5;
    letter-spacing: 0.02em;
    transition: border-color 0.15s, box-shadow 0.15s;
    display: flex;
    align-items: center;
}

:deep(.vue-tel-input:focus-within) {
    border-color: var(--primary);
    box-shadow: var(--card-shadow);
}

:deep(.vue-tel-input input) {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    letter-spacing: inherit;
    color: inherit;
    padding: 0.875rem 0.75rem;
    border: none;
    background: transparent;
    width: 100%;
}

:deep(.vue-tel-input input:focus) {
    outline: none;
}

:deep(.vl-dropdown .vl-selection) {
    padding: 0 0.75rem;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    letter-spacing: inherit;
}

:deep(.vl-dropdown) {
    border-radius: var(--radius);
}

:deep(.vl-dropdown li) {
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    letter-spacing: 0.02em;
    transition: background-color 0.15s, color 0.15s;
}

.mobile-input-wrapper--invalid :deep(.vue-tel-input) {
    border-color: var(--error) !important;
}

.preferences {
    margin-top: 0.75rem;
}

.checkbox-grid {
    display: grid;
    grid-template-columns: repeat(2, auto);
    gap: 0.5rem 1.5rem;
    justify-content: start;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--gray2);
    user-select: none;
}

.checkbox-input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--primary);
    border-radius: 0.25rem;
    cursor: pointer;
}

.checkbox-input--invalid {
    outline: 1.5px solid var(--error);
}

.mobile-section, .telegram-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%; 
    margin-bottom: 1rem;
}

.telegram-row {
    display: flex;
    align-items: center;
}

.telegram-prefix {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.75rem;
    height: 1100%;
    background: var(--white);
    font-size: 1rem;
    color: var(--gray2);
    font-weight: bold;
    line-height: 1.5;
    box-sizing: border-box;
}

.telegram-input {
    border-radius: var(--radius);
    flex: 1;
}

/* Transition */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0; 
    transform: translateY(-4px);
}
</style>