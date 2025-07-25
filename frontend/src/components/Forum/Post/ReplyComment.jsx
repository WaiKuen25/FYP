import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { LinearProgress, Box } from "@mui/material";
import { handleCommentSubmit } from "../../../service/createMessage";

const ReplyComment = ({ postId, replyId, onClose, onCommentSuccess }) => {
const [content, setContent] = useState("");
const [media, setMedia] = useState(null);
const [uploadProgress, setUploadProgress] = useState(0);

const handleMediaUpload = (event) => {
const file = event.target.files?.[0];
if (file) {
setMedia(file);
setUploadProgress(0);

const uploadSimulation = setInterval(() => {
setUploadProgress((prevProgress) => {
if (prevProgress >= 100) {
clearInterval(uploadSimulation);
return 100;
}
return prevProgress + 10;
});
}, 100);
}
};

const handleSubmit = async (event) => {
event.preventDefault();
const response = await handleCommentSubmit({ postId, content, media, replyId }, setUploadProgress);
if (response.success) {
setContent("");
setMedia(null);
setUploadProgress(0);
onClose();
if (onCommentSuccess && response.messageId) {
onCommentSuccess(response.messageId);
}
}
};

return (
<div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
<div className="p-4 border-b border-gray-200 dark:border-gray-700">
<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reply to comment</h3>
</div>
<form onSubmit={handleSubmit} className="p-4">
<div className="relative">
<textarea
placeholder="Write your reply..."
value={content}
onChange={(e) => setContent(e.target.value)}
className="w-full min-h-[120px] p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
/>

{uploadProgress > 0 && (
<Box sx={{ width: '100%', mt: 2 }}>
<LinearProgress
variant="determinate"
value={uploadProgress}
sx={{
height: 6,
borderRadius: 3,
backgroundColor: 'rgba(0,0,0,0.1)',
'& .MuiLinearProgress-bar': {
backgroundColor: '#3b82f6',
}
}}
/>
</Box>
)}

<div className="mt-4 flex items-center justify-between">
<label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
<PlusCircle className="h-6 w-6 text-blue-500" />
<span className="text-sm text-gray-600 dark:text-gray-400">Add pictures or videos</span>
<input
type="file"
accept=".jpg,.jpeg,.png,.mp4"
className="hidden"
onChange={handleMediaUpload}
/>
</label>

<div className="flex items-center gap-3">
<button
type="button"
onClick={onClose}
className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
>
Cancel
</button>
<button
type="submit"
className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
disabled={!content.trim() && !media}
>
Send Reply
</button>
</div>
</div>
</div>

{media && (
<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
{uploadProgress > 0 && uploadProgress < 100 ? "Uploading:" : "Selected:"}
</span>
<span className="text-sm text-blue-500">{media.name}</span>
</div>
{uploadProgress > 0 && (
<span className="text-sm font-medium text-blue-500">
{uploadProgress}%
</span>
)}
</div>
</div>
)}
</form>
</div>
);
};

export default ReplyComment;