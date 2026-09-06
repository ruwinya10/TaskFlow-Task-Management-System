import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors
} from "@dnd-kit/core";

import {
    arrayMove
} from "@dnd-kit/sortable";

import api from "../services/api";

import { useAuth } from "../context/AuthContext";

import { getTaskPermissions } from "../utils/taskPermissions";

import TaskColumn from "../components/TaskColumn";
import TaskModal from "../components/TaskModal";


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


const UserDashboard = () => {

    const {
        user
    } = useAuth();

    const currentUserId = user?._id || user?.id;


    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const [modalOpen, setModalOpen] =
        useState(false);

    const [editingTask, setEditingTask] =
        useState(null);

    const dragOriginStatusRef = useRef(null);
    const tasksDuringDragRef = useRef(null);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        })
    );


    // =========================
    // GET TASKS
    // =========================

    const fetchTasks = async () => {

        try {

            setLoading(true);

            const response =
                await api.get("/tasks");

            setTasks(response.data);

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to load tasks"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchTasks();

    }, []);


    // =========================
    // CREATE / UPDATE TASK
    // =========================

    const handleSaveTask = async (data) => {

        try {

            if (editingTask) {

                await api.put(
                    `/tasks/${editingTask._id}`,
                    data
                );

            } else {

                await api.post(
                    "/tasks",
                    data
                );

            }


            setModalOpen(false);
            setEditingTask(null);

            fetchTasks();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to save task"
            );

        }
    };


    // =========================
    // DELETE TASK
    // =========================

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

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to delete task"
            );
        }
    };


    // =========================
    // ASSIGN TO SELF
    // =========================

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

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to assign task"
            );
        }
    };


    // =========================
    // DRAG AND DROP
    // =========================

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

        const {
            active,
            over
        } = event;


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

        const {
            active,
            over
        } = event;


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

        } catch (error) {

            fetchTasks();

            alert(
                error.response?.data?.message ||
                "Failed to update task status"
            );
        }
    };


    // =========================
    // OPEN CREATE MODAL
    // =========================

    const openCreateModal = () => {

        setEditingTask(null);

        setModalOpen(true);
    };


    // =========================
    // OPEN EDIT MODAL
    // =========================

    const openEditModal = (task) => {

        setEditingTask(task);

        setModalOpen(true);
    };


    if (loading) {

        return (
            <div className="page-container">
                <p>Loading tasks...</p>
            </div>
        );
    }


    return (
        <div className="page-container">

            <div className="dashboard-header">

                <div>

                    <h1>
                        My Task Board
                    </h1>

                    <p>
                        Welcome, {user.name}
                    </p>

                </div>


                <button
                    onClick={openCreateModal}
                    className="primary-button"
                >
                    + Create Task
                </button>

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

                <div className="board">

                    {columns.map((column) => (

                        <TaskColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            tasks={tasks.filter(
                                (task) =>
                                    task.status ===
                                    column.id
                            )}
                            currentUserId={currentUserId}
                            onDelete={
                                handleDeleteTask
                            }
                            onEdit={
                                openEditModal
                            }
                            onAssignToSelf={
                                handleAssignToSelf
                            }
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


export default UserDashboard;