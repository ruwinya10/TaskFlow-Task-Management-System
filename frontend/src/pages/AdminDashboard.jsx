import {
    useEffect,
    useState
} from "react";

import api from "../services/api";


const AdminDashboard = () => {

    const [users, setUsers] =
        useState([]);

    const [tasks, setTasks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    const fetchData = async () => {

        try {

            setLoading(true);


            const [
                usersResponse,
                tasksResponse
            ] = await Promise.all([
                api.get("/users"),
                api.get("/tasks")
            ]);


            setUsers(
                usersResponse.data
            );

            setTasks(
                tasksResponse.data
            );

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to load admin data"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchData();

    }, []);


    // =========================
    // ASSIGN TASK
    // =========================

    const assignTask = async (
        taskId,
        userId
    ) => {

        try {

            await api.patch(
                `/tasks/${taskId}/assign`,
                {
                    userId:
                        userId || null
                }
            );


            fetchData();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to assign task"
            );
        }
    };


    // =========================
    // DELETE USER
    // =========================

    const deleteUser = async (
        userId
    ) => {

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

            fetchData();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to delete user"
            );
        }
    };


    if (loading) {

        return (
            <div className="page-container">
                Loading admin dashboard...
            </div>
        );
    }


    return (
        <div className="page-container">

            <div className="dashboard-header">

                <div>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Manage users and tasks
                    </p>

                </div>

            </div>


            {/* ===================== */}
            {/* STATISTICS */}
            {/* ===================== */}

            <div className="stats-grid">

                <div className="stat-card">

                    <span>
                        Total Users
                    </span>

                    <strong>
                        {users.length}
                    </strong>

                </div>


                <div className="stat-card">

                    <span>
                        Total Tasks
                    </span>

                    <strong>
                        {tasks.length}
                    </strong>

                </div>


                <div className="stat-card">

                    <span>
                        To Do
                    </span>

                    <strong>
                        {
                            tasks.filter(
                                (task) =>
                                    task.status ===
                                    "todo"
                            ).length
                        }
                    </strong>

                </div>


                <div className="stat-card">

                    <span>
                        Completed
                    </span>

                    <strong>
                        {
                            tasks.filter(
                                (task) =>
                                    task.status ===
                                    "done"
                            ).length
                        }
                    </strong>

                </div>

            </div>


            {/* ===================== */}
            {/* USERS */}
            {/* ===================== */}

            <section className="admin-section">

                <h2>
                    Users
                </h2>


                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>Name</th>

                                <th>Email</th>

                                <th>Role</th>

                                <th>Action</th>

                            </tr>

                        </thead>


                        <tbody>

                            {users.map(
                                (user) => (

                                    <tr
                                        key={
                                            user._id
                                        }
                                    >

                                        <td>
                                            {user.name}
                                        </td>

                                        <td>
                                            {user.email}
                                        </td>

                                        <td>
                                            <span className="role-badge">
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>

                                            {user.role !==
                                                "admin" && (

                                                <button
                                                    onClick={() =>
                                                        deleteUser(
                                                            user._id
                                                        )
                                                    }
                                                    className="delete-button"
                                                >
                                                    Delete
                                                </button>

                                            )}

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* ===================== */}
            {/* TASKS */}
            {/* ===================== */}

            <section className="admin-section">

                <h2>
                    All Tasks
                </h2>


                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>Task</th>

                                <th>Creator</th>

                                <th>Status</th>

                                <th>Assigned To</th>

                            </tr>

                        </thead>


                        <tbody>

                            {tasks.map(
                                (task) => (

                                    <tr
                                        key={
                                            task._id
                                        }
                                    >

                                        <td>
                                            <strong>
                                                {task.title}
                                            </strong>

                                            <br />

                                            <small>
                                                {
                                                    task.description
                                                }
                                            </small>
                                        </td>


                                        <td>
                                            {
                                                task
                                                    .creator
                                                    ?.name
                                            }
                                        </td>


                                        <td>

                                            <span className={`status-badge ${task.status}`}>

                                                {task.status}

                                            </span>

                                        </td>


                                        <td>

                                            <select
                                                value={
                                                    task.assignedUser?._id ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    assignTask(
                                                        task._id,
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Unassigned
                                                </option>


                                                {users
                                                    .filter(
                                                        (user) =>
                                                            user.role ===
                                                            "user"
                                                    )
                                                    .map(
                                                        (user) => (

                                                            <option
                                                                key={
                                                                    user._id
                                                                }
                                                                value={
                                                                    user._id
                                                                }
                                                            >
                                                                {
                                                                    user.name
                                                                }
                                                            </option>

                                                        )
                                                    )}

                                            </select>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    );
};


export default AdminDashboard;