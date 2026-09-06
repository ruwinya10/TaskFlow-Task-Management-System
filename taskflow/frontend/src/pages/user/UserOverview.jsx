import {
    useEffect,
    useMemo,
    useState
} from "react";

import { Link } from "react-router-dom";

import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";


const statusConfig = [
    {
        id: "todo",
        label: "To Do",
        color: "#f59e0b"
    },
    {
        id: "doing",
        label: "In Progress",
        color: "#3b82f6"
    },
    {
        id: "done",
        label: "Completed",
        color: "#22c55e"
    }
];


const DonutChart = ({
    segments,
    total
}) => {

    if (total === 0) {
        return (
            <div className="chart-empty">
                No tasks to display
            </div>
        );
    }


    let cumulative = 0;

    const slices = segments.map((segment) => {

        const start = cumulative;

        cumulative += segment.value / total;

        return {
            ...segment,
            start,
            end: cumulative
        };
    });


    const describeSlice = (
        start,
        end
    ) => {

        const startAngle = start * 360 - 90;
        const endAngle = end * 360 - 90;

        const startRad =
            (startAngle * Math.PI) / 180;

        const endRad =
            (endAngle * Math.PI) / 180;

        const largeArc =
            end - start > 0.5 ? 1 : 0;

        const outerRadius = 80;
        const innerRadius = 52;

        const x1 =
            100 + outerRadius * Math.cos(startRad);

        const y1 =
            100 + outerRadius * Math.sin(startRad);

        const x2 =
            100 + outerRadius * Math.cos(endRad);

        const y2 =
            100 + outerRadius * Math.sin(endRad);

        const x3 =
            100 + innerRadius * Math.cos(endRad);

        const y3 =
            100 + innerRadius * Math.sin(endRad);

        const x4 =
            100 + innerRadius * Math.cos(startRad);

        const y4 =
            100 + innerRadius * Math.sin(startRad);


        return [
            `M ${x1} ${y1}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
            "Z"
        ].join(" ");
    };


    return (
        <div className="donut-chart">

            <svg
                viewBox="0 0 200 200"
                className="donut-svg"
            >

                {slices.map((slice) => (

                    slice.value > 0 && (

                        <path
                            key={slice.id}
                            d={describeSlice(
                                slice.start,
                                slice.end
                            )}
                            fill={slice.color}
                            className="donut-slice"
                        />

                    )

                ))}

            </svg>


            <div className="donut-center">
                <strong>{total}</strong>
                <span>Tasks</span>
            </div>

        </div>
    );
};


const UserOverview = () => {

    const { user } = useAuth();
    const { showToast } = useToast();


    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewFilter, setViewFilter] = useState("all");

    const currentUserId = user?._id || user?.id;


    useEffect(() => {

        const fetchTasks = async () => {

            try {

                setLoading(true);

                const response =
                    await api.get("/tasks");

                setTasks(response.data);

            } catch (error) {

                showToast(
                    error.response?.data?.message ||
                    "Failed to load tasks",
                    "error"
                );

            } finally {
                setLoading(false);
            }
        };


        fetchTasks();

    }, [showToast]);


    const filteredTasks = useMemo(() => tasks.filter((task) => {
        const creatorId =
            task.creator?._id?.toString() ||
            task.creator?.toString();

        const assignedId =
            task.assignedUser?._id?.toString() ||
            task.assignedUser?.toString() ||
            null;

        const matchesSearch =
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            (task.description || "")
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            task.status === statusFilter;

        const matchesView =
            viewFilter === "all" ||
            (viewFilter === "created" &&
                creatorId === currentUserId) ||
            (viewFilter === "assigned" &&
                assignedId === currentUserId) ||
            (viewFilter === "unassigned" &&
                creatorId === currentUserId &&
                !assignedId);

        return matchesSearch && matchesStatus && matchesView;
    }), [
        tasks,
        search,
        statusFilter,
        viewFilter,
        currentUserId
    ]);


    const stats = useMemo(() => ({
        total: filteredTasks.length,
        todo: filteredTasks.filter(
            (task) => task.status === "todo"
        ).length,
        doing: filteredTasks.filter(
            (task) => task.status === "doing"
        ).length,
        done: filteredTasks.filter(
            (task) => task.status === "done"
        ).length
    }), [filteredTasks]);


    const chartSegments = useMemo(() =>
        statusConfig.map((status) => ({
            id: status.id,
            label: status.label,
            color: status.color,
            value: stats[status.id === "doing" ? "doing" : status.id]
        })),
        [stats]
    );


    const maxBarValue = Math.max(
        stats.todo,
        stats.doing,
        stats.done,
        1
    );


    const recentTasks = useMemo(() =>
        [...filteredTasks]
            .sort(
                (a, b) =>
                    new Date(b.updatedAt || b.createdAt) -
                    new Date(a.updatedAt || a.createdAt)
            )
            .slice(0, 5),
        [filteredTasks]
    );


    if (loading) {
        return (
            <div className="page-container">
                <p className="loading-text">
                    Loading dashboard...
                </p>
            </div>
        );
    }


    return (
        <div className="page-container">

            <div className="dashboard-header">

                <div>
                    <h1>My Dashboard</h1>
                    <p>
                        Welcome back, {user.name}
                    </p>
                </div>


                <Link
                    to="/board"
                    className="primary-button"
                >
                    Open Task Board
                </Link>

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
                    <option value="all">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="doing">In Progress</option>
                    <option value="done">Done</option>
                </select>


                <select
                    className="filter-select"
                    value={viewFilter}
                    onChange={(event) =>
                        setViewFilter(event.target.value)
                    }
                >
                    <option value="all">All Tasks</option>
                    <option value="created">Created by Me</option>
                    <option value="assigned">Assigned to Me</option>
                    <option value="unassigned">My Unassigned</option>
                </select>

            </div>


            <div className="stats-grid stats-grid-user">

                <div className="stat-card stat-card-tasks">
                    <span>My Tasks</span>
                    <strong>{stats.total}</strong>
                </div>

                <div className="stat-card stat-card-todo">
                    <span>To Do</span>
                    <strong>{stats.todo}</strong>
                </div>

                <div className="stat-card stat-card-doing">
                    <span>In Progress</span>
                    <strong>{stats.doing}</strong>
                </div>

                <div className="stat-card stat-card-done">
                    <span>Completed</span>
                    <strong>{stats.done}</strong>
                </div>

            </div>


            <div className="charts-grid">

                <section className="chart-card">

                    <h2>Task Distribution</h2>

                    <DonutChart
                        segments={chartSegments}
                        total={stats.total}
                    />


                    <div className="chart-legend">

                        {chartSegments.map((segment) => (

                            <div
                                key={segment.id}
                                className="legend-item"
                            >

                                <span
                                    className="legend-dot"
                                    style={{
                                        background: segment.color
                                    }}
                                />

                                <span>
                                    {segment.label}
                                </span>

                                <strong>
                                    {segment.value}
                                </strong>

                            </div>

                        ))}

                    </div>

                </section>


                <section className="chart-card">

                    <h2>Status Breakdown</h2>


                    <div className="bar-chart">

                        {statusConfig.map((status) => {

                            const value =
                                stats[status.id === "doing" ? "doing" : status.id];

                            const width =
                                (value / maxBarValue) * 100;


                            return (

                                <div
                                    key={status.id}
                                    className="bar-row"
                                >

                                    <span className="bar-label">
                                        {status.label}
                                    </span>

                                    <div className="bar-track">

                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${width}%`,
                                                background: status.color
                                            }}
                                        />

                                    </div>

                                    <span className="bar-value">
                                        {value}
                                    </span>

                                </div>

                            );
                        })}

                    </div>

                </section>

            </div>


            <section className="admin-section">

                <h2>Recent Activity</h2>


                <div className="table-container">

                    <table className="interactive-table">

                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Status</th>
                                <th>Assigned</th>
                                <th>Updated</th>
                            </tr>
                        </thead>


                        <tbody>

                            {recentTasks.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={4}
                                        className="empty-cell"
                                    >
                                        No tasks yet.{" "}
                                        <Link to="/board">
                                            Create one on the board
                                        </Link>
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
                                            <span className={`status-badge ${task.status}`}>
                                                {task.status === "doing"
                                                    ? "In Progress"
                                                    : task.status === "todo"
                                                        ? "To Do"
                                                        : "Done"}
                                            </span>
                                        </td>

                                        <td>
                                            {task.assignedUser?.name ||
                                                "Unassigned"}
                                        </td>

                                        <td>
                                            {new Date(
                                                task.updatedAt ||
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


export default UserOverview;
