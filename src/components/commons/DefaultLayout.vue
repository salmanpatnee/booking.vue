<script setup>
import { onMounted, computed } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from './AppSidebar.vue';
import AppFooter from './AppFooter.vue';
import AppHeader from './AppHeader.vue';

onMounted(() => {
    const sidebar = document.getElementsByClassName("js-sidebar")[0];
    const sidebarToggle = document.getElementsByClassName("js-sidebar-toggle")[0];
    sidebar &&
        sidebarToggle &&
        sidebarToggle.addEventListener("click", function () {
            sidebar.classList.toggle("collapsed"),
                sidebar.addEventListener("transitionend", function () {
                    window.dispatchEvent(new Event("resize"));
                });
        });
})



</script>

<template>
    <div class="wrapper">
        <AppSidebar />

        <div class="main">
            <AppHeader />

            <main class="content">
                <div class="container-fluid p-0 h-100">

                    <RouterView />

                </div>
            </main>

            <AppFooter />
        </div>
    </div>
</template>


