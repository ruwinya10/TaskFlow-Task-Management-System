import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import {
    AuthProvider
} from "./context/AuthContext";

import {
    ToastProvider
} from "./context/ToastContext";


import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import AdminLayout from "./components/admin/AdminLayout";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserOverview from "./pages/user/UserOverview";
import UserTaskBoard from "./pages/user/UserTaskBoard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTasks from "./pages/admin/AdminTasks";


function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <ToastProvider>

                    <Navbar />

                    <ToastContainer />

                    <Routes>

                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to="/login"
                                    replace
                                />
                            }
                        />


                        <Route
                            path="/login"
                            element={<Login />}
                        />


                        <Route
                            path="/register"
                            element={<Register />}
                        />


                        <Route
                            path="/dashboard"
                            element={

                                <ProtectedRoute>

                                    <UserOverview />

                                </ProtectedRoute>

                            }
                        />


                        <Route
                            path="/board"
                            element={

                                <ProtectedRoute>

                                    <UserTaskBoard />

                                </ProtectedRoute>

                            }
                        />


                        <Route
                            path="/admin"
                            element={

                                <ProtectedRoute
                                    adminOnly={true}
                                >

                                    <AdminLayout />

                                </ProtectedRoute>

                            }
                        >

                            <Route
                                index
                                element={
                                    <Navigate
                                        to="dashboard"
                                        replace
                                    />
                                }
                            />

                            <Route
                                path="dashboard"
                                element={<AdminOverview />}
                            />

                            <Route
                                path="users"
                                element={<AdminUsers />}
                            />

                            <Route
                                path="tasks"
                                element={<AdminTasks />}
                            />

                        </Route>


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

                </ToastProvider>

            </AuthProvider>

        </BrowserRouter>
    );
}


export default App;
