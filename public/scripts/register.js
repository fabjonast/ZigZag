const registerForm = document.getElementById("registerForm");
const errorMessage = document.getElementById("error");
const submitBtn = registerForm.querySelector("button[type='submit']");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const firstName = document.getElementById("firstname").value.trim();
    const lastName = document.getElementById("lastname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("pwd").value;

    if(!firstName || !lastName || !username || !email || !password){
        errorMessage.textContent = "All fields are required";
        return;
    }

    submitBtn.disabled = true;

    try{
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstName, lastName, username, email, password })
        });

        const data = await response.json();

        if (!response.ok){
            errorMessage.textContent = data.message;
            return;
        }

        errorMessage.textContent = data.message;

        registerForm.reset();

    } catch(error){
        console.error(error);
        errorMessage.textContent = "Unable to connect to the server.";
    } finally{
        submitBtn.disabled = false;
    }
});