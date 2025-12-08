(function() {
    const LOGIN_PAGE = "./Login.html";

    function redirectToLogin() {
        window.location.replace(LOGIN_PAGE);
    }

    function isLoggedIn() {
        const token = localStorage.getItem("accessToken");
        return !!token;
    }

    function requireAuth() {
        if (!isLoggedIn()) {
            redirectToLogin();
            return false;
        }
        return true;
    }

    function logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        redirectToLogin();
    }

    window.logout = logout;
    window.requireAuth = requireAuth;

    document.addEventListener("DOMContentLoaded", function() {
        requireAuth();

        const logoutButtons = document.querySelectorAll(".logout-button");
        logoutButtons.forEach(function(btn) {
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                logout();
            });
        });
    });

    window.addEventListener("pageshow", function() {
        requireAuth();
    });
})();