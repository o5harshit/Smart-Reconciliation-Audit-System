import { Outlet } from "react-router-dom";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { apiClient } from "./lib/api-client";
import { loginSuccess, logout } from "./redux/slices/authSlice";
import { useEffect, useState } from "react";
import { GET_USER_INFO } from "./utils/constants";
import Navbar from "./components/Navbar";

function App() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO, {
          withCredentials: true,
        });
        if (response.data.success) {
          dispatch(loginSuccess(response.data.message));
        } else {
          dispatch(logout());
        }
      } catch (e) {
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [dispatch, userInfo]);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default App;
