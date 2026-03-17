<template>
    <footer class="footer">
        <hr class="footer-divider">
        <div class="footer-content">
            <div class="footer-left">
                <img src="@/assets/logomark.png" alt="NUSOS Logomark" class="footer-logo">
                <span class="footer-copyright-text">&copy; 2026 NUSOS</span>
            </div>
            <div class="footer-right">
                <span>Contact us at <a href="mailto:nusos.project@gmail.com">nusos.project@gmail.com</a></span>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'TheFooter',
};
</script>

<style scoped>
.footer-divider {
    margin: 0.5rem max(2rem, 7vw) 0.5rem max(2rem, 7vw);
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.footer {
    width: 100%;
    bottom: 0;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem max(2rem, 7vw) 0.5rem max(2rem, 7vw);
    background-color: #fff;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.footer-logo {
    height: 3rem;
    width: auto;
}

.footer-copyright-text {
    font-size: 0.875rem;
    color: #4f4f4f;
}

.footer-right {
    font-size: 0.875rem;
    color: #000;
}
</style>