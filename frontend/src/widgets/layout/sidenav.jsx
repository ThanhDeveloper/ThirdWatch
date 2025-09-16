import PropTypes from "prop-types";
import { Link, NavLink, useLocation } from "react-router-dom";
import { XMarkIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Typography,
  Collapse,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useState } from "react";

export function Sidenav({
  brandName = "ThirdWatch Panel",
  brandImg = "/img/logo-ct.png",
  routes = [],
}) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const supportedColors = [
    "white", "black", "blue-gray", "gray", "brown", "deep-orange",
    "orange", "amber", "yellow", "lime", "light-green", "green",
    "teal", "cyan", "light-blue", "blue", "indigo", "deep-purple",
    "purple", "pink", "red"
  ];

  // fallback nếu color không hợp lệ
  const safeSidenavColor = supportedColors.includes(sidenavColor)
    ? sidenavColor
    : "blue-gray";

  // Toggle menu function
  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Check if a menu should be open based on current location
  const isMenuOpen = (menuName, children) => {
    if (openMenus[menuName] !== undefined) {
      return openMenus[menuName];
    }
    // Auto-open if current location matches any child path
    return children?.some(child => location.pathname.includes(child.path)) || false;
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div className="relative">
        <Link to="/" className="py-6 px-8 text-center">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path, children }) => {
              const hasChildren = children && children.length > 0;
              const isOpen = isMenuOpen(name, children);
              
              return (
                <li key={name}>
                  {hasChildren ? (
                    <>
                      <Button
                        variant="text"
                        color={sidenavType === "dark" ? "white" : "blue-gray"}
                        className="flex items-center justify-between gap-4 px-4 capitalize w-full"
                        onClick={() => toggleMenu(name)}
                      >
                        <div className="flex items-center gap-4">
                          {icon}
                          <Typography
                            color="inherit"
                            className="font-medium capitalize"
                          >
                            {name}
                          </Typography>
                        </div>
                        {isOpen ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Collapse open={isOpen}>
                        <ul className="ml-4 mt-2 space-y-1">
                          {children.map(({ icon: childIcon, name: childName, path: childPath }) => (
                            <li key={childName}>
                              <NavLink to={`/${layout}${childPath}`}>
                                {({ isActive }) => (
                                  <Button
                                    variant={isActive ? "gradient" : "text"}
                                    color={
                                      isActive
                                        ? safeSidenavColor
                                        : sidenavType === "dark"
                                          ? "white"
                                          : "blue-gray"
                                    }
                                    className="flex items-center gap-4 px-4 capitalize text-sm"
                                    fullWidth
                                  >
                                    {childIcon}
                                    <Typography
                                      color="inherit"
                                      className="font-medium capitalize"
                                    >
                                      {childName}
                                    </Typography>
                                  </Button>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </Collapse>
                    </>
                  ) : (
                    <NavLink to={`/${layout}${path}`}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? "gradient" : "text"}
                          color={
                            isActive
                              ? safeSidenavColor
                              : sidenavType === "dark"
                                ? "white"
                                : "blue-gray"
                          }
                          className="flex items-center gap-4 px-4 capitalize"
                          fullWidth
                        >
                          {icon}
                          <Typography
                            color="inherit"
                            className="font-medium capitalize"
                          >
                            {name}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </aside>
  );
}

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
