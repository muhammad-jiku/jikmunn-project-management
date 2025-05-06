// Configuration for controlling sidebar and navbar visibility in different layouts

type LayoutType = 'auth' | 'root';

interface LayoutConfig {
  showSidebar: boolean;
  showNavbar: boolean;
  requiresAuth: boolean;
}

// Default configuration for different layout types
const layoutConfigs: Record<LayoutType, LayoutConfig> = {
  auth: {
    showSidebar: true, // Show sidebar in auth pages
    showNavbar: true, // Show navbar in auth pages
    requiresAuth: false, // Auth pages don't require authentication
  },
  root: {
    showSidebar: true, // Show sidebar in root (protected) pages
    showNavbar: true, // Show navbar in root (protected) pages
    requiresAuth: true, // Root pages require authentication
  },
};

export const getLayoutConfig = (type: LayoutType): LayoutConfig => {
  return layoutConfigs[type];
};

export default layoutConfigs;
