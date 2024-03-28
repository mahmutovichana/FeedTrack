import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './views/AdminPanel/AdminPanelLoginView.jsx';
import AdminHomePage from './views/AdminPanel/AdminPanelHomePageView.jsx';
import AuthenticationPage from './views/AdminPanel/AuthenticationPage.jsx';

function App() {
  return (
    <BrowserRouter>
     <Routes>
      <Route path='/' element={<Login />}/>
      <Route path='/homePage' element={<AdminHomePage />}/>
      <Route path='/authentication' element={<AuthenticationPage />}/>
     </Routes>
    </BrowserRouter>
  );
}
export default App;
