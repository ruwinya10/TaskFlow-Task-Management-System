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


    return (
        <nav className="navbar">

            <div className="navbar-brand">
                <Link to="/">
                    Less Taxi
                </Link>
            </div>


            {user && (

                <div className="navbar-right">

                    <span className="welcome">
                        Hi, {user.name}
                    </span>

                    <span className="role-badge">
                        {user.role}
                    </span>

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