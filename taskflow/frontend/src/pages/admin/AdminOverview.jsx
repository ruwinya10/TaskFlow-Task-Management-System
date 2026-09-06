import { useMemo } from "react";

import { useAdminData } from "../../hooks/useAdminData";


const taskStatuses = [
    { id: "todo", label: "To Do", color: "#f59e0b" },
    { id: "doing", label: "In Progress", color: "#3b82f6" },
    { id: "done", label: "Completed", color: "#22c55e" }
];


const DonutChart = ({ segments, total, label }) => {
    if (total === 0) {
        return <div className="chart-empty">No data to display</div>;
    }

    const slices = segments.map((segment, index) => {
        const start = segments
            .slice(0, index)
            .reduce((sum, item) => sum + item.value, 0) / total;
        const end = start + segment.value / total;

        return { ...segment, start, end };
    });

    const describeSlice = (start, end) => {
        const startAngle = start * 360 - 90;
        const endAngle = end * 360 - 90;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const largeArc = end - start > 0.5 ? 1 : 0;
        const outerRadius = 80;
        const innerRadius = 52;
        const x1 = 100 + outerRadius * Math.cos(startRad);
        const y1 = 100 + outerRadius * Math.sin(startRad);
        const x2 = 100 + outerRadius * Math.cos(endRad);
        const y2 = 100 + outerRadius * Math.sin(endRad);
        const x3 = 100 + innerRadius * Math.cos(endRad);
        const y3 = 100 + innerRadius * Math.sin(endRad);
        const x4 = 100 + innerRadius * Math.cos(startRad);
        const y4 = 100 + innerRadius * Math.sin(startRad);

        return [
            `M ${x1} ${y1}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
            "Z"
        ].join(" ");
    };

    return (
        <>
            <div className="donut-chart">
                <svg viewBox="0 0 200 200" className="donut-svg">
                    {slices.map((slice) => (
                        slice.value > 0 && (
                            <path
                                key={slice.id}
                                d={describeSlice(slice.start, slice.end)}
                                fill={slice.color}
                                className="donut-slice"
                            />
                        )
                    ))}
                </svg>
                <div className="donut-center">
                    <strong>{total}</strong>
                    <span>{label}</span>
                </div>
            </div>
            <div className="chart-legend">
                {segments.map((segment) => (
                    <div className="legend-item" key={segment.id}>
                        <span
                            className="legend-dot"
                            style={{ background: segment.color }}
                        />
                        <span>{segment.label}</span>
                        <strong>{segment.value}</strong>
                    </div>
                ))}
            </div>
        </>
    );
};


const LineChart = ({ points }) => {
    const max = Math.max(...points.map((point) => point.value), 1);
    const chartWidth = 420;
    const chartHeight = 180;
    const padding = { top: 20, right: 16, bottom: 34, left: 30 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;
    const coordinates = points.map((point, index) => ({
        ...point,
        x: padding.left + (plotWidth * index) / (points.length - 1),
        y: padding.top + plotHeight - (point.value / max) * plotHeight
    }));
    const path = coordinates
        .map((point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
        )
        .join(" ");

    return (
        <svg
            className="admin-line-chart"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label="Tasks created over the last seven days"
        >
            {[0, 0.5, 1].map((ratio) => {
                const y = padding.top + plotHeight - ratio * plotHeight;
                return (
                    <g key={ratio}>
                        <line
                            x1={padding.left}
                            x2={chartWidth - padding.right}
                            y1={y}
                            y2={y}
                            className="line-chart-grid"
                        />
                        <text x="4" y={y + 4} className="line-chart-label">
                            {Math.round(max * ratio)}
                        </text>
                    </g>
                );
            })}
            <path d={path} className="line-chart-path" />
            {coordinates.map((point) => (
                <g key={point.label}>
                    <circle cx={point.x} cy={point.y} r="4" className="line-chart-point" />
                    <text
                        x={point.x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        className="line-chart-label"
                    >
                        {point.label}
                    </text>
                </g>
            ))}
        </svg>
    );
};


const AdminOverview = () => {
    const { users, tasks, loading } = useAdminData();

    const stats = useMemo(() => {
        const recentStart = new Date();
        recentStart.setDate(recentStart.getDate() - 7);

        return {
            totalUsers: users.length,
            totalTasks: tasks.length,
            todoCount: tasks.filter((task) => task.status === "todo").length,
            doingCount: tasks.filter((task) => task.status === "doing").length,
            doneCount: tasks.filter((task) => task.status === "done").length,
            recentCount: tasks.filter(
                (task) => new Date(task.createdAt) >= recentStart
            ).length
        };
    }, [users, tasks]);

    const userSegments = useMemo(() => [
        {
            id: "users",
            label: "Users",
            color: "#4f46e5",
            value: users.filter((user) => user.role === "user").length
        },
        {
            id: "admins",
            label: "Admins",
            color: "#8b5cf6",
            value: users.filter((user) => user.role === "admin").length
        }
    ], [users]);

    const taskSegments = useMemo(() =>
        taskStatuses.map((status) => ({
            ...status,
            value: tasks.filter((task) => task.status === status.id).length
        })),
        [tasks]
    );

    const assignmentSegments = useMemo(() => [
        {
            id: "assigned",
            label: "Assigned",
            color: "#22c55e",
            value: tasks.filter((task) => !!task.assignedUser).length
        },
        {
            id: "unassigned",
            label: "Unassigned",
            color: "#94a3b8",
            value: tasks.filter((task) => !task.assignedUser).length
        }
    ], [tasks]);

    const recentTaskPoints = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - index));
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            return {
                label: date.toLocaleDateString(undefined, { weekday: "short" }),
                value: tasks.filter((task) => {
                    const createdAt = new Date(task.createdAt);
                    return createdAt >= date && createdAt < nextDate;
                }).length
            };
        });
    }, [tasks]);

    const maxStatusValue = Math.max(
        ...taskSegments.map((segment) => segment.value),
        1
    );

    if (loading) {
        return (
            <div className="admin-page">
                <p className="loading-text">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Overview of users and tasks</p>
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
                <div className="stat-card stat-card-tasks">
                    <span>Recent Tasks</span>
                    <strong>{stats.recentCount}</strong>
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
            </div>

            <div className="charts-grid admin-charts-grid">
                <section className="chart-card">
                    <h2>User Roles</h2>
                    <DonutChart
                        segments={userSegments}
                        total={stats.totalUsers}
                        label="Users"
                    />
                </section>
                <section className="chart-card">
                    <h2>Task Status</h2>
                    <div className="bar-chart">
                        {taskSegments.map((segment) => (
                            <div className="bar-row" key={segment.id}>
                                <span className="bar-label">{segment.label}</span>
                                <div className="bar-track">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${(segment.value / maxStatusValue) * 100}%`,
                                            background: segment.color
                                        }}
                                    />
                                </div>
                                <span className="bar-value">{segment.value}</span>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="chart-card">
                    <h2>Tasks Created (Last 7 Days)</h2>
                    <LineChart points={recentTaskPoints} />
                </section>
                <section className="chart-card">
                    <h2>Task Assignment</h2>
                    <DonutChart
                        segments={assignmentSegments}
                        total={stats.totalTasks}
                        label="Tasks"
                    />
                </section>
            </div>
        </div>
    );
};


export default AdminOverview;
