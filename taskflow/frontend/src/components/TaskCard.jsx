import {
    useSortable
} from "@dnd-kit/sortable";

import {
    CSS
} from "@dnd-kit/utilities";

import {
    getTaskPermissions
} from "../utils/taskPermissions";


const statusLabels = {
    todo: "To Do",
    doing: "Doing",
    done: "Done"
};


const formatDate = (dateString) => {
    if (!dateString) {
        return "Unknown";
    }

    return new Date(dateString).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
};


const TaskCard = ({
    task,
    currentUserId,
    onDelete,
    onEdit,
    onAssignToSelf
}) => {

    const permissions = getTaskPermissions(
        task,
        currentUserId
    );

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: task._id,
        disabled: !permissions.canMove
    });


    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };


    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`task-card ${permissions.canMove ? "draggable" : "not-draggable"}`}
            {...(permissions.canMove ? attributes : {})}
            {...(permissions.canMove ? listeners : {})}
        >

            <div className="drag-area">
                <span>⋮⋮</span>
            </div>


            <div className="task-content">

                <div className="task-card-header">

                    <h3>
                        {task.title}
                    </h3>

                    <span className={`status-badge ${task.status}`}>
                        {statusLabels[task.status] ||
                            task.status}
                    </span>

                </div>

                <p>
                    {task.description ||
                        "No description"}
                </p>


                <div className="task-info">

                    <small>
                        Created:{" "}
                        {formatDate(task.createdAt)}
                    </small>

                    <small>
                        Created by:{" "}
                        {task.creator?.name ||
                            "Unknown"}
                    </small>


                    <small>

                        Assigned:{" "}

                        {task.assignedUser?.name ||
                            "Unassigned"}

                    </small>

                </div>


                {(permissions.canEdit ||
                    permissions.canDelete ||
                    permissions.canSelfAssign) && (

                    <div
                        className="task-actions"
                        onPointerDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {permissions.canSelfAssign && (

                            <button
                                onClick={() =>
                                    onAssignToSelf(task._id)
                                }
                                className="assign-button"
                            >
                                Assign to me
                            </button>

                        )}

                        {permissions.canEdit && (

                            <button
                                onClick={() =>
                                    onEdit(task)
                                }
                            >
                                Edit
                            </button>

                        )}


                        {permissions.canDelete && (

                            <button
                                onClick={() =>
                                    onDelete(task._id)
                                }
                                className="delete-button"
                            >
                                Delete
                            </button>

                        )}

                    </div>

                )}

            </div>

        </div>
    );
};


export default TaskCard;
