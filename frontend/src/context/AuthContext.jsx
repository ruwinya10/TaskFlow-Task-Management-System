import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    // Check whether user is already logged in
    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }


        const getCurrentUser = async () => {

            try {

                const response = await api.get("/auth/me");

                setUser(response.data);

            } catch (error) {

                localStorage.removeItem("token");
                setUser(null);

            } finally {

                setLoading(false);

            }
        };


        getCurrentUser();

    }, []);


    // Login
    const login = async (email, password) => {

        const response = await api.post(
            "/auth/login",
            {
                email,
                password
            }
        );


        localStorage.setItem(
            "token",
            response.data.token
        );


        setUser(response.data.user);

        return response.data;
    };


    // Register
    const register = async (
        name,
        email,
        password
    ) => {

        const response = await api.post(
            "/auth/register",
            {
                name,
                email,
                password
            }
        );


        return response.data;
    };


    // Logout
    const logout = () => {

        localStorage.removeItem("token");

        setUser(null);
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};