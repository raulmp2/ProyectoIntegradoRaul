export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
