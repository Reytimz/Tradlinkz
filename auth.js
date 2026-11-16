const authSubtitle = document.getElementById('auth-subtitle');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const submitBtn = document.getElementById('auth-submit-btn');
const authError = document.getElementById('auth-error');
const toggleText = document.getElementById('toggle-text');
const toggleLink = document.getElementById('toggle-link');

let isLoginMode = true;

// Switch between Login and Sign Up
toggleLink.addEventListener('click', function() {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authSubtitle.textContent = "Welcome back";
        submitBtn.textContent = "Log In";
        toggleText.textContent = "Don't have an account?";
        toggleLink.textContent = "Sign Up";
    } else {
        authSubtitle.textContent = "Create an account";
        submitBtn.textContent = "Sign Up";
        toggleText.textContent = "Already have an account?";
        toggleLink.textContent = "Log In";
    }
    authError.textContent = "";
});

// Handle the button click
submitBtn.addEventListener('click', async function() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        authError.textContent = "Please fill in all fields.";
        return;
    }

    submitBtn.textContent = "Please wait...";
    authError.textContent = "";

    if (isLoginMode) {
        // LOG IN
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            authError.textContent = error.message;
        } else {
            window.location.href = 'index.html'; // Send to shop!
        }
    } else {
        // SIGN UP
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            authError.textContent = error.message;
        } else {
            alert("Account created! You are now logged in.");
            window.location.href = 'index.html'; // Send to shop!
        }
    }
    submitBtn.textContent = isLoginMode ? "Log In" : "Sign Up";
});