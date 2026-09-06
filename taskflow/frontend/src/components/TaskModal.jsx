import { useEffect, useState } from "react";


const TaskModal = ({
    isOpen,
    onClose,
    onSave,
    task
}) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] =
        useState("");


    useEffect(() => {

        if (task) {

            setTitle(task.title);
            setDescription(
                task.description || ""
            );

        } else {

            setTitle("");
            setDescription("");

        }

    }, [task]);


    if (!isOpen) {
        return null;
    }

    const isTaskChanged = !task ||
        title !== task.title ||
        description !== (task.description || "");


    const handleSubmit = (e) => {

        e.preventDefault();

        if (!isTaskChanged) {
            return;
        }

        onSave({
            title,
            description
        });
    };


    return (
        <div className="modal-overlay">

            <div className="modal">

                <div className="modal-header">

                    <h2>
                        {task
                            ? "Edit Task"
                            : "Create Task"
                        }
                    </h2>

                    <button
                        onClick={onClose}
                        className="close-button"
                    >
                        ×
                    </button>

                </div>


                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>Title</label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                            placeholder="Task title"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>Description</label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Task description"
                            rows="5"
                        />

                    </div>


                    <div className="modal-actions">

                        <button
                            type="button"
                            onClick={onClose}
                            className="secondary-button"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="primary-button"
                            disabled={!isTaskChanged}
                        >
                            {task
                                ? "Update Task"
                                : "Create Task"
                            }
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


export default TaskModal;
