import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import OrderForm from './pages/OrderForm';
import Contact from './pages/Contact';

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  orderRoute,
  contactRoute,
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
