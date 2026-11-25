const API_URL = "/api/transactions";

const nameInput = document.getElementById("expense_name");
const priceInput = document.getElementById("expense_price");
const typeSelect = document.getElementById("expense_type");
const dateInput = document.getElementById("expense_date");
const addBtn = document.querySelector(".add_btn button");
const listTbody = document.getElementById("transactions_list");

const euroFormatter = new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

function setDefaultDate() {
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0, 10);
    }
}

function formatDate(rawDate) {
    if (!rawDate) return "-";
    const str = String(rawDate);
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        return str.slice(0, 10);
    }
    const parsed = new Date(str);
    return Number.isNaN(parsed.getTime()) ? str : parsed.toISOString().slice(0, 10);
}

function renderTransactions(items) {
    listTbody.replaceChildren();

    if (!Array.isArray(items) || items.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.textContent = "No transactions yet";
        tr.appendChild(td);
        listTbody.appendChild(tr);
        return;
    }

    for (const item of items) {
        const isIncome = String(item.type).toLowerCase() === "income";
        const price = Number(item.totalPrice ?? 0);
        const sign = isIncome ? "+" : "-";
        const displayName = String(item.name ?? "").trim() || (isIncome ? "Income" : "Expense");

        const tr = document.createElement("tr");
        tr.dataset.id = String(item.id);

        const tdDate = document.createElement("td");
        tdDate.textContent = formatDate(item.date);

        const tdName = document.createElement("td");
        tdName.textContent = displayName;

        const tdType = document.createElement("td");
        tdType.textContent = isIncome ? "Income" : "Expense";

        const tdPrice = document.createElement("td");
        tdPrice.textContent = `${sign}${euroFormatter.format(Math.abs(price))}`;
        tdPrice.style.color = isIncome ? "#15803d" : "#b91c1c";
        tdPrice.style.fontWeight = "600";

        const tdAction = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "btn btn-danger";
        deleteBtn.dataset.id = String(item.id);
        deleteBtn.textContent = "Törlés";
        tdAction.appendChild(deleteBtn);

        tr.append(tdDate, tdName, tdType, tdPrice, tdAction);
        listTbody.appendChild(tr);
    }
}

async function loadTransactions() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        renderTransactions(data);
    } catch (error) {
        console.error("Error", error);
    }
}

async function addTransaction() {
    const name = nameInput.value.trim();
    const normalizedPrice = priceInput.value.replace(",", ".").trim();
    const totalPrice = Number(normalizedPrice);
    const type = typeSelect.value;
    const dateValue = dateInput.value.trim();

    if (!name) {
        alert("Add meg a nevet (Name)!");
        nameInput.focus();
        return;
    }

    if (!normalizedPrice || Number.isNaN(totalPrice) || totalPrice <= 0) {
        alert("Adj meg 0-nál nagyobb összeget (Price)!");
        priceInput.focus();
        return;
    }

    if (!type) {
        alert("Válaszd ki a típust (Income vagy Expense)!");
        typeSelect.focus();
        return;
    }

    const payload = {
        name,
        totalPrice,
        type,
        date: dateValue ? new Date(`${dateValue}T12:00:00Z`).toISOString() : new Date().toISOString()
    };

    addBtn.disabled = true;
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        nameInput.value = "";
        priceInput.value = "";
        typeSelect.value = "";
        setDefaultDate();
        await loadTransactions();
    } catch (error) {
        console.error("Hiba a mentés során:", error);
        alert("Nem sikerült menteni a tranzakciót.");
    } finally {
        addBtn.disabled = false;
    }
}

async function handleListClick(event) {
    const btn = event.target.closest("button[data-id]");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (Number.isNaN(id)) return;

    btn.disabled = true;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok && response.status !== 404) {
            throw new Error(`HTTP ${response.status}`);
        }
        await loadTransactions();
    } catch (error) {
        console.error("Hiba a törlés során:", error);
        alert("Nem sikerült törölni a tranzakciót.");
    } finally {
        btn.disabled = false;
    }
}

addBtn.addEventListener("click", addTransaction);
listTbody.addEventListener("click", handleListClick);

setDefaultDate();
loadTransactions();