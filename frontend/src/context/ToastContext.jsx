import {
    createContext,
    useCallback,
    useContext,
    useState
} from "react";


const ToastContext = createContext(null);


export const ToastProvider = ({ children }) => {

    const [toasts, setToasts] = useState([]);


    const removeToast = useCallback((id) => {

        setToasts((current) =>
            current.filter(
                (toast) =>
                    toast.id !== id
            )
        );
    }, []);


    const showToast = useCallback((
        message,
        type = "success"
    ) => {

        const id = Date.now() + Math.random();

        setToasts((current) => [
            ...current,
            {
                id,
                message,
                type
            }
        ]);


        setTimeout(() => {
            removeToast(id);
        }, 4000);

    }, [removeToast]);


    return (
        <ToastContext.Provider
            value={{
                showToast,
                removeToast,
                toasts
            }}
        >
            {children}
        </ToastContext.Provider>
    );
};


export const useToast = () => {

    const context = useContext(ToastContext);

    if (!context) {
        throw new Error(
            "useToast must be used within ToastProvider"
        );
    }

    return context;
};
