import { useMemo } from "react";

import { useAdminData } from "../../hooks/useAdminData";


const statusLabels = {
    todo: "To Do",
    doing: "Doing",
    done: "Done"
};


const AdminOverview = () => {

    const {
        users,
        tasks,
        loading
    } = useAdminData();


    const stats = useMemo(() => ({
        totalUsers: users.length,
        totalTasks: tasks.length,
        todoCount: tasks.filter(
            (task) => task.status === "todo"
        ).length,
        doingCount: tasks.filter(
            (task) => task.status === "doing"
        ).length,
        doneCount: tasks.filter(
            (task) => task.status === "done"
        ).length,
        unassignedCount: tasks.filter(
            (task) => !task.assignedUser
        ).length
    }), [users, tasks]);


    const recentTasks = useMemo(() =>
        [...tasks]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5),
        [tasks]
    );


    if (loading) {
        return (
            <div className="admin-page">
                <p className="loading-text">
                    Loading dashboard...
                </p>
            </div>
        );
    }


    return (
        <div className="admin-page">

            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>
                        Overview of users and tasks
                    </p>
                </div>
            </div>


            <div className="stats-grid stats-grid-admin">

                <div className="stat-card stat-card-users">
                    <span>Total Users</span>
                    <strong>{stats.totalUsers}</strong>
                </div>


                <div className="stat-card stat-card-tasks">
                    <span>Total Tasks</span>
                    <strong>{stats.totalTasks}</strong>
                </div>


                <div className="stat-card stat-card-todo">
                    <span>To Do</span>
                    <strong>{stats.todoCount}</strong>
                </div>


                <div className="stat-card stat-card-doing">
                    <span>In Progress</span>
                    <strong>{stats.doingCount}</strong>
                </div>


                <div className="stat-card stat-card-done">
                    <span>Completed</span>
                    <strong>{stats.doneCount}</strong>
                </div>


                <div className="stat-card stat-card-unassigned">
                    <span>Unassigned</span>
                    <strong>{stats.unassignedCount}</strong>
                </div>

            </div>


            <section className="admin-section">

                <h2>Recent Tasks</h2>


                <div className="table-container">

                    <table className="interactive-table">

                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Creator</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Created</th>
                            </tr>
                        </thead>


                        <tbody>

                            {recentTasks.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={5}
                                        className="empty-cell"
                                    >
                                        No tasks yet
                                    </td>
                                </tr>

                            ) : (

                                recentTasks.map((task) => (

                                    <tr key={task._id}>

                                        <td>
                                            <strong>
                                                {task.title}
                                            </strong>
                                        </td>

                                        <td>
                                            {task.creator?.name}
                                        </td>

                                        <td>
                                            <span className={`status-badge ${task.status}`}>
                                                {statusLabels[task.status]}
                                            </span>
                                        </td>

                                        <td>
                                            {task.assignedUser?.name ||
                                                "Unassigned"}
                                        </td>

                                        <td>
                                            {new Date(
                                                task.createdAt
                                            ).toLocaleDateString()}
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


export default AdminOverview;
