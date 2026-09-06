import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import {
    AuthProvider
} from "./context/AuthContext";


import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";


function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <Navbar />

                <Routes>

                    {/* Home */}

                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />


                    {/* Authentication */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />


                    <Route
                        path="/register"
                        element={<Register />}
                    />


                    {/* User Dashboard */}

                    <Route
                        path="/dashboard"
                        element={

                            <ProtectedRoute>

                                <UserDashboard />

                            </ProtectedRoute>

                        }
                    />


                    {/* Admin Dashboard */}

                    <Route
                        path="/admin"
                        element={

                            <ProtectedRoute
                                adminOnly={true}
                            >

                                <AdminDashboard />

                            </ProtectedRoute>

                        }
                    />


                    {/* Unknown route */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}


export default App;