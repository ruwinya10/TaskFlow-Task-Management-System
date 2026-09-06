export const getTaskPermissions = (task, userId) => {
    if (!task || !userId) {
        return {
            canEdit: false,
            canDelete: false,
            canMove: false,
            canSelfAssign: false
        };
    }

    const creatorId =
        task.creator?._id?.toString() ||
        task.creator?.toString();

    const assignedId =
        task.assignedUser?._id?.toString() ||
        task.assignedUser?.toString() ||
        null;

    const isCreator = creatorId === userId;
    const isAssignee = assignedId === userId;
    const isUnassigned = !assignedId;

    return {
        canEdit: isCreator && (isUnassigned || isAssignee),
        canDelete: isCreator && (isUnassigned || isAssignee),
        canMove: isAssignee || (isCreator && isUnassigned),
        canSelfAssign: isCreator && isUnassigned
    };
};
