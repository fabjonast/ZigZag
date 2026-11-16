async function checkLogin() {
    try {
        const response = await fetch("/api/auth/me");

        if(response.status === 401){
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error(error);
    }
}

async function logout() {
    try {
        await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
        console.error(error);
    }

    window.location.href = "login.html";
}

checkLogin();

window.addEventListener("pageshow", (event) => {
    if(event.persisted){
        checkLogin();
    }
});

const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn){
    logoutBtn.addEventListener("click", logout);
}