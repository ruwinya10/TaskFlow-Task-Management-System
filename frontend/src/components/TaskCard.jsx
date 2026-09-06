import {
    useSortable
} from "@dnd-kit/sortable";

import {
    CSS
} from "@dnd-kit/utilities";


const TaskCard = ({
    task,
    onDelete,
    onEdit
}) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: task._id
    });


    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };


    return (
        <div
            ref={setNodeRef}
            style={style}
            className="task-card"
        >

            <div
                className="drag-area"
                {...attributes}
                {...listeners}
            >
                <span>⋮⋮</span>
            </div>


            <div className="task-content">

                <h3>
                    {task.title}
                </h3>

                <p>
                    {task.description ||
                        "No description"}
                </p>


                <div className="task-info">

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


                <div className="task-actions">

                    <button
                        onClick={() =>
                            onEdit(task)
                        }
                    >
                        Edit
                    </button>


                    <button
                        onClick={() =>
                            onDelete(task._id)
                        }
                        className="delete-button"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    );
};


export default TaskCard;