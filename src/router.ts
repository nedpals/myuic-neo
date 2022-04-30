import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { client, eventbus } from './client';
import { IS_NATIVE } from './utils';

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 }
  },
  routes: [
    {
      name: 'login',
      path: '/login',
      component: () => import('./pages/Login.vue'),
      meta: {
        guestOnly: true
      }
    },
    {
      name: 'dashboard',
      path: '/',
      component: () => import('./pages/Dashboard.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          name: 'home',
          path: '/',
          component: () => import('./pages/Home.vue'),
          meta: {
            pageTitle: 'Home',
            useHeader: false
          }
        },
        ...(IS_NATIVE ? [
          {
            name: 'settings',
            path: '/settings',
            component: () => import('./pages/Settings.vue'),
            redirect: { name: 'notification-settings' },
            meta: {
              pageTitle: 'Settings',
              nativeOnly: true
            },
            children: [
              {
                name: 'notification-settings',
                path: 'notifications',
                meta: {
                  pageTitle: 'Notifications',
                },
                component: () => import('./pages/Settings/Notification.vue')
              }
            ]
          } as RouteRecordRaw,
        ] : []),
        {
          name: 'finance',
          path: '/finance',
          component: () => import('./pages/Finance.vue'),
          meta: {
            pageTitle: 'Finance'
          }
        },
        {
          name: 'reports',
          path: '/reports',
          component: () => import('./pages/Report.vue'),
          meta: {
            pageTitle: 'Reports'
          }
        },
        {
          name: 'information',
          path: '/information',
          component: () => import('./pages/Information.vue'),
          redirect: { name: 'basic-information' },
          meta: {
            pageTitle: 'Information'
          },
          children: [
            {
              name: 'basic-information',
              path: 'basic',
              component: () => import('./pages/Information/Basic.vue'),
              meta: {
                pageTitle: 'Basic Information'
              }
            },
            {
              name: 'family-information',
              path: 'family',
              component: () => import('./pages/Information/Family.vue'),
              meta: {
                pageTitle: 'Family Information'
              }
            },
            {
              name: 'guardian-information',
              path: 'guardian',
              component: () => import('./pages/Information/Guardian.vue'),
              meta: {
                pageTitle: 'Guardian Information'
              }
            },
            {
              name: 'educational-background-information',
              path: 'educational_background',
              component: () => import('./pages/Information/EducationalBackground.vue'),
              meta: {
                pageTitle: 'Educational Background'
              }
            },
            {
              name: 'account-information',
              path: 'account',
              component: () => import('./pages/Information/Account.vue'),
              meta: {
                pageTitle: 'Account'
              }
            }
          ]
        },
        {
          name: 'schedule',
          path: '/schedule',
          component: () => import('./pages/Schedule.vue'),
          meta: {
            pageTitle: 'Class Schedule'
          }
        },
        {
          name: 'clearance',
          path: '/clearance',
          component: () => import('./pages/Clearance.vue'),
          meta: {
            pageTitle: 'Clearance'
          }
        },
        {
          name: 'election-app',
          path: '/apps/election',
          component: () => import('./pages/App.vue'),
          meta: {
            pageTitle: 'Election'
          }
        },
        {
          name: 'course-evaluation-app',
          path: '/apps/course-evaluation',
          component: () => import('./pages/Apps/Evaluation.vue'),
          meta: {
            pageTitle: 'Course Evaluation'
          }
        },
        {
          name: 'online-enrollment-app',
          path: '/apps/online-enrollment',
          component: () => import('./pages/App.vue'),
          meta: {
            pageTitle: 'Online Enrollment'
          }
        },
        ...(IS_NATIVE ? [
          {
            name: 'test-app',
            path: '/apps/test',
            component: () => import('./pages/Apps/Test.vue'),
            meta: {
              pageTitle: 'Test Page',
              nativeOnly: true,
            }
          }
        ] : [])
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.nativeOnly && !IS_NATIVE) {
    return next({ name: 'home' });
  }
  if (client.isAuthenticated()) {
    if (to.meta.guestOnly) {
      return next({ name: 'home' });
    }
  } else {
    if (to.meta.requiresAuth) {
      return next({ name: 'login' });
    }
  }
  next();
});

export default router;