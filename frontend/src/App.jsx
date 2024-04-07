import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './views/AdminPanel/AdminLogin.jsx';
import AdminDashboardPage from './views/AdminPanel/AdminDashboard.tsx';
import Users from './views/AdminPanel/Users'
import Tellers from './views/AdminPanel/Tellers';
import Branches from './views/AdminPanel/Branches';
import Layout from './Layout.tsx';
import Feedbacks from './views/AdminPanel/Feedbacks';
import UserFeedbackInput from './views/UserPanel/FeedbackUserInputPage';

function App() {

  const router = createBrowserRouter([
    {
      path:"/",
      element:<Login/> 
    },
    {
      path:"/userFeedback",
      element:<UserFeedbackInput/>
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
        {
          path:"/feedbacks",
          element:<Feedbacks/>
        },
      ]
    }
  ]);
  
  return <RouterProvider router={router} />;
}
export default App;
