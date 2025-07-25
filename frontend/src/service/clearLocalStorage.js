export default function clearLocalStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("userConfig");
    localStorage.removeItem("nickName");
    localStorage.removeItem("darkMode");
};