export const showToast = (message, type = "success", duration = 8000) => {
  try {
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type, duration } }));
  } catch (e) {
    // fallback
    console.log("Toast:", type, message);
  }
};

export default { showToast };
