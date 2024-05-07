import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../../styles/AdminPanel/AdminDashboard.scss";

const AdminDashboardPage = () => {
  let navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("token") == null) navigate("/");
  });

  return (
    <div className="home">
      <p>If you want to download this dashboard as a PDF, right click on it 😊</p>
      <iframe id="lookerDashboard" src="https://lookerstudio.google.com/embed/reporting/0d38b52c-a24b-4bce-aed1-c5c65c9a9a54/page/qlD" frameBorder="0" allowFullScreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"></iframe>
    </div>
  );
};

export default AdminDashboardPage;
