/* =====================================================
   PARKING DATA FROM BACKEND
===================================================== */

const API_BASE_URL = "https://smart-parking-system-mjq5.onrender.com/api";

let parkingData = {
    1: [],
    2: [],
    3: [],
    4: []
};

async function fetchParkingSlots() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/parking/slots`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch parking slots");
        }

        const data = await response.json();

        // Reset existing parking data
        parkingData = {
            1: [],
            2: [],
            3: [],
            4: []
        };

        // Convert backend data into frontend format
        data.forEach(slot => {

            const statusMap = {
                AVAILABLE: "available",
                OCCUPIED: "occupied",
                UNDER_CONSTRUCTION: "construction"
            };

            parkingData[slot.floor].push({
                id: slot.id,
                slot: slot.slotNumber.split("-")[1],
                type: slot.vehicleType.toLowerCase(),
                status: statusMap[slot.status.toUpperCase()]
            });

        });

        // Refresh the website
        updateStatistics();
        loadParkingSlots();

        console.log("Parking slots loaded from MySQL!");

    } catch (error) {

        console.error("Parking API Error:", error);

        alert("Unable to load parking slots. Please check your backend.");

    }
}

/* =====================================================
   CURRENT SETTINGS
===================================================== */

let currentFloor = 1;

let currentVehicleType = "all";

let selectedSlot = null;

let selectedSlotId = null;

/* =====================================================
   UPDATE STATISTICS
===================================================== */

function updateStatistics() {

    let total = 0;
    let available = 0;
    let occupied = 0;
    let construction = 0;

    Object.values(parkingData).forEach(floor => {

        floor.forEach(slot => {

            total++;

            if (slot.status === "available") {
                available++;
            }

            if (slot.status === "occupied") {
                occupied++;
            }

            if (slot.status === "construction") {
                construction++;
            }

        });

    });


    document.getElementById("totalSlots").textContent = total;

    document.getElementById("availableSlots").textContent = available;

    document.getElementById("occupiedSlots").textContent = occupied;

    document.getElementById("constructionSlots").textContent = construction;

    document.getElementById("heroAvailable").textContent = available;
}


/* =====================================================
   LOAD PARKING SLOTS
===================================================== */

function loadParkingSlots() {

    const grid = document.getElementById("parkingGrid");

    grid.innerHTML = "";

    const slots = parkingData[currentFloor];


    slots.forEach(slot => {

        if (
            currentVehicleType !== "all" &&
            slot.type !== currentVehicleType
        ) {
            return;
        }


        const div = document.createElement("div");

        div.className =
            "parking-slot " +
            slot.type +
            "-slot " +
            slot.status +
            "-slot";


        div.innerHTML = `
            <strong>${slot.slot}</strong>

            <span>
                ${slot.type === "car" ? "🚗" : "🏍️"}
            </span>

            <small>
                ${formatStatus(slot.status)}
            </small>
        `;


        if (slot.status === "available") {

            div.onclick = function () {

                selectSlot(
                    div,
                    slot.id,
                    slot.slot,
                    slot.type
                );

            };

        }


        grid.appendChild(div);

    });


    document.getElementById("currentFloorTitle")
        .textContent =
        `Floor ${currentFloor} Parking`;
}


/* =====================================================
   CHANGE FLOOR
===================================================== */

function changeFloor(floor, button) {

    currentFloor = floor;

    document.querySelectorAll(".floor-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });

    button.classList.add("active");

    loadParkingSlots();
}


/* =====================================================
   CHANGE VEHICLE VIEW
===================================================== */

function changeVehicleView(type, button) {

    currentVehicleType = type;

    document.querySelectorAll(".vehicle-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });

    button.classList.add("active");

    loadParkingSlots();
}


/* =====================================================
   SELECT SLOT
===================================================== */

function selectSlot(
    slotElement,
    slotId,
    slotName,
    vehicleType
) {

    document.querySelectorAll(".parking-slot")
        .forEach(slot => {
            slot.classList.remove("selected-slot");
        });

    slotElement.classList.add("selected-slot");

    selectedSlot = slotName;
    selectedSlotId = slotId;

    document.getElementById("selectedSlot")
        .value = slotName;

    document.getElementById("bookingFloor")
        .value = currentFloor;

    document.getElementById("vehicleType")
        .value = vehicleType;

    calculatePrice();

    document.getElementById("booking")
        .scrollIntoView({
            behavior: "smooth"
        });
}

/* =====================================================
   PRICE CALCULATION
===================================================== */

function calculatePrice() {

    const vehicleType =
        document.getElementById("vehicleType").value;

    const duration =
        parseInt(
            document.getElementById("duration").value
        );


    let pricePerHour = 0;


    if (vehicleType === "car") {

        pricePerHour = 30;

    }
    else if (vehicleType === "bike") {

        pricePerHour = 10;

    }


    let total = 0;


    if (!isNaN(duration)) {

        total = pricePerHour * duration;

    }


    document.getElementById("totalPrice")
        .textContent = `₹${total}`;
}


/* =====================================================
   SCROLL TO PARKING
===================================================== */

function scrollToParking() {

    document.getElementById("parking")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* =====================================================
   OPEN BOOKING
===================================================== */

function openBooking() {

    document.getElementById("booking")
        .scrollIntoView({
            behavior: "smooth"
        });
}

// Prevent selection of past parking dates
document.getElementById("arrivalDate").min =
    new Date().toLocaleDateString("en-CA");


/* =====================================================
   BOOKING FORM
===================================================== */


document.getElementById("bookingForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const vehicleNumber = document
        .getElementById("vehicleNumber")
        .value
        .trim()
        .toUpperCase()
        .replace(/[\s-]/g, "");

    // Indian vehicle registration number validation
    const vehicleNumberPattern =
        /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;

    if (!vehicleNumberPattern.test(vehicleNumber)) {
        alert("Please enter a valid Indian vehicle number.\nExample: UK04AB1234");
        return;
    }

    const duration = document.getElementById("duration").value;
    const arrivalDate = document.getElementById("arrivalDate").value;
    const arrivalTime = document.getElementById("arrivalTime").value;

    if (!selectedSlotId) {
        alert("Please select a parking slot first.");
        return;
    }

    if (!duration || Number(duration) <= 0) {
        alert("Please select a valid parking duration.");
        return;
    }

    if (!arrivalDate || !arrivalTime) {
        alert("Please select parking date and time.");
        return;
    }

    // Combine selected date and time
    const startDateTime = new Date(
        `${arrivalDate}T${arrivalTime}`
    );

    if (isNaN(startDateTime.getTime()) ||
        startDateTime.getTime() < Date.now() - 60000) {
        alert("Parking date and time cannot be in the past.");
        return;
    }

    const finalArrivalDateTime =
        `${arrivalDate}T${arrivalTime}:00`;

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");

    if (!userId || !token ||
        localStorage.getItem("userRole") !== "CUSTOMER") {
        alert("Please login as a customer before booking.");
        openAuth("customer");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/bookings/create?slotId=${selectedSlotId}&vehicleNumber=${encodeURIComponent(vehicleNumber)}&durationHours=${duration}&startTime=${encodeURIComponent(finalArrivalDateTime)}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const responseText = await response.text();

        console.log("HTTP Status:", response.status);
        console.log("Server Response:", responseText);

        const result = responseText
            ? JSON.parse(responseText)
            : {};

        if (!response.ok) {
            throw new Error(
                result.message || "Booking failed."
            );
        }

        alert(
            `Booking Successful!\n\n` +
            `Vehicle: ${vehicleNumber}\n` +
            `Slot: ${selectedSlot}\n` +
            `Arrival: ${result.startTime}\n` +
            `Duration: ${duration} hour(s)\n` +
            `Departure: ${result.endTime}\n` +
            `Amount: ₹${result.totalAmount}`
        );

        this.reset();

        selectedSlot = null;
        selectedSlotId = null;

        document.getElementById("selectedSlot").value = "";
        document.getElementById("totalPrice").textContent = "₹0";

        await fetchParkingSlots();

    } catch (error) {

        console.error("Booking Error:", error);
        alert(error.message);

    }

});


/* =====================================================
   CUSTOMER NAVBAR
===================================================== */

function updateCustomerNavbar() {

    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");

    if (userId && localStorage.getItem("userRole") === "CUSTOMER") {

        document.getElementById("authButtons").style.display = "none";

        document.getElementById("customerArea").style.display = "flex";

        document.getElementById("welcomeCustomer").textContent =
            "Welcome, " + userName;
        document.getElementById("customerName").value = userName;

    } else {

        document.getElementById("authButtons").style.display = "flex";

        document.getElementById("customerArea").style.display = "none";

    }
}



function customerLogout() {

    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    selectedSlot = null;
    selectedSlotId = null;

    updateCustomerNavbar();

    alert("You have logged out successfully.");

}


/* =====================================================
   AUTHENTICATION
===================================================== */

function openAuth(role) {

    document.getElementById("authModal")
        .style.display = "flex";

    hideAllAuthForms();


    if (role === "customer") {

        showCustomerLogin();

    }
    else {

        showAdminLogin();

    }
}


function closeAuth() {

    document.getElementById("authModal")
        .style.display = "none";
}


function hideAllAuthForms() {

    const forms = [
        "roleSelection",
        "customerLogin",
        "customerSignup",
        "adminLogin",
        "adminSignup"
    ];


    forms.forEach(id => {

        document.getElementById(id)
            .style.display = "none";

    });
}


function showRoleSelection() {

    hideAllAuthForms();

    document.getElementById("roleSelection")
        .style.display = "block";
}


function selectRole(role) {

    if (role === "customer") {

        showCustomerLogin();

    }
    else {

        showAdminLogin();

    }
}


/* =====================================================
   CUSTOMER AUTH
===================================================== */

function showCustomerLogin() {

    hideAllAuthForms();

    document.getElementById("customerLogin")
        .style.display = "flex";
}


function showCustomerSignup() {

    hideAllAuthForms();

    document.getElementById("customerSignup")
        .style.display = "flex";
}




async function customerLogin() {

    const email =
        document.getElementById("customerLoginEmail").value.trim();

    const password =
        document.getElementById("customerLoginPassword").value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Invalid email or password."
            );
        }

        if (result.role !== "CUSTOMER") {
            throw new Error("Please use the customer login.");
        }

        // Save customer details and JWT token
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("userName", result.name);
        localStorage.setItem("userEmail", result.email);
        localStorage.setItem("userRole", result.role);

        document.getElementById("customerName").value = result.name;

        alert("Welcome, " + result.name + "!");

        closeAuth();

        updateCustomerNavbar();

    } catch (error) {

        console.error("Login Error:", error);

        alert(error.message);

    }
}


async function customerSignup() {

    const name =
        document.getElementById("customerSignupName").value.trim();

    const email =
        document.getElementById("customerSignupEmail").value.trim();

    const phone =
        document.getElementById("customerSignupPhone").value.trim();

    const password =
        document.getElementById("customerSignupPassword").value;

    const confirm =
        document.getElementById("customerSignupConfirm").value;

    if (!name || !email || !phone || !password || !confirm) {
        alert("Please fill all fields.");
        return;
    }

    if (password !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/signup`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Registration failed."
            );
        }

        alert("Customer account created successfully!");

        document.getElementById("customerLoginEmail").value = email;

        showCustomerLogin();

    } catch (error) {

        console.error("Signup Error:", error);

        alert(error.message);

    }
}


