<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-blue-600 text-white shadow">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold">Meine Einkaufsliste</h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>