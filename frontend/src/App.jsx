import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import './App.css';
import Login from './views/AdminPanel/AdminPanelLoginView.jsx';
import AdminHomePage from './views/AdminPanel/AdminPanelHomePageView.jsx';
import AdminDashboardPage from './views/AdminPanel/AdminPanelUserView.tsx';
import Users from './views/AdminPanel/Users.tsx';
import Tellers from './views/AdminPanel/Tellers.tsx';
import MyProfile from './views/AdminPanel/MyProfile.tsx';
import Branches from './views/AdminPanel/Branches.tsx';
import Navbar from "./components/navbar/Navbar.tsx";
import Footer from "./components/footer/Footer.tsx";
import Menu from "./components/menu/Menu.tsx";

function App() {
  const Layout = () => {
    return (
      <div className="main">
        <Navbar />
        <div className="container">
          <div className="menuContainer">
            <Menu/>
          </div>
          <div className="contentContainer">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path:"/",
      element:<Layout/>,
      children:[
        {
          path:"/",
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
          path:"/homePage",
          element:<AdminHomePage/>
        },
        {
          path:"/myProfile",
          element:<MyProfile/>
        },
        {
          path:"/branches",
          element:<Branches/>
        },
      ]
    },
    {
      path:"/login",
      element:<Login/>
    }
  ]);

  return <RouterProvider router={router} />;
  
  {/*return (
    <BrowserRouter>
     <Routes>
      <Route path='/login' element={<Login />}/>
      <Route path='/' element={<AdminDashboardPage />}/>
      <Route path='/homePage' element={<AdminHomePage />}/>
      <Route path='/users' element={<Users />}/>
      <Route path='/tellers' element={<Tellers />}/>
      <Route path='/myProfile' element={<MyProfile />}/>
      <Route path='/branches' element={<Branches />}/>
     </Routes>
    </BrowserRouter>
  );*/}
}
export default App;
