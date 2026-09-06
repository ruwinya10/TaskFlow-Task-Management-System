import {
    NavLink,
    Outlet,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.webp";


const navItems = [
    {
        to: "/admin/dashboard",
        label: "Dashboard",
        icon: "📊"
    },
    {
        to: "/admin/users",
        label: "User Management",
        icon: "👥"
    },
    {
        to: "/admin/tasks",
        label: "Task Management",
        icon: "📋"
    }
];


const AdminLayout = () => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };


    return (
        <div className="admin-layout">

            <aside className="admin-sidebar">

                <div className="sidebar-header">

                    <div className="sidebar-brand">
                        <img src={logo} alt="TaskFlow logo" />
                        <span>TaskFlow</span>
                    </div>

                    <h2>
                        Admin Panel
                    </h2>

                    <p>
                        {user?.name}
                    </p>

                </div>


                <nav className="sidebar-nav">

                    {navItems.map((item) => (

                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({
                                isActive
                            }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                        >

                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            {item.label}

                        </NavLink>

                    ))}

                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={handleLogout}
                        className="sidebar-logout-button"
                    >
                        Logout
                    </button>
                </div>

            </aside>


            <main className="admin-main">
                <Outlet />
            </main>

        </div>
    );
};


export default AdminLayout;
