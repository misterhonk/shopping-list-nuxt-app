import { defineNuxtPlugin } from '#app';

/**
 * Hinweis: Dieser Plugin ist überflüssig, da wir Pinia bereits über das Nuxt-Modul einbinden
 * Wir belassen ihn hier als Referenz, aber er wird nicht geladen
 * 
 * Nuxt 3 verwendet automatisch Pinia, wenn das @pinia/nuxt-Modul installiert ist
 */

/*
import { createPinia } from 'pinia'

export default defineNuxtPlugin(nuxtApp => {
  const pinia = createPinia()
  nuxtApp.vueApp.use(pinia)
})
*/
