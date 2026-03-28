<template>
  <div></div>
</template>

<script>
// Sign-up is handled by SignIn.vue (combined auth page with tab toggle).
// This component redirects immediately.
export default {
  name: 'SignUp',
  created() {
    this.$router.replace({ name: 'SignIn' });
  },
};
</script>
