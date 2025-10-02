import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  WrenchScrewdriverIcon,
  CodeBracketIcon,
  SparklesIcon,
  Bars3CenterLeftIcon,
  GlobeAltIcon
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables } from "@/pages/dashboard";
import { DataGenerator, Base64Tools, JsonUtilities, WebhookInspector, ApiRunner } from "@/pages/dashboard/tools";
import { SignIn, SignUp } from "@/pages/auth";
import { Navigate } from "react-router-dom";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <WrenchScrewdriverIcon {...icon} />,
        name: "tools",
        path: "/tools",
        element: <Navigate to="/dashboard/tools/data-generator" replace />,
        children: [
          {
            icon: <Bars3CenterLeftIcon {...icon} />,
            name: "data generator",
            path: "/tools/data-generator",
            element: <DataGenerator />,
          },
          {
            icon: <SparklesIcon {...icon} />,
            name: "base64 tools",
            path: "/tools/base64",
            element: <Base64Tools />,
          },
          {
            icon: <CodeBracketIcon {...icon} />,
            name: "json utilities",
            path: "/tools/json-utilities",
            element: <JsonUtilities />,
          },
          {
            icon: <GlobeAltIcon {...icon} />,
            name: "webhook inspector",
            path: "/tools/webhook-inspector",
            element: <WebhookInspector />,
          },
          {
            icon: <ServerStackIcon {...icon} />,
            name: "api runner",
            path: "/tools/api-runner",
            element: <ApiRunner />,
          }
        ],
      },
    ],
  },
];

export const authRoutes = [
  {
    layout: "auth",
    pages: [
      {
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
