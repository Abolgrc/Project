const API_BASE_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorBox = document.getElementById("loginError");

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        if (errorBox) errorBox.textContent = "";

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        try {
            const res = await fetch(API_BASE_URL + "/api/token/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password }),
            });

            const data = await res.json();
            console.log("LOGIN STATUS:", res.status);
            console.log("LOGIN RESPONSE:", data);

            if (!res.ok) {
                const msg = (data && data.detail) ? data.detail : "خطا در ورود";
                if (errorBox) errorBox.textContent = msg;
                return;
            }

            if (!data.access || !data.refresh) {
                if (errorBox) errorBox.textContent = "توکن‌ها برنگشتند. پاسخ سرور را در Console ببین.";
                return;
            }

            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);
            localStorage.setItem("username", username);

            console.log("Saved accessToken?", !!localStorage.getItem("accessToken"));

            window.location.href = "./Dashboard.html";
        } catch (err) {
            console.error(err);
            if (errorBox) errorBox.textContent = "خطا در اتصال به سرور";
        }
    });
});