/* =====================================================
   ADMIN AUTH
===================================================== */

function showAdminLogin() {

    hideAllAuthForms();

    document.getElementById("adminLogin")
        .style.display = "flex";
}


function showAdminSignup() {

    hideAllAuthForms();

    document.getElementById("adminSignup")
        .style.display = "flex";
}



async function adminLogin() {

    const email =
        document.getElementById("adminLoginEmail").value.trim();

    const password =
        document.getElementById("adminLoginPassword").value;

    if (!email || !password) {
        alert("Please enter admin email and password.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/admin/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Invalid admin email or password."
            );
        }

        if (result.role !== "ADMIN") {
            throw new Error("You are not authorized as an admin.");
        }

        // Save admin details and JWT token
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("userName", result.name);
        localStorage.setItem("userEmail", result.email);
        localStorage.setItem("userRole", result.role);

        alert("Welcome, Admin " + result.name + "!");

        closeAuth();

        openAdminDashboard();

    } catch (error) {

        console.error("Admin Login Error:", error);

        alert(error.message);

    }
}



async function adminSignup() {

    const name =
        document.getElementById("adminSignupName").value.trim();

    const email =
        document.getElementById("adminSignupEmail").value.trim();

    const password =
        document.getElementById("adminSignupPassword").value;

    const setupSecret =
        document.getElementById("adminCode").value;

    if (!name || !email || !password || !setupSecret) {
        alert("Please fill all fields.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/admin/setup`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    setupSecret: setupSecret
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Admin registration failed."
            );
        }

        alert("Admin account created successfully!");

        // Clear the setup secret field
        document.getElementById("adminCode").value = "";

        showAdminLogin();

    } catch (error) {

        console.error("Admin Signup Error:", error);

        alert(error.message);

    }
}


