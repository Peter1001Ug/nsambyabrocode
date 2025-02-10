// Load database and user information
let database = null;
let currentUser = null;

async function loadDatabase() {
    try {
        const response = await fetch('database.json');
        database = await response.json();
        initializeDashboard();
    } catch (error) {
        showToast('Error loading database', 'error');
    }
}

function initializeDashboard() {
    // Load user info from localStorage
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');

    if (!userName || !userRole || !userEmail) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = {
        name: userName,
        role: userRole,
        email: userEmail
    };

    // Update UI with user info
    document.getElementById('user-name').textContent = userName;

    // Initialize dashboard components
    updateStats();
    loadDoctors();
    loadPatients();
    loadServices();
    loadMedicines();
    loadTeam();
    loadDiseases();
    setupEventListeners();
}

function animateCounter(element, start, end, duration) {
    let current = start;
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

function updateStats() {
    const stats = calculateStats();
    const elements = {
        patients: document.getElementById('patient-count'),
        doctors: document.getElementById('doctor-count'),
        appointments: document.getElementById('appointment-count'),
        medicines: document.getElementById('medicine-count')
    };

    // Animate each counter from 100 to actual value
    Object.entries(stats).forEach(([key, value]) => {
        animateCounter(elements[key], 100, value, 2000);
    });
}

function calculateStats() {
    return {
        patients: database.patients ? database.patients.length : 0,
        doctors: database.users.doctors.length,
        appointments: database.appointments ? database.appointments.length : 0,
        medicines: database.medicines.length
    };
}

function loadDoctors() {
    const doctorsList = document.getElementById('doctors-list');
    doctorsList.innerHTML = '';

    database.users.doctors.forEach(doctor => {
        const doctorCard = createDoctorCard(doctor);
        doctorsList.appendChild(doctorCard);
    });
}

function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
        <div class="doctor-info">
            <span class="material-icons">account_circle</span>
            <h3>${doctor.name}</h3>
            <p>${doctor.specialization}</p>
            <p>${doctor.email}</p>
            <p>Schedule: ${doctor.schedule || 'Not set'}</p>
        </div>
    `;
    return card;
}

function loadPatients() {
    if (!database.patients) return;
    
    const patientsList = document.getElementById('patients-list');
    patientsList.innerHTML = '';

    database.patients.forEach(patient => {
        const patientCard = createPatientCard(patient);
        patientsList.appendChild(patientCard);
    });
}

function createPatientCard(patient) {
    const card = document.createElement('div');
    card.className = 'patient-card';
    card.innerHTML = `
        <div class="patient-info">
            <h3>${patient.name}</h3>
            <p><i class="material-icons">cake</i> Age: ${patient.age}</p>
            <p><i class="material-icons">person</i> Gender: ${patient.gender}</p>
            <p><i class="material-icons">phone</i> ${patient.phone}</p>
            <p><i class="material-icons">email</i> ${patient.email}</p>
            <p><i class="material-icons">location_on</i> ${patient.address || 'No address provided'}</p>
            ${patient.medicalHistory ? `
                <div class="medical-history">
                    <p><i class="material-icons">history</i> Medical History:</p>
                    ${patient.medicalHistory.map(condition => `
                        <span>${condition}</span>
                    `).join('')}
                </div>
            ` : ''}
            ${patient.lastVisit ? `
                <p><i class="material-icons">event</i> Last Visit: ${new Date(patient.lastVisit).toLocaleDateString()}</p>
            ` : ''}
        </div>
    `;
    return card;
}

function loadServices() {
    const servicesList = document.getElementById('services-list');
    servicesList.innerHTML = '';

    database.services.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesList.appendChild(serviceCard);
    });
}

function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <p class="availability">${service.available ? 'Available' : 'Currently Unavailable'}</p>
    `;
    return card;
}

function loadMedicines() {
    const medicinesList = document.getElementById('medicines-list');
    medicinesList.innerHTML = '';

    let medicines = database.medicines;
    const searchTerm = document.getElementById('medicine-search')?.value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter')?.value;

    if (searchTerm) {
        medicines = medicines.filter(medicine => 
            medicine.name.toLowerCase().includes(searchTerm) ||
            medicine.category.toLowerCase().includes(searchTerm) ||
            medicine.treats.some(condition => condition.toLowerCase().includes(searchTerm))
        );
    }

    if (selectedCategory) {
        medicines = medicines.filter(medicine => medicine.category === selectedCategory);
    }

    medicines.forEach(medicine => {
        const medicineCard = createMedicineCard(medicine);
        medicinesList.appendChild(medicineCard);
    });
}

function createMedicineCard(medicine) {
    const card = document.createElement('div');
    card.className = 'medicine-card';
    card.innerHTML = `
        <h3>${medicine.name}</h3>
        <p class="category">${medicine.category}</p>
        <p class="stock">Stock: ${medicine.stock} units</p>
        <div class="treats">
            <strong>Treats:</strong><br>
            ${medicine.treats.map(condition => `<span>${condition}</span>`).join(' ')}
        </div>
    `;
    return card;
}

function loadDiseases() {
    const diseasesList = document.getElementById('diseases-list');
    if (!diseasesList) return;

    diseasesList.innerHTML = '';
    database.diseases.forEach(disease => {
        const diseaseCard = createDiseaseCard(disease);
        diseasesList.appendChild(diseaseCard);
    });
}

