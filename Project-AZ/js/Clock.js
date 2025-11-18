function updateClock() {
    const now = new Date();

    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');

    const year = now.toLocaleDateString('fa-IR').split('/')[0];
    const month = now.toLocaleDateString('fa-IR').split('/')[1];
    const day = now.toLocaleDateString('fa-IR').split('/')[2];

    document.getElementById("clock").innerText = `${hours}:${minutes}`;
    document.getElementById("date").innerText = `${year}/${month}/${day}`;
}

setInterval(updateClock, 1000);
updateClock();