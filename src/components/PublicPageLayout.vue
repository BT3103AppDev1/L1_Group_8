<template>
    <div class="consent-page">
        <img src="@/assets/background-decoration.png" class="bg-decoration"/>
        <div class="logo-container">
            <div class="logo-content">
                <img src="@/assets/logo.png" alt="NUSOS Logo" class="logo" />
            </div>
        </div>

        <div class="right-container">
            <div class="right-card">
                <slot /> 
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PublicPageLayout',
}
</script>

<style scoped> 
.consent-page {
    display: flex;
    padding: 2rem;
    background-color: var(--primary);
}

.bg-decoration {
    width: 100vw;
    height: auto;
    position: absolute;
    top: 10vh;
    left: 0;
    z-index: 0;
    pointer-events: none;
}

.logo-container, .right-container {
    z-index: 1;
}

.logo-container {
    position: absolute;
    top: 15vh;
    left: 15vw;
    width: 25vw;
    display: flex;
    align-items: center;
    justify-content: center; 
    top: 25vh;
}

.logo-content {
    width: 20vw;
    height: 20vw;
    border-radius: 50%;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--card-shadow);
}

.logo {
    width: 15vw;
    object-fit: contain;
}

.right-container {
    padding-left: 45vw;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
}

.right-card {
    background-color: var(--white);
    border-radius: var(--radius);
    padding: 2.75rem;
    box-shadow: var(--card-shadow);
    width: 40vw;
}
</style>