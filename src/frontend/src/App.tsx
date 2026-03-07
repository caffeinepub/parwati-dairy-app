import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import Contact from "./pages/Contact";
import DeliverySchedule from "./pages/DeliverySchedule";
import Home from "./pages/Home";
import OrderForm from "./pages/OrderForm";
import OrderHistory from "./pages/OrderHistory";
import Products from "./pages/Products";
import RegularCustomers from "./pages/RegularCustomers";

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: Products,
});

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order",
  component: OrderForm,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: Contact,
});

const orderHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-history",
  component: OrderHistory,
});

const deliveryScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/delivery-schedule",
  component: DeliverySchedule,
});

const regularCustomersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/regular-customers",
  component: RegularCustomers,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  orderRoute,
  contactRoute,
  orderHistoryRoute,
  deliveryScheduleRoute,
  regularCustomersRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
