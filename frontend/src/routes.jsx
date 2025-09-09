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
  Bars3CenterLeftIcon
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { DataGenerator, JsonTools, Base64Tools } from "@/pages/dashboard/tools";
import { SignIn, SignUp } from "@/pages/auth";

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
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        icon: <WrenchScrewdriverIcon {...icon} />,
        name: "tools",
        path: "/tools",
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
            name: "json tools",
            path: "/tools/json-tools",
            element: <JsonTools />,
          },
        ],
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
