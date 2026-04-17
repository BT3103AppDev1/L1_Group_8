<template>
    <div class="public-page">
        <div class="bg-decoration-container">
            <img src="@/assets/background-decoration.png" class="bg-decoration"/>
        </div>
        <div class="logo-container big-screen-only">
            <div class="logo-content">
                <img src="@/assets/logo.png" alt="NUSOS Logo" class="logo" />
            </div>
        </div>
        <div class="right-container">
            <div class="right-card">
                <div class="small-screen-only">
                    <img src="@/assets/logo.png" alt="NUSOS Logo" class="logo-small" />
                </div>
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
.small-screen-only {
    display: none;
    width: 100%;
}

.public-page {
    display: flex;
    padding: 2rem;
    background-color: var(--primary);
    min-height: 91vh;
    position: relative;
}

.bg-decoration-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    flex: 1;
}

.bg-decoration {
    width: 100vw;
    height: auto;
    position: absolute;
    top: 10vh;
    left: 0;
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
    min-height: 100%;
}

.right-card {
    background-color: var(--white);
    border-radius: var(--radius);
    padding: 2.75rem;
    box-shadow: var(--card-shadow);
    width: 40vw;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

@media (max-width: 1028px) {
    .small-screen-only {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
    }

    .logo-small {
        width: 8rem;
        object-fit: contain;
        display: block;
    }
    
    .big-screen-only {
        display: none;
    }  

    .public-page {
        padding: 2rem;
        justify-content: center;
        align-items: center;
    }

    .right-container {
        padding: 0;
        justify-content: center;
        width: 80%;
    }

    .right-card {
        width: 100%;
        padding: 2rem;
    }
}
</style>