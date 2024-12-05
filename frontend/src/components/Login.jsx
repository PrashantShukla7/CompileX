import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import "./Login.css";
const Login = () => {
    const { loading, error, dispatch } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({})

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    console.log(credentials)
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch({ type: "LOGIN_START" });
        try {
            const res = await axios.post(
                "http://localhost:3000/api/auth/login",
                credentials,
                { withCredentials: true }
            );
            console.log('request successful')
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
            navigate("/");
        } catch (error) {
            dispatch({
                type: "LOGIN_FAILURE",
                payload: error.response?.data || "Login failed",
            });
        }
    };
    return (
        <form className="login-form" onSubmit={handleLogin}>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input type="text" placeholder="Enter username" name="username" onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input type="password" placeholder="Enter password" name="password" onChange={handleChange} required />
            </div>
            <button type="submit" className="submit-button">Login</button>
        </form>
    );
};

export default Login;
