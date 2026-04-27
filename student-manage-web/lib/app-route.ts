const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getAppBasePath = () => trimTrailingSlash(configuredBasePath);

export const withAppBasePath = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = getAppBasePath();

  if (basePath && normalizedPath === basePath) {
    return basePath;
  }

  if (basePath && normalizedPath.startsWith(`${basePath}/`)) {
    return normalizedPath;
  }

  return basePath ? `${basePath}${normalizedPath}` : normalizedPath;
};

export const toBrowserAppPath = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = getAppBasePath();

  if (
    typeof window !== "undefined" &&
    basePath &&
    (window.location.pathname === basePath ||
      window.location.pathname.startsWith(`${basePath}/`))
  ) {
    return normalizedPath.slice(1);
  }

  return withAppBasePath(normalizedPath);
};