function createDiseaseCard(disease) {
    const card = document.createElement('div');
    card.className = 'disease-card';
    card.innerHTML = `
        <h3>${disease.name}</h3>
        <p class="category">${disease.category}</p>
        <div class="symptoms">
            <strong>Symptoms:</strong><br>
            ${disease.symptoms.map(symptom => `<span>${symptom}</span>`).join(' ')}
        </div>
        <div class="recommended-medicines">
            <strong>Recommended Medicines:</strong><br>
            ${disease.recommendedMedicines.map(medicine => `<span>${medicine}</span>`).join(' ')}
        </div>
    `;
    return card;
}

function loadTeam() {
    const teamList = document.getElementById('team-list');
    teamList.innerHTML = '';

    database.development_team.forEach(member => {
        const memberCard = createTeamMemberCard(member);
        teamList.appendChild(memberCard);
    });
}

function createTeamMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.innerHTML = `
        <h3>${member.name}</h3>
        <p>Role: ${member.role}</p>
        <p>Email: ${member.email}</p>
        <p>Phone: ${member.phone}</p>
    `;
    return card;
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Add new doctor button
    const addDoctorBtn = document.getElementById('add-doctor-btn');
    if (addDoctorBtn && currentUser.role === 'administrator') {
        addDoctorBtn.addEventListener('click', () => showModal('add-doctor-modal'));
    }

    // Add new patient button
    const addPatientBtn = document.getElementById('add-patient-btn');
    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', () => showModal('add-patient-modal'));
    }

    // Form submissions
    document.getElementById('add-doctor-form').addEventListener('submit', handleAddDoctor);
    document.getElementById('add-patient-form').addEventListener('submit', handleAddPatient);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Medicine search and filter
    const medicineSearch = document.getElementById('medicine-search');
    if (medicineSearch) {
        medicineSearch.addEventListener('input', debounce(loadMedicines, 300));
    }

    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadMedicines);
    }

    // Load notifications
    loadNotifications();

    // Theme switcher
    const themeSwitch = document.getElementById('checkbox');
    themeSwitch.addEventListener('change', handleThemeSwitch);

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            themeSwitch.checked = true;
        }
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

async function handleAddDoctor(e) {
    e.preventDefault();
    
    if (currentUser.role !== 'administrator') {
        showToast('Only administrators can add new doctors', 'error');
        return;
    }

    const newDoctor = {
        name: document.getElementById('doctor-name').value,
        email: document.getElementById('doctor-email').value,
        specialization: document.getElementById('doctor-specialization').value,
        schedule: document.getElementById('doctor-schedule').value,
        password: document.getElementById('doctor-password').value,
        role: 'doctor'
    };

    try {
        database.users.doctors.push(newDoctor);
        // In a real application, you would save to a backend here
        loadDoctors();
        updateStats();
        showToast('Doctor added successfully', 'success');
        e.target.reset();
        document.getElementById('add-doctor-modal').style.display = 'none';
    } catch (error) {
        showToast('Error adding doctor', 'error');
    }
}

async function handleAddPatient(e) {
    e.preventDefault();

    const newPatient = {
        name: document.getElementById('patient-name').value,
        email: document.getElementById('patient-email').value,
        age: document.getElementById('patient-age').value,
        gender: document.getElementById('patient-gender').value,
        phone: document.getElementById('patient-phone').value,
        address: document.getElementById('patient-address').value
    };

    try {
        if (!database.patients) {
            database.patients = [];
        }
        database.patients.push(newPatient);
        // In a real application, you would save to a backend here
        loadPatients();
        updateStats();
        showToast('Patient added successfully', 'success');
        e.target.reset();
        document.getElementById('add-patient-modal').style.display = 'none';
    } catch (error) {
        showToast('Error adding patient', 'error');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Utility function for debouncing search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add sample patients data
const samplePatients = [
    // Adding 50 sample patients
    {
        name: "John Smith",
        email: "john.smith@email.com",
        age: 35,
        gender: "male",
        phone: "+256-701-234567",
        address: "123 Main St, Kampala",
        medicalHistory: ["Hypertension", "Diabetes"],
        lastVisit: "2024-02-15"
    },
    // ... more patients will be added in database.json
];

// Add notifications data
const hospitalNotifications = [
    {
        id: 1,
        title: "Staff Meeting",
        message: "Monthly staff meeting scheduled for March 15th, 2024 at 9:00 AM",
        type: "meeting",
        date: "2024-03-15"
    },
    {
        id: 2,
        title: "Medical Camp",
        message: "Free medical camp for the community on March 20th, 2024",
        type: "event",
        date: "2024-03-20"
    },
    {
        id: 3,
        title: "Training Session",
        message: "New medical equipment training on March 18th, 2024",
        type: "training",
        date: "2024-03-18"
    }
];

function loadNotifications() {
    const notificationsList = document.createElement('div');
    notificationsList.className = 'notifications-list';
    
    hospitalNotifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.type}`;
        notificationItem.innerHTML = `
            <div class="notification-header">
                <span class="material-icons">${getNotificationIcon(notification.type)}</span>
                <h4>${notification.title}</h4>
                <span class="notification-date">${formatDate(notification.date)}</span>
            </div>
            <p>${notification.message}</p>
        `;
        notificationsList.appendChild(notificationItem);
    });

    const notificationsContainer = document.querySelector('.header-actions');
    const notificationsIcon = notificationsContainer.querySelector('.material-icons');
    
    notificationsIcon.addEventListener('click', () => {
        const existingList = document.querySelector('.notifications-list');
        if (existingList) {
            existingList.remove();
        } else {
            notificationsContainer.appendChild(notificationsList);
        }
    });
}

function getNotificationIcon(type) {
    const icons = {
        meeting: 'groups',
        event: 'event',
        training: 'school'
    };
    return icons[type] || 'notifications';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function handleThemeSwitch(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', loadDatabase); 