import {
    useEffect,
    useState
} from "react";

import {
    DndContext,
    DragOverlay,
    closestCorners
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

    const handleDragEnd = async (event) => {

        const {
            active,
            over
        } = event;


        if (!over) {
            return;
        }


        const taskId = active.id;


        const task = tasks.find(
            (item) =>
                item._id === taskId
        );


        if (!task) {
            return;
        }


        const permissions = getTaskPermissions(
            task,
            currentUserId
        );

        if (!permissions.canMove) {
            return;
        }


        let newStatus = over.id;


        // If dropped over another task,
        // use that task's status.
        const targetTask = tasks.find(
            (item) =>
                item._id === over.id
        );


        if (targetTask) {

            newStatus =
                targetTask.status;
        }


        const validStatuses = [
            "todo",
            "doing",
            "done"
        ];


        if (
            !validStatuses.includes(
                newStatus
            )
        ) {
            return;
        }


        if (
            task.status === newStatus
        ) {
            return;
        }


        // Optimistic UI update
        setTasks((current) =>
            current.map((item) =>
                item._id === taskId
                    ? {
                        ...item,
                        status: newStatus
                    }
                    : item
            )
        );


        try {

            await api.patch(
                `/tasks/${taskId}/status`,
                {
                    status: newStatus
                }
            );

        } catch (error) {

            // If backend fails,
            // restore database version
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
                collisionDetection={closestCorners}
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