// Load database for authentication
let database = null;

async function loadDatabase() {
    try {
        const response = await fetch('database.json');
        database = await response.json();
    } catch (error) {
        console.error('Error loading database:', error);
    }
}

async function handleLogin(email, password) {
    const allUsers = [
        ...database.users.administrators,
        ...database.users.doctors,
        ...database.users.staff
    ];

    const user = allUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store user info in localStorage
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userEmail', user.email);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Invalid email or password';
        errorMessage.style.display = 'block';
    }
}

// Login form submission handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    
    if (!database) {
        await loadDatabase();
    }
    
    handleLogin(email, password);
});

// Load database when page loads
document.addEventListener('DOMContentLoaded', loadDatabase); 