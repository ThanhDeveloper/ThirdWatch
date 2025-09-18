import { Routes, Route, Navigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import { routes, authRoutes } from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import useWelcomeToast from "@/lib/useWelcomeToast";
import NotFound from "@/pages/not-found";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;

  // Show welcome toast after successful login
  useWelcomeToast();

  return (
    <div className="min-h-screen bg-blue-gray-50/50 flex">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="flex-1 flex flex-col xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>

        {/* Main content area - grows to fill available space */}
        <main className="flex-1 p-4">
          <Routes>
            {/* Default route for /dashboard -> redirect to /dashboard/home */}
            <Route index element={<Navigate to="/dashboard/home" replace />} />
            
            {/* Dashboard routes */}
            {routes.map(
              ({ layout, pages }) =>
                layout === "dashboard" &&
                pages.map(({ path, element, children }) => {
                  const routes = [];
                  
                  // Add the main route
                  routes.push(
                    <Route key={path} path={path} element={element} />
                  );
                  
                  // Add children routes if they exist
                  if (children && children.length > 0) {
                    children.forEach(({ path: childPath, element: childElement }) => {
                      routes.push(
                        <Route key={childPath} path={childPath} element={childElement} />
                      );
                    });
                  }
                  
                  return routes;
                }).flat()
            )}
            
            {/* Auth routes - accessible but not shown in sidebar */}
            {authRoutes.map(
              ({ layout, pages }) =>
                layout === "auth" &&
                pages.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))
            )}
            
            {/* 404 route for unmatched dashboard paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer - always at bottom */}
        <footer className="text-blue-gray-600 mt-auto">
          <Footer />
        </footer>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
