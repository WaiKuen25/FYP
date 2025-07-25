export function setNofication(setMessage, type, message) {
    setMessage({ type: "", message: "" });

    // 使用setTimeout確保先重置後再設置新消息
    setTimeout(() => {
        setMessage({
            type: type,
            message: message
        });
    }, 10);
}