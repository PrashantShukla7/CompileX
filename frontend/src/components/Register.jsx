import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
    const [credentials, setCredentials] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    console.log(credentials);
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                "http://localhost:3000/api/auth/register",
                credentials
            );
            navigate("/login");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <form className="register-form">
            <label htmlFor="username">
                Username:
                <input
                    type="text"
                    name="username"
                    onChange={handleChange}
                    placeholder="Enter username"
                    required
                    />
            </label>
            <label htmlFor="email">
                Email:
                <input
                    type="email"
                    name="email"
                    placeholder="Enter Email address"
                    onChange={handleChange}
                    required
                    />
            </label>
            <label htmlFor="password">
                Password :
                <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    onChange={handleChange}
                    required
                />
            </label>
            <button type="submit" onClick={handleRegister}>
                Register
            </button>
        </form>
    );
};

export default Register;
