import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


const Navbar = () => {

    const {
        user,
        logout
    } = useAuth();

    const navigate = useNavigate();


    const handleLogout = () => {

        logout();

        navigate("/login");
    };


    const homePath =
        user?.role === "admin"
            ? "/admin/dashboard"
            : "/dashboard";


    return (
        <nav className="navbar">

            <div className="navbar-brand">
                <Link to={homePath}>
                    Less Taxi
                </Link>
            </div>


            {user && (

                <div className="navbar-right">

                    <span className="welcome">
                        Hi, {user.name}
                    </span>

                    <span className={`role-badge role-${user.role}`}>
                        {user.role}
                    </span>


                    {user.role === "admin" ? (

                        <Link
                            to="/admin/dashboard"
                            className="nav-link-button"
                        >
                            Admin
                        </Link>

                    ) : (

                        <>

                            <Link
                                to="/dashboard"
                                className="nav-link-button"
                            >
                                Dashboard
                            </Link>


                            <Link
                                to="/board"
                                className="nav-link-button"
                            >
                                Task Board
                            </Link>

                        </>

                    )}


                    <button
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        Logout
                    </button>

                </div>

            )}

        </nav>
    );
};


export default Navbar;
