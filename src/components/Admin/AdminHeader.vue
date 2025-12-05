<script setup>
// FIX 1: Do NOT destructure props, keep them as a single reactive object.
const props = defineProps({
    currentTab: String,
    toggleSidebar: Function
});

// FIX 2: No need to fix 'defineProps is not defined' error here, 
// as using it correctly (without `const defineProps = ...`) often resolves the ESLint issue 
// after applying the fix across all files and restarting the compiler.
</script>

<template>
    <header class="top-bar">
        <div class="header-left">
            <!-- FIX: Access prop via props.toggleSidebar -->
            <button class="menu-toggle" @click="props.toggleSidebar">☰</button>
            <div class="page-title">
                <!-- FIX: Access props via props.currentTab -->
                <h1>{{ props.currentTab === 'dsa' ? 'DSA Analytics' : props.currentTab.charAt(0).toUpperCase() +
                    props.currentTab.slice(1) }}</h1>
            </div>
        </div>
        <div class="user-profile">
            <div class="avatar-circle">A</div>
            <span class="username-text">Administrator</span>
        </div>
    </header>
</template>

<style scoped>
/* Header CSS copied from original AdminDashboardView.vue */
.top-bar {
    height: 70px;
    background: white;
    border-bottom: 1px solid #CFD8DC;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    flex-shrink: 0;
}

.header-left {
    display: flex;
    align-items: center;
}

.page-title h1 {
    font-size: 1.2rem;
    color: #1565C0;
    margin: 0;
}

.user-profile {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    font-weight: 500;
    color: #37474F;
}

.avatar-circle {
    width: 35px;
    height: 35px;
    background-color: #1565C0;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    font-weight: bold;
}

.menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    margin-right: 15px;
    color: #333;
}

@media (max-width: 768px) {
    .menu-toggle {
        display: block;
    }

    .username-text {
        display: none;
    }
}
</style>












