import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { HomePage } from "@/pages/common/HomePage";
import { PublicRoute } from "@/routes/PublicRoute";
import { ROUTES } from "@/routes/paths";

export const appRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: ROUTES.home,
            element: <HomePage />,
          },
        ],
      },
    ],
  },
]);
