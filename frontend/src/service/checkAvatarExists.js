export const checkAvatarExists = (userId) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/cdn/avator/${userId}/${userId}.png`;
  });
};