/* =====================================================
   ADMIN DASHBOARD DATA
===================================================== */

let adminParkingData = {
    1: [],
    2: [],
    3: [],
    4: []
};

/* =====================================================
   OPEN ADMIN DASHBOARD
===================================================== */

function openAdminDashboard() {

    document.getElementById("dashboard")
        .style.display = "none";

    document.querySelector(".statistics")
        .style.display = "none";

    document.getElementById("parking")
        .style.display = "none";

    document.getElementById("booking")
        .style.display = "none";

    document.getElementById("about")
        .style.display = "none";

    document.querySelector(".footer")
        .style.display = "none";


    document.getElementById("adminDashboard")
        .style.display = "block";


    loadAdminSlots();

    updateAdminStatistics();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   ADMIN LOGOUT
===================================================== */


function adminLogout() {

    // Clear admin login details and JWT token
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    document.getElementById("adminDashboard")
        .style.display = "none";

    document.getElementById("dashboard")
        .style.display = "flex";

    document.querySelector(".statistics")
        .style.display = "grid";

    document.getElementById("parking")
        .style.display = "block";

    document.getElementById("booking")
        .style.display = "block";

    document.getElementById("about")
        .style.display = "block";

    document.querySelector(".footer")
        .style.display = "block";

    updateCustomerNavbar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    alert("Admin logged out successfully.");
}


/* =====================================================
   LOAD ADMIN SLOTS
===================================================== */

async function loadAdminSlots() {

    const floor = document.getElementById("adminFloorSelect").value;

    const grid = document.getElementById("adminSlotGrid");

    grid.innerHTML = "Loading parking slots...";

    try {

        const response = await fetch(`${API_BASE_URL}/parking/slots`);

        if (!response.ok) {
            throw new Error("Unable to load parking slots.");
        }

        const slots = await response.json();

        adminParkingData = {
            1: [],
            2: [],
            3: [],
            4: []
        };

        slots.forEach(slot => {

            const statusMap = {
                AVAILABLE: "available",
                OCCUPIED: "occupied",
                UNDER_CONSTRUCTION: "construction"
            };

            adminParkingData[slot.floor].push({
                id: slot.id,
                slotName: slot.slotNumber.split("-")[1],
                vehicleType: slot.vehicleType.toLowerCase(),
                status: statusMap[slot.status]
            });

        });

        grid.innerHTML = "";

        adminParkingData[floor].forEach(slot => {

            const div = document.createElement("div");

            div.className = `admin-slot ${getAdminStatusClass(slot.status)}`;

            div.innerHTML = `
                <strong>
                    ${slot.slotName}
                    ${slot.vehicleType === "car" ? "🚗" : "🏍️"}
                </strong>

                <select>
                    <option value="available" ${slot.status === "available" ? "selected" : ""}>Available</option>
                    <option value="occupied" ${slot.status === "occupied" ? "selected" : ""}>Occupied</option>
                    <option value="construction" ${slot.status === "construction" ? "selected" : ""}>Under Construction</option>
                </select>
            `;

            const select = div.querySelector("select");

            select.addEventListener("change", function() {
                updateAdminSlot(slot.id, slot.slotName, this.value);
            });

            grid.appendChild(div);

        });

        updateAdminStatistics();

    } catch (error) {

        console.error("Admin Parking Error:", error);

        grid.innerHTML = "Failed to load parking slots.";

    }
}

/* =====================================================
   ADMIN STATUS CLASS
===================================================== */

function getAdminStatusClass(status) {

    if (status === "available") {
        return "admin-available";
    }

    if (status === "occupied") {
        return "admin-occupied";
    }

    return "admin-construction";
}


/* =====================================================
   UPDATE ADMIN SLOT
===================================================== */

async function updateAdminSlot(slotId, slotName, newStatus) {

    const statusMap = {
        available: "AVAILABLE",
        occupied: "OCCUPIED",
        construction: "UNDER_CONSTRUCTION"
    };

    const backendStatus = statusMap[newStatus];

    const token = localStorage.getItem("authToken");

    if (!token || localStorage.getItem("userRole") !== "ADMIN") {
        alert("Please login as Admin first.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/parking/slots/${slotId}/status?status=${backendStatus}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update parking slot.");
        }

        alert(
            `${slotName} status updated to ${formatStatus(newStatus)}`
        );

        await loadAdminSlots();

    } catch (error) {

        console.error("Admin Update Error:", error);

        alert("Unable to update slot status. Please try again.");

        await loadAdminSlots();
    }
}

