import axios from "axios";

const createMessage = async (postId, formData, token, onUploadProgress) => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/data/createMessage/${postId}`,
            formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (typeof onUploadProgress === 'function') {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onUploadProgress(percentCompleted);
                    }
                },
            }
        );
        return response;
    } catch (error) {
        console.error("Error creating message:", error.response || error.message);
        throw error;
    }
};

export const handleCommentSubmit = async ({postId, content, media, replyId}, setUploadProgress) => {
    const formData = new FormData();
    formData.append("content", content);

    if (replyId) {
        formData.append("replyId", replyId);
    }

    if (media) {
        formData.append("media", media);
    }

    try {
        const response = await createMessage(
            postId,
            formData,
            localStorage.getItem("token"),
            setUploadProgress
        );

        if (response.data.success) {
            const messageId = response.data.messageId;
            if (messageId) {
                return {success: true, messageId};
            } else {
                console.error("No messageId in response:", response.data);
                return {success: false, error: "No messageId received"};
            }
        } else {
            console.error("Response indicates failure:", response.data);
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        if (typeof setUploadProgress === 'function') {
            setUploadProgress(0);
        }
        console.error("Error submitting comment:", error.response ?.data || error.message
    )
        ;
        return {
            success: false,
            error: error.response ?.data ?.error || "Failed to create message"
        };
    }
};

export const handleReactionUpdate = (post, setPost) => (index, updatedPost) => {
    const updatedData = [...post.data];
    updatedData[index] = updatedPost;
    setPost({...post, data: updatedData});
};