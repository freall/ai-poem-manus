import { useCallback, useSyncExternalStore } from "react";

type NavigateOptions = {
  replace?: boolean;
};

const normalizePath = (path: string) => {
  if (!path || path === "#") return "/";

  const cleanPath = path.replace(/^#/, "").trim();
  if (!cleanPath) return "/";

  return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
};

const getHashPath = () => {
  if (typeof window === "undefined") return "/";
  return normalizePath(window.location.hash || "/");
};

export function useHashLocation(): [string, (to: string, options?: NavigateOptions) => void] {
  const location = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => undefined;

      window.addEventListener("hashchange", onStoreChange);
      return () => {
        window.removeEventListener("hashchange", onStoreChange);
      };
    },
    getHashPath,
    () => "/"
  );

  const navigate = useCallback((to: string, options?: NavigateOptions) => {
    if (typeof window === "undefined") return;

    const nextPath = normalizePath(to);
    const nextHash = `#${nextPath}`;

    if (options?.replace) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      return;
    }

    window.location.hash = nextPath;
  }, []);

  return [location, navigate];
}

export function withBaseUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;

  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedPath = path.replace(/^\/+/, "");
  return `${baseUrl}${normalizedPath}`;
}

export function getHomeUrl() {
  return `${import.meta.env.BASE_URL || "/"}#/`;
}
