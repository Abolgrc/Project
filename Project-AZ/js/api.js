const API = (function() {
    const BASE_URL = "http://127.0.0.1:8000";

    function getAccessToken() {
        return localStorage.getItem("accessToken");
    }

    function getRefreshToken() {
        return localStorage.getItem("refreshToken");
    }

    function setAccessToken(token) {
        localStorage.setItem("accessToken", token);
    }

    function clearTokens() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }

    function authHeader() {
        const token = getAccessToken();
        return token ? { Authorization: "Bearer " + token } : {};
    }

    async function safeJson(res) {
        const text = await res.text();
        if (!text) return {};
        try { return JSON.parse(text); } catch { return { raw: text }; }
    }

    async function refreshAccessToken() {
        const refresh = getRefreshToken();
        if (!refresh) return false;

        const res = await fetch(BASE_URL + "/api/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (!res.ok) return false;

        const data = await safeJson(res);
        if (data && data.access) {
            setAccessToken(data.access);
            return true;
        }
        return false;
    }

    async function request(path, options) {
        const url = BASE_URL + path;
        const opts = options || {};
        opts.headers = Object.assign({}, opts.headers || {}, authHeader());

        let res = await fetch(url, opts);

        if (res.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                opts.headers = Object.assign({}, opts.headers || {}, authHeader());
                res = await fetch(url, opts);
            } else {
                clearTokens();
            }
        }

        const data = await safeJson(res);
        return { ok: res.ok, status: res.status, data };
    }

    function get(path) {
        return request(path, { method: "GET" });
    }

    function post(path, body) {
        return request(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body || {}),
        });
    }

    function put(path, body) {
        return request(path, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body || {}),
        });
    }

    function del(path) {
        return request(path, { method: "DELETE" });
    }

    return { BASE_URL, request, get, post, put, del, clearTokens };
})();