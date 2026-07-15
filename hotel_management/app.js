const API = 'api/';
let currentModal = null;
let editingId = null;

// ── Navigation ──
function showSection(name) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('sec-' + name).classList.add('active');
    document.querySelector(`.nav-item[data-section="${name}"]`).classList.add('active');
    const titles = {
        dashboard: ['Dashboard', 'Overview of your hotel management system'],
        hotels: ['Hotels', 'Manage hotel properties'], rooms: ['Rooms', 'Manage rooms (Suite, Deluxe, Executive)'],
        staff: ['Staff', 'Manage staff (Manager, Receptionist, Chef, Cleaner, Security)'],
        guests: ['Guests', 'Manage guest records'], reservations: ['Reservations', 'Manage bookings'],
        services: ['Services', 'Manage hotel services'], payments: ['Payments', 'Track payments']
    };
    document.getElementById('pageTitle').textContent = titles[name][0];
    document.getElementById('pageSubtitle').textContent = titles[name][1];
    if (name === 'dashboard') loadStats();
    else if (name === 'hotels') loadHotels();
    else if (name === 'rooms') loadRooms();
    else if (name === 'staff') loadStaff();
    else if (name === 'guests') loadGuests();
    else if (name === 'reservations') loadReservations();
    else if (name === 'services') loadServices();
    else if (name === 'payments') loadPayments();
}

// ── Toast ──
function toast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ── API Helper ──
async function api(endpoint, method = 'GET', data = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) opts.body = JSON.stringify(data);
    const r = await fetch(API + endpoint, opts);
    return r.json();
}

// ── Status Badge ──
function badge(val) {
    const map = { 'Available': 'success', 'Occupied': 'warning', 'Maintenance': 'danger', 'Reserved': 'info',
        'Confirmed': 'success', 'Pending': 'warning', 'Cancelled': 'danger', 'Checked-In': 'info', 'Checked-Out': 'purple',
        'Completed': 'success', 'Failed': 'danger', 'Refunded': 'info',
        'VIP': 'purple', 'Regular': 'info', 'Corporate': 'warning' };
    return `<span class="badge badge-${map[val] || 'info'}">${val}</span>`;
}

function actionBtns(editFn, delFn) {
    return `<div class="actions-cell">
        <button class="btn-icon edit" onclick="${editFn}" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn-icon delete" onclick="${delFn}" title="Delete"><i class="fas fa-trash"></i></button></div>`;
}