/* =====================================================
   FORMAT STATUS
===================================================== */

function formatStatus(status) {

    if (status === "available") {
        return "Available";
    }

    if (status === "occupied") {
        return "Occupied";
    }

    return "Under Construction";
}


/* =====================================================
   ADMIN STATISTICS
===================================================== */

function updateAdminStatistics() {

    let total = 0;
    let available = 0;
    let occupied = 0;
    let construction = 0;

    Object.values(adminParkingData).forEach(floor => {

        floor.forEach(slot => {

            total++;

            if (slot.status === "available") {
                available++;
            }

            if (slot.status === "occupied") {
                occupied++;
            }

            if (slot.status === "construction") {
                construction++;
            }

        });

    });

    document.getElementById("adminTotal").textContent = total;

    document.getElementById("adminAvailable").textContent = available;

    document.getElementById("adminOccupied").textContent = occupied;

    document.getElementById("adminConstruction").textContent = construction;
}

/* =====================================================
   INITIALIZE WEBSITE
===================================================== */
document.addEventListener(
    "DOMContentLoaded",
    function() {

        fetchParkingSlots();

        updateCustomerNavbar();

    }
);

// ==========================================
// MY BOOKINGS
// ==========================================



async function fetchMyBookings() {

    const container = document.getElementById("myBookingsContainer");

    const token = localStorage.getItem("authToken");

    if (!token || localStorage.getItem("userRole") !== "CUSTOMER") {
        container.innerHTML = "<p>Please login as a customer to view your bookings.</p>";
        return;
    }

    container.innerHTML = "<p>Loading your bookings...</p>";

    // Format date and time
    function formatDateTime(dateTime) {

        if (!dateTime) return "—";

        const date = new Date(dateTime);

        if (isNaN(date.getTime())) return dateTime;

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/bookings/my`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const bookings = await response.json();

        if (!response.ok) {
            throw new Error("Unable to fetch bookings.");
        }

        if (!bookings || bookings.length === 0) {
            container.innerHTML = "<p>You have no bookings yet.</p>";
            return;
        }

        let html = `
            <table class="bookings-table">

                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Vehicle Number</th>
                        <th>Parking Slot</th>
                        <th>Floor</th>
                        <th>Arrival Date & Time</th>
                        <th>Departure Date & Time</th>
                        <th>Duration</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
        `;

        bookings.forEach(booking => {

            const cancelButton =
                booking.status === "CONFIRMED"
                ? `<button type="button"
                     onclick="cancelBooking(${booking.id})"
                     class="cancel-booking-btn">
                     Cancel Booking
                   </button>`
                : "—";

            html += `
                <tr>
                    <td>${booking.id}</td>
                    <td>${booking.vehicleNumber}</td>
                    <td>${booking.parkingSlot.slotNumber}</td>
                    <td>${booking.parkingSlot.floor}</td>
                    <td>${formatDateTime(booking.startTime)}</td>
                    <td>${formatDateTime(booking.endTime)}</td>
                    <td>${booking.durationHours} hour(s)</td>
                    <td>₹${booking.totalAmount}</td>
                    <td>${booking.status}</td>
                    <td>${cancelButton}</td>
                </tr>
            `;

        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;

    } catch (error) {

        console.error("My Bookings Error:", error);

        container.innerHTML =
            "<p>Unable to load bookings. Please try again.</p>";

    }

}



async function cancelBooking(bookingId) {

    const confirmed = confirm(
        "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
        return;
    }

    const token = localStorage.getItem("authToken");

    try {

        const response = await fetch(
            `${API_BASE_URL}/bookings/${bookingId}/cancel`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Unable to cancel booking."
            );
        }

        alert("Booking cancelled successfully!");

        await fetchMyBookings();

        await fetchParkingSlots();

    } catch (error) {

        console.error("Cancellation Error:", error);

        alert(error.message);

    }

}


// ==========================================
// MY BOOKINGS NAVIGATION
// ==========================================

document.getElementById("myBookingsLink").addEventListener("click", function(event) {

    event.preventDefault();

    document.getElementById("myBookings").scrollIntoView({
        behavior: "smooth"
    });

    fetchMyBookings();

});


// ==========================================
// BOOKING TYPE - IMMEDIATE / ADVANCE
// ==========================================

const bookingTypeSelect = document.getElementById("bookingType");
const arrivalDateInput = document.getElementById("arrivalDate");
const arrivalTimeInput = document.getElementById("arrivalTime");

function updateBookingType() {

    const now = new Date();

    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    const currentTime = [
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0")
    ].join(":");

    if (bookingTypeSelect.value === "immediate") {

        arrivalDateInput.value = today;
        arrivalTimeInput.value = currentTime;

        arrivalDateInput.disabled = true;
        arrivalTimeInput.disabled = true;

    } else {

        arrivalDateInput.disabled = false;
        arrivalTimeInput.disabled = false;

        arrivalDateInput.min = today;

        if (arrivalDateInput.value < today) {
            arrivalDateInput.value = today;
        }

    }

}

bookingTypeSelect.addEventListener("change", updateBookingType);

// Set default booking type when page loads
updateBookingType();
