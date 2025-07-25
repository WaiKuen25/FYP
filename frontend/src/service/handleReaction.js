const handleReaction = async(postId, messageId, reaction) => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("User is not authenticated");
        return false;
    }

    try {
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/data/reaction`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postId,
                    messageId,
                    reaction,
                }),
            }
        );

        const result = await response.json();
        console.log("Backend response:", result);

        if (!response.ok) {
            throw new Error("Failed to send reaction");
        }

        if (result.success) {
            console.log(reaction === 1 ? "Liked!" : "Disliked!");
            return true;
        } else {
            console.error("Failed to send reaction:", result);
            return false;
        }
    } catch (error) {
        console.error("Error sending reaction:", error);
        return false;
    }
};

export default handleReaction;