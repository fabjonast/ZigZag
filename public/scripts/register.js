const registerForm = document.getElementById("registerForm");
const errorMessage = document.getElementById("error");

registerForm.addEventListener("submit", async (event) => {
    console.log("Register button was clicked.");

    event.preventDefault();

    const firstName = document.getElementById("firstname").value.trim();
    const lastName = document.getElementById("lastname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("pwd").value;

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
        errorMessage.style.color = "green";

        registerForm.reset();

    } catch(error){
        console.error(error);
        errorMessage.textContent = "Unable to connect to the server.";
    }
});