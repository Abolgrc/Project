(function() {
    var ENDPOINT = "/api/courses/courses/";

    var form = document.getElementById("addCourseForm");
    var codeEl = document.getElementById("code");
    var nameEl = document.getElementById("name");
    var unitsEl = document.getElementById("units");
    var clearFormBtn = document.getElementById("clearFormBtn");
    var reloadBtn = document.getElementById("reloadBtn");
    var msgEl = document.getElementById("msg");
    var tableWrap = document.getElementById("tableWrap");
    var statCount = document.getElementById("statCount");
    var statAvgUnits = document.getElementById("statAvgUnits");

    var courses = [];
    var editingId = null;

    function setMsg(text, type) {
        msgEl.textContent = text || "";
        msgEl.classList.remove("ok");
        msgEl.classList.remove("err");
        if (type) msgEl.classList.add(type);
    }

    function normalizeList(data) {
        if (Object.prototype.toString.call(data) === "[object Array]") return data;
        if (data && Object.prototype.toString.call(data.results) === "[object Array]") return data.results;
        return [];
    }

    function escapeHtml(s) {
        var str = String(s === undefined || s === null ? "" : s);
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function updateStats(list) {
        if (!statCount || !statAvgUnits) return;

        var n = list.length;
        statCount.textContent = String(n);

        if (!n) {
            statAvgUnits.textContent = "—";
            return;
        }

        var sum = 0;
        for (var i = 0; i < list.length; i++) {
            sum += Number(list[i].units) || 0;
        }
        var avg = sum / n;
        statAvgUnits.textContent = String(Math.round(avg * 10) / 10);
    }

    function render() {
        tableWrap.innerHTML = "";
        updateStats(courses);

        if (!courses.length) {
            tableWrap.textContent = "هیچ درسی ثبت نشده است.";
            return;
        }

        var table = document.createElement("table");
        table.className = "table";
        table.innerHTML =
            '<thead>' +
            '  <tr>' +
            '    <th>کد</th>' +
            '    <th>نام درس</th>' +
            '    <th>واحد</th>' +
            '    <th>ID</th>' +
            '    <th style="width:220px;">عملیات</th>' +
            '  </tr>' +
            '</thead>' +
            '<tbody></tbody>';

        var tbody = table.querySelector("tbody");

        for (var i = 0; i < courses.length; i++) {
            var c = courses[i];
            var isEditing = (editingId === c.id);

            var tr = document.createElement("tr");
            tr.dataset.id = c.id;

            if (isEditing) tr.classList.add("editing-row");

            if (isEditing) {
                tr.innerHTML =
                    '<td><input class="input input-sm" name="code" value="' + escapeHtml(c.code) + '"/></td>' +
                    '<td><input class="input input-sm" name="name" value="' + escapeHtml(c.name) + '"/></td>' +
                    '<td><input class="input input-sm" name="units" type="number" min="1" max="6" value="' + escapeHtml(c.units) + '"/></td>' +
                    '<td>' + escapeHtml(c.id) + '</td>' +
                    '<td>' +
                    '  <div class="row-actions">' +
                    '    <button class="btn btn-save" type="button" data-action="save">ذخیره</button>' +
                    '    <button class="btn btn-cancel" type="button" data-action="cancel">انصراف</button>' +
                    '  </div>' +
                    '</td>';
            } else {
                tr.innerHTML =
                    '<td><span class="badge">' + escapeHtml(c.code) + '</span></td>' +
                    '<td>' + escapeHtml(c.name) + '</td>' +
                    '<td>' + escapeHtml(c.units) + '</td>' +
                    '<td>' + escapeHtml(c.id) + '</td>' +
                    '<td>' +
                    '  <div class="row-actions">' +
                    '    <button class="btn btn-edit" type="button" data-action="edit">ویرایش</button>' +
                    '    <button class="btn btn-del" type="button" data-action="delete">حذف</button>' +
                    '  </div>' +
                    '</td>';
            }

            tbody.appendChild(tr);
        }

        tableWrap.appendChild(table);
    }

    async function loadCourses() {
        setMsg("در حال دریافت لیست درس‌ها...", null);

        var res = await API.get(ENDPOINT);

        if (!res.ok) {
            setMsg("خطا در دریافت لیست (status=" + res.status + ")", "err");
            console.log("GET error:", res);
            return;
        }

        courses = normalizeList(res.data);
        setMsg("", null);
        render();
    }

    function clearForm() {
        codeEl.value = "";
        nameEl.value = "";
        unitsEl.value = "3";
    }

    async function addCourse() {
        var code = codeEl.value.trim();
        var name = nameEl.value.trim();
        var units = Number(unitsEl.value);

        if (!code || !name || !units) {
            setMsg("لطفاً همه فیلدها را کامل کنید.", "err");
            return;
        }

        setMsg("در حال افزودن درس...", null);

        var payload = { code: code, name: name, units: units, prerequisites: [] };
        var res = await API.post(ENDPOINT, payload);

        if (!res.ok) {
            var d = res.data || {};
            var nice = (d.code && d.code[0]) || (d.name && d.name[0]) || (d.units && d.units[0]) || d.detail || "خطا در افزودن درس";
            setMsg(String(nice), "err");
            console.log("POST error:", res);
            return;
        }

        setMsg("درس با موفقیت اضافه شد ✅", "ok");
        clearForm();
        await loadCourses();
    }

    async function saveEdit(row) {
        var id = Number(row.dataset.id);
        var code = row.querySelector('input[name="code"]').value.trim();
        var name = row.querySelector('input[name="name"]').value.trim();
        var units = Number(row.querySelector('input[name="units"]').value);

        if (!code || !name || !units) {
            setMsg("برای ذخیره، همه فیلدهای ردیف را کامل کنید.", "err");
            return;
        }

        setMsg("در حال ذخیره تغییرات...", null);

        var payload = { code: code, name: name, units: units, prerequisites: [] };
        var res = await API.put(ENDPOINT + id + "/", payload);

        if (!res.ok) {
            var d = res.data || {};
            var nice = (d.code && d.code[0]) || (d.name && d.name[0]) || (d.units && d.units[0]) || d.detail || "خطا در ذخیره تغییرات";
            setMsg(String(nice), "err");
            console.log("PUT error:", res);
            return;
        }

        setMsg("تغییرات ذخیره شد ✅", "ok");
        editingId = null;
        await loadCourses();
    }

    async function deleteCourse(id) {
        var ok = confirm("آیا از حذف این درس مطمئن هستید؟");
        if (!ok) return;

        setMsg("در حال حذف درس...", null);

        var res = await API.del(ENDPOINT + id + "/");

        if (!res.ok) {
            var d = res.data || {};
            var nice = d.detail || "خطا در حذف درس";
            setMsg(String(nice) + " (status=" + res.status + ")", "err");
            console.log("DELETE error:", res);
            return;
        }

        setMsg("درس حذف شد ✅", "ok");
        if (editingId === id) editingId = null;
        await loadCourses();
    }

    // Events
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        addCourse();
    });

    clearFormBtn.addEventListener("click", function() {
        clearForm();
        setMsg("", null);
    });

    reloadBtn.addEventListener("click", function() {
        loadCourses();
    });

    tableWrap.addEventListener("click", function(e) {
        var btn = e.target.closest("button[data-action]");
        if (!btn) return;

        var row = e.target.closest("tr");
        if (!row) return;

        var id = Number(row.dataset.id);
        var action = btn.dataset.action;

        if (action === "edit") {
            editingId = id;
            setMsg("", null);
            render();
        } else if (action === "cancel") {
            editingId = null;
            setMsg("", null);
            render();
        } else if (action === "save") {
            saveEdit(row);
        } else if (action === "delete") {
            deleteCourse(id);
        }
    });

    loadCourses();
})();