import {
    useMemo,
    useState
} from "react";

import { useToast } from "../../context/ToastContext";
import { useAdminData } from "../../hooks/useAdminData";
import api from "../../services/api";


const statusLabels = {
    todo: "To Do",
    doing: "Doing",
    done: "Done"
};


const AdminTasks = () => {

    const {
        users,
        tasks,
        loading,
        fetchData
    } = useAdminData();

    const { showToast } = useToast();


    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [assignmentFilter, setAssignmentFilter] = useState("all");
    const [creatorFilter, setCreatorFilter] = useState("all");


    const creators = useMemo(() => {

        const creatorMap = new Map();

        tasks.forEach((task) => {
            if (task.creator?._id) {
                creatorMap.set(
                    task.creator._id,
                    task.creator.name
                );
            }
        });

        return Array.from(
            creatorMap.entries()
        ).map(([id, name]) => ({
            id,
            name
        }));

    }, [tasks]);


    const filteredTasks = useMemo(() => {

        return tasks.filter((task) => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                (task.description || "")
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                task.status === statusFilter;

            const matchesAssignment =
                assignmentFilter === "all" ||
                (assignmentFilter === "unassigned" &&
                    !task.assignedUser) ||
                (assignmentFilter === "assigned" &&
                    !!task.assignedUser);

            const matchesCreator =
                creatorFilter === "all" ||
                task.creator?._id === creatorFilter;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesAssignment &&
                matchesCreator
            );
        });

    }, [
        tasks,
        search,
        statusFilter,
        assignmentFilter,
        creatorFilter
    ]);


    const assignTask = async (
        taskId,
        userId
    ) => {

        try {

            await api.patch(
                `/tasks/${taskId}/assign`,
                {
                    userId: userId || null
                }
            );


            const assignedUser = users.find(
                (user) => user._id === userId
            );


            showToast(
                userId
                    ? `Task assigned to ${assignedUser?.name || "user"}`
                    : "Task unassigned successfully",
                "success"
            );

            fetchData();

        } catch (error) {

            showToast(
                error.response?.data?.message ||
                "Failed to assign task",
                "error"
            );
        }
    };


    if (loading) {
        return (
            <div className="admin-page">
                <p className="loading-text">
                    Loading tasks...
                </p>
            </div>
        );
    }


    return (
        <div className="admin-page">

            <div className="page-header">
                <div>
                    <h1>Task Management</h1>
                    <p>
                        View and assign all tasks
                    </p>
                </div>
            </div>


            <div className="filter-bar filter-bar-inline">

                <input
                    type="text"
                    className="filter-input"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />


                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                >
                    <option value="all">
                        All Statuses
                    </option>
                    <option value="todo">
                        To Do
                    </option>
                    <option value="doing">
                        Doing
                    </option>
                    <option value="done">
                        Done
                    </option>
                </select>


                <select
                    className="filter-select"
                    value={assignmentFilter}
                    onChange={(event) =>
                        setAssignmentFilter(event.target.value)
                    }
                >
                    <option value="all">
                        All Assignments
                    </option>
                    <option value="assigned">
                        Assigned
                    </option>
                    <option value="unassigned">
                        Unassigned
                    </option>
                </select>


                <select
                    className="filter-select"
                    value={creatorFilter}
                    onChange={(event) =>
                        setCreatorFilter(event.target.value)
                    }
                >
                    <option value="all">
                        All Creators
                    </option>

                    {creators.map((creator) => (

                        <option
                            key={creator.id}
                            value={creator.id}
                        >
                            {creator.name}
                        </option>

                    ))}

                </select>

            </div>


            <section className="admin-section">

                <div className="section-meta">
                    <h2>All Tasks</h2>
                    <span className="result-count">
                        {filteredTasks.length} result
                        {filteredTasks.length !== 1 ? "s" : ""}
                    </span>
                </div>


                <div className="table-container">

                    <table className="interactive-table">

                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Creator</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                            </tr>
                        </thead>


                        <tbody>

                            {filteredTasks.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={4}
                                        className="empty-cell"
                                    >
                                        No tasks match your filters
                                    </td>
                                </tr>

                            ) : (

                                filteredTasks.map((task) => (

                                    <tr key={task._id}>

                                        <td>
                                            <strong>
                                                {task.title}
                                            </strong>

                                            <br />

                                            <small>
                                                {task.description}
                                            </small>
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

                                            <select
                                                className="table-select"
                                                value={
                                                    task.assignedUser?._id ||
                                                    ""
                                                }
                                                onChange={(event) =>
                                                    assignTask(
                                                        task._id,
                                                        event.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Unassigned
                                                </option>


                                                {users
                                                    .filter(
                                                        (user) =>
                                                            user.role === "user"
                                                    )
                                                    .map((user) => (

                                                        <option
                                                            key={user._id}
                                                            value={user._id}
                                                        >
                                                            {user.name}
                                                        </option>

                                                    ))}

                                            </select>

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


export default AdminTasks;