// ── Dashboard Stats ──
async function loadStats() {
    try {
        const s = await api('hotels.php?action=stats');
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card"><div class="stat-icon">🏨</div><div class="stat-value">${s.hotels}</div><div class="stat-label">Hotels</div></div>
            <div class="stat-card"><div class="stat-icon">🚪</div><div class="stat-value">${s.rooms}</div><div class="stat-label">Rooms</div></div>
            <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-value">${s.guests}</div><div class="stat-label">Guests</div></div>
            <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-value">${s.reservations}</div><div class="stat-label">Reservations</div></div>
            <div class="stat-card"><div class="stat-icon">👨‍💼</div><div class="stat-value">${s.staff}</div><div class="stat-label">Staff</div></div>
            <div class="stat-card"><div class="stat-icon">🛎️</div><div class="stat-value">${s.services}</div><div class="stat-label">Services</div></div>
            <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-value">₨${Number(s.revenue).toLocaleString()}</div><div class="stat-label">Revenue</div></div>`;
    } catch (e) { document.getElementById('statsGrid').innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Cannot connect to API</p><small>Make sure XAMPP Apache & MySQL are running</small></div>'; }
}

// ══════ HOTELS ══════
async function loadHotels() {
    const q = document.getElementById('searchHotels')?.value || '';
    const data = await api('hotels.php' + (q ? '?search=' + q : ''));
    document.getElementById('hotelsTable').innerHTML = data.length ? data.map(h => `<tr>
        <td>${h.hotelID}</td><td style="color:var(--text-primary);font-weight:600">${h.name}</td><td>${h.location}</td>
        <td>⭐ ${h.rating}</td><td>${h.contactNo}</td>
        <td>${actionBtns(`editHotel(${h.hotelID})`, `deleteHotel(${h.hotelID})`)}</td></tr>`).join('')
        : '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🏨</div><p>No hotels found</p></div></td></tr>';
}

async function editHotel(id) {
    const h = await api('hotels.php?action=single&id=' + id);
    openModal('hotel', h);
}

async function deleteHotel(id) {
    if (!confirm('Delete this hotel? All rooms and staff will also be removed.')) return;
    await api('hotels.php?id=' + id, 'DELETE');
    toast('Hotel deleted'); loadHotels(); loadStats();
}

// ══════ ROOMS ══════
async function loadRooms() {
    const q = document.getElementById('searchRooms')?.value || '';
    const data = await api('rooms.php' + (q ? '?search=' + q : ''));
    document.getElementById('roomsTable').innerHTML = data.length ? data.map(r => {
        let details = '';
        if (r.roomType === 'Suite') details = `Area: ${r.livingArea}sqft, Balcony: ${r.balcony == 1 ? 'Yes' : 'No'}`;
        else if (r.roomType === 'Deluxe') details = r.luxuryFeatures || '-';
        else if (r.roomType === 'Executive') details = `Desk: ${r.workDesk == 1 ? 'Yes' : 'No'}`;
        return `<tr><td>${r.roomID}</td><td style="font-weight:600;color:var(--text-primary)">${r.roomNo}</td><td>${r.hotelName}</td>
        <td>${badge(r.roomType)}</td><td>${r.floor}</td><td>₨${Number(r.price).toLocaleString()}</td>
        <td>${badge(r.status)}</td><td style="max-width:180px;overflow:hidden;text-overflow:ellipsis">${details}</td>
        <td>${actionBtns(`editRoom(${r.roomID})`, `deleteRoom(${r.roomID})`)}</td></tr>`;
    }).join('') : '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🚪</div><p>No rooms found</p></div></td></tr>';
}

async function editRoom(id) { const r = await api('rooms.php?action=single&id=' + id); openModal('room', r); }
async function deleteRoom(id) { if (!confirm('Delete this room?')) return; await api('rooms.php?id=' + id, 'DELETE'); toast('Room deleted'); loadRooms(); }

// ══════ STAFF ══════
async function loadStaff() {
    const q = document.getElementById('searchStaff')?.value || '';
    const data = await api('staff.php' + (q ? '?search=' + q : ''));
    document.getElementById('staffTable').innerHTML = data.length ? data.map(s => {
        let details = '';
        if (s.role === 'Manager') details = `Dept: ${s.department}, Bonus: ₨${Number(s.bonus).toLocaleString()}`;
        else if (s.role === 'Receptionist') details = `Shift: ${s.recShift}, Hours: ${s.workingHours}`;
        else if (s.role === 'Chef') details = `${s.specialization}, ${s.experience}yr exp`;
        else if (s.role === 'Cleaner') details = `Floor: ${s.assignedFloor}`;
        else if (s.role === 'SecurityGuard') details = `Shift: ${s.sgShift}, ${s.securityLevel}`;
        return `<tr><td>${s.staffID}</td><td style="font-weight:600;color:var(--text-primary)">${s.name}</td><td>${s.hotelName}</td>
        <td>${badge(s.role)}</td><td>₨${Number(s.salary).toLocaleString()}</td><td>${details}</td>
        <td>${actionBtns(`editStaffMember(${s.staffID})`, `deleteStaffMember(${s.staffID})`)}</td></tr>`;
    }).join('') : '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">👨‍💼</div><p>No staff found</p></div></td></tr>';
}

async function editStaffMember(id) { const s = await api('staff.php?action=single&id=' + id); openModal('staff', s); }
async function deleteStaffMember(id) { if (!confirm('Delete this staff member?')) return; await api('staff.php?id=' + id, 'DELETE'); toast('Staff deleted'); loadStaff(); }

// ══════ GUESTS ══════
async function loadGuests() {
    const q = document.getElementById('searchGuests')?.value || '';
    const data = await api('guests.php' + (q ? '?search=' + q : ''));
    document.getElementById('guestsTable').innerHTML = data.length ? data.map(g => `<tr>
        <td>${g.guestID}</td><td style="font-weight:600;color:var(--text-primary)">${g.name}</td><td>${g.email}</td>
        <td>${g.phone}</td><td>${g.address || '-'}</td><td>${badge(g.guestType)}</td>
        <td>${actionBtns(`editGuest(${g.guestID})`, `deleteGuest(${g.guestID})`)}</td></tr>`).join('')
        : '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">👥</div><p>No guests found</p></div></td></tr>';
}

async function editGuest(id) { const g = await api('guests.php?action=single&id=' + id); openModal('guest', g); }
async function deleteGuest(id) { if (!confirm('Delete this guest?')) return; await api('guests.php?id=' + id, 'DELETE'); toast('Guest deleted'); loadGuests(); }

// ══════ RESERVATIONS ══════
async function loadReservations() {
    const q = document.getElementById('searchReservations')?.value || '';
    const data = await api('reservations.php' + (q ? '?search=' + q : ''));
    document.getElementById('reservationsTable').innerHTML = data.length ? data.map(r => `<tr>
        <td>${r.reservationID}</td><td style="font-weight:600;color:var(--text-primary)">${r.guestName}</td><td>${r.roomNo}</td>
        <td>${r.hotelName}</td><td>${r.checkInDate}</td><td>${r.checkOutDate}</td>
        <td>₨${Number(r.totalAmount).toLocaleString()}</td><td>${badge(r.status)}</td>
        <td>${actionBtns(`editReservation(${r.reservationID})`, `deleteReservation(${r.reservationID})`)}</td></tr>`).join('')
        : '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📅</div><p>No reservations found</p></div></td></tr>';
}

async function editReservation(id) { const r = await api('reservations.php?action=single&id=' + id); openModal('reservation', r); }
async function deleteReservation(id) { if (!confirm('Delete this reservation? Payment will also be removed.')) return; await api('reservations.php?id=' + id, 'DELETE'); toast('Reservation deleted'); loadReservations(); }

// ══════ SERVICES ══════
async function loadServices() {
    const q = document.getElementById('searchServices')?.value || '';
    const data = await api('services.php' + (q ? '?search=' + q : ''));
    document.getElementById('servicesTable').innerHTML = data.length ? data.map(s => `<tr>
        <td>${s.serviceID}</td><td style="font-weight:600;color:var(--text-primary)">${s.serviceName}</td>
        <td>₨${Number(s.cost).toLocaleString()}</td>
        <td>${actionBtns(`editService(${s.serviceID})`, `deleteService(${s.serviceID})`)}</td></tr>`).join('')
        : '<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">🛎️</div><p>No services found</p></div></td></tr>';
}

async function editService(id) { const s = await api('services.php?action=single&id=' + id); openModal('service', s); }
async function deleteService(id) { if (!confirm('Delete this service?')) return; await api('services.php?id=' + id, 'DELETE'); toast('Service deleted'); loadServices(); }

// ══════ PAYMENTS ══════
async function loadPayments() {
    const q = document.getElementById('searchPayments')?.value || '';
    const data = await api('payments.php' + (q ? '?search=' + q : ''));
    document.getElementById('paymentsTable').innerHTML = data.length ? data.map(p => `<tr>
        <td>${p.paymentID}</td><td style="font-weight:600;color:var(--text-primary)">${p.guestName}</td><td>#${p.reservationID}</td>
        <td>${p.paymentMethod}</td><td>₨${Number(p.amount).toLocaleString()}</td><td>${badge(p.status)}</td>
        <td>${actionBtns(`editPayment(${p.paymentID})`, `deletePayment(${p.paymentID})`)}</td></tr>`).join('')
        : '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">💳</div><p>No payments found</p></div></td></tr>';
}

async function editPayment(id) { const p = await api('payments.php?action=single&id=' + id); openModal('payment', p); }
async function deletePayment(id) { if (!confirm('Delete this payment?')) return; await api('payments.php?id=' + id, 'DELETE'); toast('Payment deleted'); loadPayments(); }

// ── Init ──
document.addEventListener('DOMContentLoaded', () => loadStats());
