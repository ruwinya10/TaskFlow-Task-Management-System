import {
    NavLink,
    Outlet
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


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

    const { user } = useAuth();


    return (
        <div className="admin-layout">

            <aside className="admin-sidebar">

                <div className="sidebar-header">

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

            </aside>


            <main className="admin-main">
                <Outlet />
            </main>

        </div>
    );
};


export default AdminLayout;
