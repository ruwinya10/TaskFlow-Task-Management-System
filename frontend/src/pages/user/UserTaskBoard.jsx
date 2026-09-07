import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    DndContext,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors
} from "@dnd-kit/core";

import {
    arrayMove
} from "@dnd-kit/sortable";

import { Link } from "react-router-dom";

import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import { getTaskPermissions } from "../../utils/taskPermissions";

import TaskColumn from "../../components/TaskColumn";
import TaskModal from "../../components/TaskModal";

const columns = [
    {
        id: "todo",
        title: "To Do"
    },
    {
        id: "doing",
        title: "Doing"
    },
    {
        id: "done",
        title: "Done"
    }
];


const UserTaskBoard = () => {

    const { user } = useAuth();

    const currentUserId = user?._id || user?.id;

    const { showToast } = useToast();


    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewFilter, setViewFilter] = useState("all");


    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const dragOriginStatusRef = useRef(null);
    const tasksDuringDragRef = useRef(null);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        })
    );


    const fetchTasks = async () => {

        try {

            setLoading(true);

            const response =
                await api.get("/tasks");

            setTasks(response.data);

        } catch (error) {

            const message =
                error.response?.data?.message ||
                "Failed to load tasks";

            setError(message);
            showToast(message, "error");

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {

        fetchTasks();

    }, []);


    const filteredTasks = useMemo(() => {

        return tasks.filter((task) => {

            const creatorId =
                task.creator?._id?.toString() ||
                task.creator?.toString();

            const assignedId =
                task.assignedUser?._id?.toString() ||
                task.assignedUser?.toString() ||
                null;


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


            const matchesView =
                viewFilter === "all" ||
                (viewFilter === "created" &&
                    creatorId === currentUserId) ||
                (viewFilter === "assigned" &&
                    assignedId === currentUserId) ||
                (viewFilter === "unassigned" &&
                    creatorId === currentUserId &&
                    !assignedId);


            return (
                matchesSearch &&
                matchesStatus &&
                matchesView
            );
        });

    }, [
        tasks,
        search,
        statusFilter,
        viewFilter,
        currentUserId
    ]);


    const visibleColumns = useMemo(() => {

        if (statusFilter === "all") {
            return columns;
        }

        return columns.filter(
            (column) =>
                column.id === statusFilter
        );

    }, [statusFilter]);


    const handleSaveTask = async (data) => {

        try {

            if (editingTask) {

                await api.put(
                    `/tasks/${editingTask._id}`,
                    data
                );

                showToast(
                    "Task updated successfully",
                    "success"
                );

            } else {

                await api.post(
                    "/tasks",
                    data
                );

                showToast(
                    "Task created successfully",
                    "success"
                );

            }


            setModalOpen(false);
            setEditingTask(null);

            fetchTasks();

        } catch (error) {

            showToast(
                error.response?.data?.message ||
                "Failed to save task",
                "error"
            );
        }
    };


    const handleDeleteTask = async (taskId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this task?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `/tasks/${taskId}`
            );

            setTasks((current) =>
                current.filter(
                    (task) =>
                        task._id !== taskId
                )
            );

            showToast(
                "Task deleted successfully",
                "success"
            );

        } catch (error) {

            showToast(
                error.response?.data?.message ||
                "Failed to delete task",
                "error"
            );
        }
    };


    const handleAssignToSelf = async (taskId) => {

        try {

            const response = await api.patch(
                `/tasks/${taskId}/assign`,
                {
                    userId: currentUserId
                }
            );

            setTasks((current) =>
                current.map((item) =>
                    item._id === taskId
                        ? response.data
                        : item
                )
            );

            showToast(
                "Task assigned to you successfully",
                "success"
            );

        } catch (error) {

            showToast(
                error.response?.data?.message ||
                "Failed to assign task",
                "error"
            );
        }
    };


    const handleDragStart = (event) => {

        const task = tasks.find(
            (item) =>
                item._id === event.active.id
        );

        dragOriginStatusRef.current =
            task?.status ?? null;

        tasksDuringDragRef.current = tasks;
    };


    const handleDragOver = (event) => {

        const { active, over } = event;

        if (!over) {
            return;
        }


        const activeId = active.id;
        const overId = over.id;


        if (activeId === overId) {
            return;
        }


        setTasks((current) => {

            const activeIndex = current.findIndex(
                (item) =>
                    item._id === activeId
            );


            if (activeIndex === -1) {
                return current;
            }


            const activeTask = current[activeIndex];
            const overColumn = columns.find(
                (column) =>
                    column.id === overId
            );

            let next = current;


            if (overColumn) {

                if (
                    activeTask.status ===
                    overColumn.id
                ) {
                    return current;
                }


                const updated = current.map(
                    (item) =>
                        item._id === activeId
                            ? {
                                ...item,
                                status: overColumn.id
                            }
                            : item
                );


                const movedTask = updated[activeIndex];
                const withoutActive = updated.filter(
                    (item) =>
                        item._id !== activeId
                );


                const columnTasks = withoutActive.filter(
                    (item) =>
                        item.status === overColumn.id
                );


                if (columnTasks.length === 0) {
                    next = [
                        ...withoutActive,
                        movedTask
                    ];
                } else {

                    const lastTaskInColumn =
                        columnTasks[columnTasks.length - 1];

                    const insertIndex =
                        withoutActive.findIndex(
                            (item) =>
                                item._id ===
                                lastTaskInColumn._id
                        ) + 1;


                    const reordered = [
                        ...withoutActive
                    ];

                    reordered.splice(
                        insertIndex,
                        0,
                        movedTask
                    );

                    next = reordered;
                }

            } else {

                const overIndex = current.findIndex(
                    (item) =>
                        item._id === overId
                );


                if (overIndex === -1) {
                    return current;
                }


                const overTask = current[overIndex];


                if (
                    activeTask.status !==
                    overTask.status
                ) {

                    const updated = current.map(
                        (item) =>
                            item._id === activeId
                                ? {
                                    ...item,
                                    status: overTask.status
                                }
                                : item
                    );


                    const newActiveIndex = updated.findIndex(
                        (item) =>
                            item._id === activeId
                    );


                    next = arrayMove(
                        updated,
                        newActiveIndex,
                        overIndex
                    );

                } else {

                    next = arrayMove(
                        current,
                        activeIndex,
                        overIndex
                    );
                }
            }


            tasksDuringDragRef.current = next;
            return next;
        });
    };


    const handleDragEnd = async (event) => {

        const { active, over } = event;

        const originalStatus =
            dragOriginStatusRef.current;

        dragOriginStatusRef.current = null;


        if (!over) {
            tasksDuringDragRef.current = null;
            return;
        }


        const currentTasks =
            tasksDuringDragRef.current ?? tasks;

        tasksDuringDragRef.current = null;


        const task = currentTasks.find(
            (item) =>
                item._id === active.id
        );


        if (!task) {
            return;
        }


        const permissions = getTaskPermissions(
            task,
            currentUserId
        );


        if (!permissions.canMove) {
            fetchTasks();
            showToast(
                "You don't have permission to move this task",
                "warning"
            );
            return;
        }


        setTasks(currentTasks);


        if (
            !originalStatus ||
            task.status === originalStatus
        ) {
            return;
        }


        try {

            await api.patch(
                `/tasks/${task._id}/status`,
                {
                    status: task.status
                }
            );

            showToast(
                "Task status updated",
                "success"
            );

        } catch (error) {

            fetchTasks();

            showToast(
                error.response?.data?.message ||
                "Failed to update task status",
                "error"
            );
        }
    };


    const openCreateModal = () => {

        setEditingTask(null);
        setModalOpen(true);
    };


    const openEditModal = (task) => {

        setEditingTask(task);
        setModalOpen(true);
    };


    if (loading) {
        return (
            <div className="page-container">
                <p className="loading-text">
                    Loading task board...
                </p>
            </div>
        );
    }


    return (
        <div className="page-container">

            <div className="dashboard-header">

                <div>
                    <h1>Task Board</h1>
                    <p>
                        Drag and drop tasks between columns
                    </p>
                </div>


                <div className="header-actions">

                    <Link
                        to="/dashboard"
                        className="secondary-button"
                    >
                        Dashboard
                    </Link>


                    <button
                        onClick={openCreateModal}
                        className="primary-button"
                    >
                        + Create Task
                    </button>

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
                    value={viewFilter}
                    onChange={(event) =>
                        setViewFilter(event.target.value)
                    }
                >
                    <option value="all">
                        All Tasks
                    </option>
                    <option value="created">
                        Created by Me
                    </option>
                    <option value="assigned">
                        Assigned to Me
                    </option>
                    <option value="unassigned">
                        My Unassigned
                    </option>
                </select>

            </div>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >

                <div
                    className={`board ${visibleColumns.length === 1 ? "board-single" : ""}`}
                >

                    {visibleColumns.map((column) => (

                        <TaskColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            tasks={filteredTasks.filter(
                                (task) =>
                                    task.status ===
                                    column.id
                            )}
                            currentUserId={currentUserId}
                            onDelete={handleDeleteTask}
                            onEdit={openEditModal}
                            onAssignToSelf={handleAssignToSelf}
                        />

                    ))}

                </div>

            </DndContext>


            <TaskModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingTask(null);
                }}
                onSave={handleSaveTask}
                task={editingTask}
            />

        </div>
    );
};


export default UserTaskBoard;
