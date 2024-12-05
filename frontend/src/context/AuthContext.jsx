import {createContext, useEffect, useReducer } from "react";

const initialState = {
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    error: null,
};

export const AuthContext = createContext(initialState);

const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return { user: null, loading: true, error: null };
        case "LOGIN_SUCCESS":
            return { error: null, user: action.payload, loading: false };
        case "LOGIN_FAILURE":
            return { user: null, loading: false, error: action.payload };
        case "LOGOUT":
            return { user: null, loading: false, error: null };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/auth/validate", { withCredentials: true });
                if (res.status === 200) {
                    dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
                } else {
                    dispatch({ type: "LOGOUT" });
                }
            } catch {
                dispatch({ type: "LOGOUT" });
            }
        };
        checkAuth();
    }, []);
    
    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(state.user));
    }, [state.user])

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                error: state.error,
                loading: state.loading,
                dispatch,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
