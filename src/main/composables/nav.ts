import { FunctionalComponent, computed, ref } from "vue";
import { RouteRecordName, RouteRecordNormalized, RouteRecordRaw, useRoute, useRouter } from "vue-router";

export interface NavigationLinkGroup {
    name: string
    children: NavigationLinkEntry[]
}

export interface NavigationLinkEntry {
    name?: RouteRecordName
    subtitle?: string
    title: string
    group?: string
    to: { name: RouteRecordName } | string
    isCurrent: boolean
    icon?: FunctionalComponent
    activeIcon?: FunctionalComponent
    children: NavigationLinkEntry[]
    class?: string
    order?: number
    link?: boolean
}

export const defaultNavLinkEntries: NavigationLinkEntry[] = [];

function toNavEntry(route: RouteRecordNormalized | RouteRecordRaw): NavigationLinkEntry {
    return {
        icon: route.meta?.navLink?.icon,
        activeIcon: route.meta?.navLink?.activeIcon,
        title: route.meta?.navLink?.title ?? route.meta?.pageTitle ?? 'unknown',
        to: route.name ? { name: route.name } : route.path,
        isCurrent: false,
        name: route.name,
        group: route.meta?.navLink?.group,
        order: route.meta?.navLink?.order ?? 0,
        children: (route.children ?? []).map(toNavEntry)
    };
}

function collectNavEntries(routes: RouteRecordNormalized[] | RouteRecordRaw[]): NavigationLinkEntry[] {
    const routeEntries: NavigationLinkEntry[] = [];

    for (const route of routes) {
        if (!route.meta || !route.meta.navLink) {
            continue;
        }

        routeEntries.push(toNavEntry(route));
    }

    return routeEntries;
}

export const useNav = () => {
    const router = useRouter();
    const route = useRoute();
    const customEntries = ref<NavigationLinkEntry[]>([]);

    const getParentRouteName = () => {
        if (route.matched.length < 2) return 'dashboard';
        return route.matched[1].name;
    }

    const currentRoute = computed(() =>
        router.getRoutes()
            .find(r => r.name === route.matched[route.matched.length - 2].name)
    );

    const currentRouteName = computed(() => getParentRouteName()?.toString() ?? 'home');
    const entries = computed(() => {
        const routeEntries = collectNavEntries(router.getRoutes());
        return [
            ...defaultNavLinkEntries,
            ...routeEntries,
            ...customEntries.value
        ].map((e) => {
            return {
                ...e,
                isCurrent: e.name &&
                    currentRouteName.value === e.name ? true : false
            };
        }).sort((a, b) => {
            if (a.order && b.order) {
                if (a.order > b.order) {
                    return 1;
                } else if (a.order < b.order) {
                    return -1;
                }
            } else if (a.order && !b.order) {
                return 1;
            }
            return 0;
        });
    });

    const groupedEntries = computed(() => {
        const groups: NavigationLinkGroup[] = [];
        for (const entry of entries.value) {
            const groupName = entry.group ?? '_unnamed';
            let idx = groups.findIndex(grp => grp.name === groupName);
            if (idx === -1) {
                groups.push({
                    name: groupName,
                    children: []
                });
                idx = groups.length - 1;
            }
            groups[idx].children.push(entry);
        }
        return groups;
    });

    const currentEntry = computed(() => {
        return currentRoute.value ?
            toNavEntry(currentRoute.value) : undefined
    });

    return {
        groupedEntries,
        entries,
        currentRoute,
        currentRouteName,
        currentEntry
    }
}
