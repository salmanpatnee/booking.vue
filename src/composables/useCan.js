import { useAuthStore } from "@@/stores/authStore";

export function useCan() {
  const authStore = useAuthStore();
  function can(permission = "") {
    const permissions = authStore.user.permissions;
    return permissions.includes(permission);
  }

  return { can };
}
