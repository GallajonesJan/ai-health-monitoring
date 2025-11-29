// logout.js

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (confirm("Are you sure you want to log out?")) {
      // Clear all user-related localStorage items
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");
      localStorage.removeItem("age");
      localStorage.removeItem("email");
      localStorage.removeItem("esp_connected");

      // Redirect to sign-in page
      window.location.href = "signin.html";
    }
  });
});
