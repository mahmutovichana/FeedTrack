import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './views/AdminPanel/AdminLogin.jsx';
import AdminDashboardPage from './views/AdminPanel/AdminDashboard.tsx';
import Users from './views/AdminPanel/Users'
import Tellers from './views/AdminPanel/Tellers';
import Branches from './views/AdminPanel/Branches';
import Layout from './Layout.tsx';
import Feedbacks from './views/AdminPanel/Feedbacks';
import UserFeedbackInput from './views/UserPanel/FeedbackUserInputPage';
import AssignCampaigns from './views/AdminPanel/AssignCampaigns';
import Forms from './views/AdminPanel/Forms';
import ProfilePage from './views/AdminPanel/Profile'
import Campaigns from './views/AdminPanel/Campaigns';
import TellerSetup from './views/UserPanel/TellerSetup';
import Notes from "./views/AdminPanel/Notes";
import WelcomeScreen from './views/UserPanel/WelcomeScreen.jsx';
import Questions from "./views/AdminPanel/Questions";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />
    },
    {
      path: "/welcomeScreen",
      element: <WelcomeScreen />
    },
    {
      path: "/userFeedback",
      element: <UserFeedbackInput />
    },
    {
      path: "/tellerSetup",
      element: <TellerSetup />
    },
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/home",
          element: <AdminDashboardPage />
        },
        {
          path:"/profile",
          element:<ProfilePage/>
        },
        {
          path:"/users",
          element:<Users/>
        },
        {
          path: "/tellers",
          element: <Tellers />
        },
        {
          path: "/branches",
          element: <Branches />
        },
        {
          path: "/feedbacks",
          element: <Feedbacks />
        },
        {
          path: "/forms",
          element: <Forms />
        },
        {
          path: "/campaigns",
          element: <Campaigns />
        },
        {
          path: "/assignCampaigns",
          element: <AssignCampaigns />
        },
        {
          path: "/notes",
          element: <Notes />
        },
        {
          path: "/questions",
          element: <Questions />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}
export default App;
