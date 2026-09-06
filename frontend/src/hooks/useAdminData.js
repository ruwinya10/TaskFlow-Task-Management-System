import {
    useCallback,
    useEffect,
    useState
} from "react";

import { useToast } from "../context/ToastContext";
import api from "../services/api";


export const useAdminData = () => {

    const { showToast } = useToast();

    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchData = useCallback(async () => {

        try {

            setLoading(true);

            const [
                usersResponse,
                tasksResponse
            ] = await Promise.all([
                api.get("/users"),
                api.get("/tasks")
            ]);

            setUsers(usersResponse.data);
            setTasks(tasksResponse.data);

        } catch (error) {

            showToast(
                error.response?.data?.message ||
                "Failed to load admin data",
                "error"
            );

        } finally {
            setLoading(false);
        }
    }, [showToast]);


    useEffect(() => {

        fetchData();

    }, [fetchData]);


    return {
        users,
        tasks,
        loading,
        fetchData
    };
};
