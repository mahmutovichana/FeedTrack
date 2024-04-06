import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './views/AdminPanel/AdminPanelLoginView.jsx';
import AdminDashboardPage from './views/AdminPanel/AdminDashboard.tsx';
import Users from './views/AdminPanel/Users'
import Tellers from './views/AdminPanel/Tellers';
import Branches from './views/AdminPanel/Branches';
import Layout from './Layout.tsx';

function App() {

  const router = createBrowserRouter([
    {
      path:"/",
      element:<Login/> 
    },
    {
      path: "/",
      element: <Layout />, 
      children: [
        {
          path:"/home",
          element:<AdminDashboardPage/>
        },
        {
          path:"/users",
          element:<Users/>
        },
        {
          path:"/tellers",
          element:<Tellers/>
        },
        {
          path:"/branches",
          element:<Branches/>
        },
      ]
    }
  ]);
  
  return <RouterProvider router={router} />;
}
export default App;
