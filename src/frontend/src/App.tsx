import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import OrderForm from './pages/OrderForm';
import Contact from './pages/Contact';
import OrderHistory from './pages/OrderHistory';
import DeliverySchedule from './pages/DeliverySchedule';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: Products,
});

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order',
  component: OrderForm,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: Contact,
});

const orderHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-history',
  component: OrderHistory,
});

const deliveryScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/delivery-schedule',
  component: DeliverySchedule,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  orderRoute,
  contactRoute,
  orderHistoryRoute,
  deliveryScheduleRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
