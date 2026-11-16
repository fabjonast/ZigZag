const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("error");
const submitBtn = loginForm.querySelector("button[type='submit']");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const loginInput = document.getElementById("loginInput").value.trim();
    const password = document.getElementById("pwd").value;

    if(!loginInput || !password){
        errorMessage.textContent = "Username/Email and password are required";
        return;
    }

    submitBtn.disabled = true;

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
    } finally{
        submitBtn.disabled = false;
    }
});