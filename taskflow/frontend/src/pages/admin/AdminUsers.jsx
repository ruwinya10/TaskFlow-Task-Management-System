import {
    useMemo,
    useState
} from "react";

import { useToast } from "../../context/ToastContext";
import { useAdminData } from "../../hooks/useAdminData";
import api from "../../services/api";


const AdminUsers = () => {

    const {
        users,
        loading,
        fetchData
    } = useAdminData();

    const { showToast } = useToast();


    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");


    const filteredUsers = useMemo(() => {

        return users.filter((user) => {

            const matchesSearch =
                user.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                user.email
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesRole =
                roleFilter === "all" ||
                user.role === roleFilter;


            return matchesSearch && matchesRole;
        });

    }, [users, search, roleFilter]);


    const deleteUser = async (userId) => {

        const confirmed =
            window.confirm(
                "Delete this user?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `/users/${userId}`
            );

            showToast(
                "User deleted successfully",
                "success"
            );

            fetchData();

        } catch (error) {

            showToast(
                error.response?.data?.message ||
                "Failed to delete user",
                "error"
            );
        }
    };


    if (loading) {
        return (
            <div className="admin-page">
                <p className="loading-text">
                    Loading users...
                </p>
            </div>
        );
    }


    return (
        <div className="admin-page">

            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>
                        View and manage all users
                    </p>
                </div>
            </div>


            <div className="filter-bar filter-bar-inline">

                <input
                    type="text"
                    className="filter-input"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />


                <select
                    className="filter-select"
                    value={roleFilter}
                    onChange={(event) =>
                        setRoleFilter(event.target.value)
                    }
                >
                    <option value="all">
                        All Roles
                    </option>
                    <option value="user">
                        User
                    </option>
                    <option value="admin">
                        Admin
                    </option>
                </select>

            </div>


            <section className="admin-section">

                <div className="section-meta">
                    <h2>Users</h2>
                    <span className="result-count">
                        {filteredUsers.length} result
                        {filteredUsers.length !== 1 ? "s" : ""}
                    </span>
                </div>


                <div className="table-container">

                    <table className="interactive-table">

                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>


                        <tbody>

                            {filteredUsers.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={4}
                                        className="empty-cell"
                                    >
                                        No users match your filters
                                    </td>
                                </tr>

                            ) : (

                                filteredUsers.map((user) => (

                                    <tr key={user._id}>

                                        <td>{user.name}</td>

                                        <td>{user.email}</td>

                                        <td>
                                            <span className={`role-badge role-${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>

                                            {user.role !== "admin" && (

                                                <button
                                                    onClick={() =>
                                                        deleteUser(user._id)
                                                    }
                                                    className="delete-button"
                                                >
                                                    Delete
                                                </button>

                                            )}

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    );
};


export default AdminUsers;
