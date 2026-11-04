const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("error");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const loginInput = document.getElementById("loginInput").value.trim();
    const password = document.getElementById("pwd").value;

    console.log("Login input:", loginInput);
    console.log("Password entered:", password ? "Yes" : "No");

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                loginInput: loginInput,
                password: password
            })
        });

        const data = await response.json();

        if(!response.ok){
            errorMessage.textContent = data.message;
            return;
        }

        errorMessage.textContent = data.message;

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Unable to connect to the server.";
    }
});