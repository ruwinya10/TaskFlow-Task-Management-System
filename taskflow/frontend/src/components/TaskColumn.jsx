import {
    useDroppable
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import TaskCard from "./TaskCard";


const TaskColumn = ({
    id,
    title,
    tasks,
    currentUserId,
    onDelete,
    onEdit,
    onAssignToSelf
}) => {

    const {
        setNodeRef
    } = useDroppable({
        id
    });


    return (
        <div
            ref={setNodeRef}
            className="task-column"
        >

            <div className="column-header">

                <h2>{title}</h2>

                <span className="task-count">
                    {tasks.length}
                </span>

            </div>


            <div className="task-list">

                <SortableContext
                    items={tasks.map((task) => task._id)}
                    strategy={verticalListSortingStrategy}
                >

                    {tasks.length === 0 ? (

                        <div className="empty-column">
                            Drop tasks here
                        </div>

                    ) : (

                        tasks.map((task) => (

                            <TaskCard
                                key={task._id}
                                task={task}
                                currentUserId={currentUserId}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                onAssignToSelf={onAssignToSelf}
                            />

                        ))

                    )}

                </SortableContext>

            </div>

        </div>
    );
};


export default TaskColumn;