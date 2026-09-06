import { useToast } from "../context/ToastContext";


const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ"
};


const ToastContainer = () => {

    const {
        toasts,
        removeToast
    } = useToast();


    if (toasts.length === 0) {
        return null;
    }


    return (
        <div className="toast-container">

            {toasts.map((toast) => (

                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() =>
                        removeToast(toast.id)
                    }
                >

                    <span className="toast-icon">
                        {icons[toast.type]}
                    </span>

                    <span className="toast-message">
                        {toast.message}
                    </span>

                </div>

            ))}

        </div>
    );
};


export default ToastContainer;
