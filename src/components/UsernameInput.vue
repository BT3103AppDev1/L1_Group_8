<template>
  <div class="input-container">
    <label class="input-label" for="username">
      Username <span class="compulsory">*</span>
    </label>

    <input id="username" type="text" v-model="localUsername" class="input-field"
      :class="{
        'input-field--invalid': status === 'invalid',
        'input-field--valid': status === 'valid',
      }"
      autocomplete="username"
      maxlength="20"
      @input="onInput"
      @blur="onBlur"
    />

    <!-- Status feedback replaces the hint -->
    <p
      v-if="status === 'error'"
      class="field-hint field-hint--error"
      aria-live="polite"
    >
      {{ errorMessage }}
    </p>
    <p
      v-else-if="status === 'valid'"
      class="field-hint field-hint--valid"
      aria-live="polite"
    >
      Valid
    </p>
    <p v-else class="field-hint">
      3–20 characters. Use letters, numbers, _ or - only. Cannot start or end
      with _ or -. No spaces or other special characters.
    </p>
  </div>
</template>

<script>
export default {
  name: "UsernameInput",

  props: {
    modelValue: {
      type: String,
      default: "",
    },
    /**
     * Pass a function (async ok) that resolves to true if username is taken.
     * Signature: (username: string) => Promise<boolean>
     */
    checkTaken: {
      type: Function,
      default: null,
    },
  },

  emits: ["update:modelValue", "valid", "invalid"],

  data() {
    return {
      localValue: this.modelValue,
      status: "idle", // 'idle' | 'checking' | 'valid' | 'error'
      errorMessage: "",
      debounceTimer: null,
    };
  },

  watch: {
    modelValue(val) {
      if (val !== this.localValue) this.localValue = val;
    },
  },

  methods: {
    onInput() {
      this.$emit("update:modelValue", this.localValue);
      clearTimeout(this.debounceTimer);
      if (!this.localValue) {
        this.status = "idle";
        return;
      }
      this.debounceTimer = setTimeout(() => this.validate(), 400);
    },

    onBlur() {
      if (this.localValue || this.status !== "idle") this.validate();
    },

    async validate() {
      const v = this.localValue;

      if (!v) {
        this.setError("Username is required.");
        return;
      }
      if (v.length < 3) {
        this.setError("Username must be at least 3 characters.");
        return;
      }
      if (v.length > 20) {
        this.setError("Username must be at most 20 characters.");
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(v)) {
        this.setError(
          "Only letters, numbers, underscores, and hyphens are allowed."
        );
        return;
      }
      if (/^[_-]|[_-]$/.test(v)) {
        this.setError("Cannot start or end with _ or -.");
        return;
      }
      if (/NUSOS/i.test(v)) {
        this.setError('"NUSOS" is a reserved name.');
        return;
      }

      // Async uniqueness check
      if (this.checkTaken) {
        this.status = "checking";
        try {
          const taken = await this.checkTaken(v);
          if (taken) {
            this.setError("This username is already taken.");
            return;
          }
        } catch {
          this.setError("Could not verify username. Please try again.");
          return;
        }
      }

      this.status = "valid";
      this.errorMessage = "";
      this.$emit("valid", v);
    },

    setError(msg) {
      this.status = "error";
      this.errorMessage = msg;
      this.$emit("invalid");
    },

    /** Called by parent to trigger full validation before submit */
    async triggerValidation() {
      await this.validate();
      return this.status === "valid";
    },
  },
};
</script>