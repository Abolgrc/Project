document.addEventListener("DOMContentLoaded", function() {
    var el = document.getElementById("welcomeText");
    if (!el) return;

    var username = localStorage.getItem("username") || "کاربر";

    el.innerHTML =
        "<strong>" + username + "</strong> به پرتابل دانشگاه شهید چمران اهواز" +
        "<br/>" +
        "خوش آمدید";
});