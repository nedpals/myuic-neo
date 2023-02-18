import { createRouter, createWebHashHistory } from 'vue-router';
import { client } from './client';
import { IS_NATIVE } from './utils';

// icons
import IconHomeOutline from '~icons/ion/home-outline';
import IconHome from '~icons/ion/home';
import IconCalendar from '~icons/ion/calendar';
import IconCalendarOutline from '~icons/ion/calendar-outline';
import IconCash from '~icons/ion/cash';
import IconCashOutline from '~icons/ion/cash-outline';
import IconPerson from '~icons/ion/person';
import IconPersonOutline from '~icons/ion/person-outline';
import IconReceipt from '~icons/ion/receipt';
import IconReceiptOutline from '~icons/ion/receipt-outline';
import IconBallot from '~icons/ic/baseline-ballot';
import IconBallotOutline from '~icons/ic/outline-ballot';
import IconFeedback from '~icons/fluent/person-feedback-16-filled';
import IconFeedbackOutline from '~icons/fluent/person-feedback-16-regular';
import IconReport from '~icons/ion/stats-chart';
import IconReportOutline from '~icons/ion/stats-chart-outline';
import IconOnlineEnrollment from '~icons/fluent/compose-16-filled';
import appEvents from './event';

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
      name: 'about',
      path: '/about',
      component: () => import('./pages/About.vue')
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
          name: 'about',
          path: '/about',
          component: () => import('./pages/About.vue')
        },
        {
          name: 'home',
          path: '/',
          component: () => import('./pages/Home.vue'),
          meta: {
            pageTitle: 'Home',
            useHeader: false,
            navLink: {
              group: 'Student',
              title: 'Home',
              icon: IconHomeOutline,
              activeIcon: IconHome,
            }
          }
        },
        // ...(IS_NATIVE ? [
        //   {
        //     name: 'settings',
        //     path: '/settings',
        //     component: () => import('./pages/Settings.vue'),
        //     redirect: { name: 'notification-settings' },
        //     meta: {
        //       pageTitle: 'Settings',
        //       nativeOnly: true
        //     },
        //     children: [
        //       {
        //         name: 'notification-settings',
        //         path: 'notifications',
        //         meta: {
        //           pageTitle: 'Notifications',
        //         },
        //         component: () => import('./pages/Settings/Notification.vue')
        //       }
        //     ]
        //   } as RouteRecordRaw,
        // ] : []),
        {
          name: 'schedule',
          path: '/schedule',
          component: () => import('./pages/Schedule.vue'),
          meta: {
            pageTitle: 'Class Schedule',
            navLink: {
              group: 'Student',
              title: 'Schedule',
              icon: IconCalendarOutline,
              activeIcon: IconCalendar,
            }
          }
        },
        {
          name: 'reports',
          path: '/reports',
          component: () => import('./pages/Report.vue'),
          meta: {
            pageTitle: 'Reports',
            navLink: {
              group: 'Student',
              title: 'Reports',
              icon: IconReportOutline,
              activeIcon: IconReport,
            }
          }
        },
        {
          name: 'finance',
          path: '/finance',
          component: () => import('./pages/Finance.vue'),
          meta: {
            pageTitle: 'Finance',
            navLink: {
              group: 'Student',
              title: 'Finance',
              icon: IconCashOutline,
              activeIcon: IconCash,
            }
          }
        },
        {
          name: 'clearance',
          path: '/clearance',
          component: () => import('./pages/Clearance.vue'),
          meta: {
            pageTitle: 'Clearance',
            navLink: {
              group: 'Student',
              title: 'Clearance',
              icon: IconReceiptOutline,
              activeIcon: IconReceipt,
            }
          }
        },
        {
          name: 'information',
          path: '/information',
          component: () => import('./pages/Information.vue'),
          redirect: { name: 'basic-information' },
          meta: {
            pageTitle: 'Information',
            navLink: {
              group: 'Student',
              title: 'Information',
              icon: IconPersonOutline,
              activeIcon: IconPerson,
            }
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
          name: 'election-app',
          path: '/apps/election',
          component: () => import('./pages/Apps/Election.vue'),
          meta: {
            pageTitle: 'Election',
            navLink: {
              group: 'Apps',
              title: 'Election',
              icon: IconBallotOutline,
              activeIcon: IconBallot,
            }
          }
        },
        {
          name: 'course-evaluation-app',
          path: '/apps/course-evaluation',
          component: () => import('./pages/Apps/Evaluation.vue'),
          meta: {
            pageTitle: 'Course Evaluation',
            navLink: {
              group: 'Apps',
              title: 'Course Evaluation',
              icon: IconFeedbackOutline,
              activeIcon: IconFeedback,
            }
          }
        },
        {
          name: 'online-enrollment-app',
          path: '/apps/online-enrollment',
          component: () => import('./pages/App.vue'),
          meta: {
            pageTitle: 'Online Enrollment',
            navLink: {
              group: 'Apps',
              title: 'Online Enrollment',
              icon: IconOnlineEnrollment,
              activeIcon: IconOnlineEnrollment,
            }
          }
        },
        // ...(IS_NATIVE ? [
        //   {
        //     name: 'test-app',
        //     path: '/apps/test',
        //     component: () => import('./pages/Apps/Test.vue'),
        //     meta: {
        //       pageTitle: 'Test Page',
        //       nativeOnly: true,
        //     }
        //   }
        // ] : [])
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

  if (appEvents.onLogEvent) {
    appEvents.onLogEvent('screen_view', {
      firebase_screen: to.name,
      firebase_screen_class: to.name
    });
  }

  next();
});

export default router;