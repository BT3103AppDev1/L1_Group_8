<template>
    <div class="page-header">
        <h1>{{ title }}</h1>
    </div>
</template>

<script>
export default {
    name: "PageHeader",
    props: {
        title: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
    .page-header {
        justify-content: left;
    }

    .page-header h1 {
        margin: 0;
        font-size: 36px;
        color: var(--primary);
    }

</style>

