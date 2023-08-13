export {}

import { FunctionalComponent } from 'vue'
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    pageTitle?: string
    guestOnly?: boolean
    requiresAuth?: boolean
    useHeader?: boolean
    navLink?: {
      group: 'Student' | 'Apps' | '_meta'
      title: string
      order: number
      icon: FunctionalComponent
      activeIcon: FunctionalComponent
    }
  }
}
