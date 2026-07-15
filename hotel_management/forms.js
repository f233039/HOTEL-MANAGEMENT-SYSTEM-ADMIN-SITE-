// ══════ MODAL FORMS ══════

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    currentModal = null; editingId = null;
}

async function openModal(type, data = null) {
    currentModal = type;
    editingId = null;
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    let html = '';

    if (type === 'hotel') {
        editingId = data?.hotelID || null;
        title.textContent = data ? 'Edit Hotel' : 'Add Hotel';
        html = `
            <div class="form-group"><label>Hotel Name</label><input id="f_name" value="${data?.name || ''}" placeholder="e.g. Grand Palace Hotel"></div>
            <div class="form-group"><label>Location</label><input id="f_location" value="${data?.location || ''}" placeholder="e.g. Islamabad, Pakistan"></div>
            <div class="form-row">
                <div class="form-group"><label>Rating (0-5)</label><input id="f_rating" type="number" step="0.1" min="0" max="5" value="${data?.rating || '4.0'}"></div>
                <div class="form-group"><label>Contact No</label><input id="f_contactNo" value="${data?.contactNo || ''}" placeholder="+92-XX-XXXXXXX"></div>
            </div>`;
    }
    else if (type === 'guest') {
        editingId = data?.guestID || null;
        title.textContent = data ? 'Edit Guest' : 'Add Guest';
        html = `
            <div class="form-group"><label>Full Name</label><input id="f_name" value="${data?.name || ''}"></div>
            <div class="form-row">
                <div class="form-group"><label>Email</label><input id="f_email" type="email" value="${data?.email || ''}"></div>
                <div class="form-group"><label>Phone</label><input id="f_phone" value="${data?.phone || ''}"></div>
            </div>
            <div class="form-group"><label>Address</label><input id="f_address" value="${data?.address || ''}"></div>
            <div class="form-group"><label>Guest Type</label><select id="f_guestType">
                <option value="Regular" ${data?.guestType==='Regular'?'selected':''}>Regular</option>
                <option value="VIP" ${data?.guestType==='VIP'?'selected':''}>VIP</option>
                <option value="Corporate" ${data?.guestType==='Corporate'?'selected':''}>Corporate</option>
            </select></div>`;
    }
    else if (type === 'service') {
        editingId = data?.serviceID || null;
        title.textContent = data ? 'Edit Service' : 'Add Service';
        html = `
            <div class="form-group"><label>Service Name</label><input id="f_serviceName" value="${data?.serviceName || ''}"></div>
            <div class="form-group"><label>Cost (PKR)</label><input id="f_cost" type="number" value="${data?.cost || ''}"></div>`;
    }
    else if (type === 'room') {
        editingId = data?.roomID || null;
        title.textContent = data ? 'Edit Room' : 'Add Room';
        const hotels = await api('hotels.php');
        html = `
            <div class="form-row">
                <div class="form-group"><label>Room No</label><input id="f_roomNo" value="${data?.roomNo || ''}"></div>
                <div class="form-group"><label>Floor</label><input id="f_floor" type="number" value="${data?.floor || '1'}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Hotel</label><select id="f_hotelID">${hotels.map(h => `<option value="${h.hotelID}" ${data?.hotelID==h.hotelID?'selected':''}>${h.name}</option>`).join('')}</select></div>
                <div class="form-group"><label>Room Type</label><select id="f_roomType" onchange="showRoomSpecial()">
                    <option value="Suite" ${data?.roomType==='Suite'?'selected':''}>Suite</option>
                    <option value="Deluxe" ${data?.roomType==='Deluxe'?'selected':''}>Deluxe</option>
                    <option value="Executive" ${data?.roomType==='Executive'?'selected':''}>Executive</option>
                </select></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Price (PKR)</label><input id="f_price" type="number" value="${data?.price || ''}"></div>
                <div class="form-group"><label>Status</label><select id="f_status">
                    <option value="Available" ${data?.status==='Available'?'selected':''}>Available</option>
                    <option value="Occupied" ${data?.status==='Occupied'?'selected':''}>Occupied</option>
                    <option value="Maintenance" ${data?.status==='Maintenance'?'selected':''}>Maintenance</option>
                    <option value="Reserved" ${data?.status==='Reserved'?'selected':''}>Reserved</option>
                </select></div>
            </div>
            <div class="form-group"><label>Specialization Details</label><div id="specialFields"></div></div>`;
        body.innerHTML = html;
        document.getElementById('modalOverlay').classList.add('active');
        showRoomSpecial(data);
        return;
    }
    else if (type === 'staff') {
        editingId = data?.staffID || null;
        title.textContent = data ? 'Edit Staff' : 'Add Staff';
        const hotels = await api('hotels.php');
        html = `
            <div class="form-group"><label>Full Name</label><input id="f_name" value="${data?.name || ''}"></div>
            <div class="form-row">
                <div class="form-group"><label>Hotel</label><select id="f_hotelID">${hotels.map(h => `<option value="${h.hotelID}" ${data?.hotelID==h.hotelID?'selected':''}>${h.name}</option>`).join('')}</select></div>
                <div class="form-group"><label>Salary (PKR)</label><input id="f_salary" type="number" value="${data?.salary || ''}"></div>
            </div>
            <div class="form-group"><label>Role</label><select id="f_role" onchange="showStaffSpecial()">
                <option value="Manager" ${data?.role==='Manager'?'selected':''}>Manager</option>
                <option value="Receptionist" ${data?.role==='Receptionist'?'selected':''}>Receptionist</option>
                <option value="Chef" ${data?.role==='Chef'?'selected':''}>Chef</option>
                <option value="Cleaner" ${data?.role==='Cleaner'?'selected':''}>Cleaner</option>
                <option value="SecurityGuard" ${data?.role==='SecurityGuard'?'selected':''}>Security Guard</option>
            </select></div>
            <div class="form-group"><label>Role-Specific Details</label><div id="specialFields"></div></div>`;
        body.innerHTML = html;
        document.getElementById('modalOverlay').classList.add('active');
        showStaffSpecial(data);
        return;
    }
    else if (type === 'reservation') {
        editingId = data?.reservationID || null;
        title.textContent = data ? 'Edit Reservation' : 'New Reservation';
        const guests = await api('guests.php');
        const rooms = await api('rooms.php');
        const services = await api('services.php');
        const today = new Date().toISOString().split('T')[0];
        html = `
            <div class="form-row">
                <div class="form-group"><label>Guest</label><select id="f_guestID">${guests.map(g => `<option value="${g.guestID}" ${data?.guestID==g.guestID?'selected':''}>${g.name}</option>`).join('')}</select></div>
                <div class="form-group"><label>Room</label><select id="f_roomID">${rooms.map(r => `<option value="${r.roomID}" ${data?.roomID==r.roomID?'selected':''}>${r.roomNo} - ${r.hotelName} (${r.roomType})</option>`).join('')}</select></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Check-In Date</label><input id="f_checkInDate" type="date" value="${data?.checkInDate || ''}"></div>
                <div class="form-group"><label>Check-Out Date</label><input id="f_checkOutDate" type="date" value="${data?.checkOutDate || ''}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Total Amount (PKR)</label><input id="f_totalAmount" type="number" value="${data?.totalAmount || ''}"></div>
                <div class="form-group"><label>Booking Date</label><input id="f_bookingDate" type="date" value="${data?.bookingDate || today}"></div>
            </div>
            <div class="form-group"><label>Status</label><select id="f_resStatus">
                <option value="Pending" ${data?.status==='Pending'?'selected':''}>Pending</option>
                <option value="Confirmed" ${data?.status==='Confirmed'?'selected':''}>Confirmed</option>
                <option value="Checked-In" ${data?.status==='Checked-In'?'selected':''}>Checked-In</option>
                <option value="Checked-Out" ${data?.status==='Checked-Out'?'selected':''}>Checked-Out</option>
                <option value="Cancelled" ${data?.status==='Cancelled'?'selected':''}>Cancelled</option>
            </select></div>
            <div class="form-group"><label>Services</label><div class="checkbox-group">
                ${services.map(s => `<label><input type="checkbox" name="svc" value="${s.serviceID}" ${data?.services?.find(x=>x.serviceID==s.serviceID)?'checked':''}><span>${s.serviceName} (₨${Number(s.cost).toLocaleString()})</span></label>`).join('')}
            </div></div>`;
    }
    else if (type === 'payment') {
        editingId = data?.paymentID || null;
        title.textContent = data ? 'Edit Payment' : 'Add Payment';
        let resOptions = '';
        if (!data) {
            const res = await api('reservations.php');
            resOptions = `<div class="form-group"><label>Reservation</label><select id="f_reservationID">${res.map(r => `<option value="${r.reservationID}">#${r.reservationID} - ${r.guestName} (${r.checkInDate})</option>`).join('')}</select></div>`;
        }
        html = `
            ${resOptions}
            <div class="form-row">
                <div class="form-group"><label>Payment Method</label><select id="f_paymentMethod">
                    <option value="Cash" ${data?.paymentMethod==='Cash'?'selected':''}>Cash</option>
                    <option value="Credit Card" ${data?.paymentMethod==='Credit Card'?'selected':''}>Credit Card</option>
                    <option value="Debit Card" ${data?.paymentMethod==='Debit Card'?'selected':''}>Debit Card</option>
                    <option value="Online" ${data?.paymentMethod==='Online'?'selected':''}>Online</option>
                    <option value="Bank Transfer" ${data?.paymentMethod==='Bank Transfer'?'selected':''}>Bank Transfer</option>
                </select></div>
                <div class="form-group"><label>Amount (PKR)</label><input id="f_amount" type="number" value="${data?.amount || ''}"></div>
            </div>
            <div class="form-group"><label>Status</label><select id="f_payStatus">
                <option value="Pending" ${data?.status==='Pending'?'selected':''}>Pending</option>
                <option value="Completed" ${data?.status==='Completed'?'selected':''}>Completed</option>
                <option value="Failed" ${data?.status==='Failed'?'selected':''}>Failed</option>
                <option value="Refunded" ${data?.status==='Refunded'?'selected':''}>Refunded</option>
            </select></div>`;
    }
    body.innerHTML = html;
    document.getElementById('modalOverlay').classList.add('active');
}

// ── Room Specialization Fields ──
function showRoomSpecial(data) {
    const type = document.getElementById('f_roomType').value;
    const el = document.getElementById('specialFields');
    if (type === 'Suite') {
        el.innerHTML = `<h4>Suite Details</h4>
            <div class="form-row"><div class="form-group"><label>Living Area (sqft)</label><input id="f_livingArea" type="number" value="${data?.livingArea || ''}"></div>
            <div class="form-group"><label>Balcony</label><select id="f_balcony"><option value="1" ${data?.balcony==1?'selected':''}>Yes</option><option value="0" ${data?.balcony==0?'selected':''}>No</option></select></div></div>`;
    } else if (type === 'Deluxe') {
        el.innerHTML = `<h4>Deluxe Details</h4>
            <div class="form-group"><label>Luxury Features</label><textarea id="f_luxuryFeatures">${data?.luxuryFeatures || ''}</textarea></div>
            <div class="form-group"><label>Extra Services</label><textarea id="f_extraServices">${data?.extraServices || ''}</textarea></div>`;
    } else if (type === 'Executive') {
        el.innerHTML = `<h4>Executive Details</h4>
            <div class="form-row"><div class="form-group"><label>Work Desk</label><select id="f_workDesk"><option value="1" ${data?.workDesk==1?'selected':''}>Yes</option><option value="0" ${data?.workDesk==0?'selected':''}>No</option></select></div>
            <div class="form-group"><label>Business Facilities</label><textarea id="f_businessFacilities">${data?.businessFacilities || ''}</textarea></div></div>`;
    }
}

// ── Staff Specialization Fields ──
function showStaffSpecial(data) {
    const role = document.getElementById('f_role').value;
    const el = document.getElementById('specialFields');
    if (role === 'Manager') {
        el.innerHTML = `<h4>Manager Details</h4>
            <div class="form-row"><div class="form-group"><label>Department</label><input id="f_department" value="${data?.department || ''}"></div>
            <div class="form-group"><label>Bonus (PKR)</label><input id="f_bonus" type="number" value="${data?.bonus || '0'}"></div></div>`;
    } else if (role === 'Receptionist') {
        el.innerHTML = `<h4>Receptionist Details</h4>
            <div class="form-row"><div class="form-group"><label>Shift</label><select id="f_shift"><option value="Morning" ${data?.recShift==='Morning'?'selected':''}>Morning</option><option value="Evening" ${data?.recShift==='Evening'?'selected':''}>Evening</option><option value="Night" ${data?.recShift==='Night'?'selected':''}>Night</option></select></div>
            <div class="form-group"><label>Working Hours</label><input id="f_workingHours" type="number" value="${data?.workingHours || '8'}"></div></div>`;
    } else if (role === 'Chef') {
        el.innerHTML = `<h4>Chef Details</h4>
            <div class="form-row"><div class="form-group"><label>Specialization</label><input id="f_specialization" value="${data?.specialization || ''}"></div>
            <div class="form-group"><label>Experience (Years)</label><input id="f_experience" type="number" value="${data?.experience || '0'}"></div></div>`;
    } else if (role === 'Cleaner') {
        el.innerHTML = `<h4>Cleaner Details</h4>
            <div class="form-group"><label>Assigned Floor</label><input id="f_assignedFloor" type="number" value="${data?.assignedFloor || '1'}"></div>`;
    } else if (role === 'SecurityGuard') {
        el.innerHTML = `<h4>Security Guard Details</h4>
            <div class="form-row"><div class="form-group"><label>Shift</label><select id="f_shift"><option value="Morning" ${data?.sgShift==='Morning'?'selected':''}>Morning</option><option value="Evening" ${data?.sgShift==='Evening'?'selected':''}>Evening</option><option value="Night" ${data?.sgShift==='Night'?'selected':''}>Night</option></select></div>
            <div class="form-group"><label>Security Level</label><select id="f_securityLevel"><option value="Level1" ${data?.securityLevel==='Level1'?'selected':''}>Level 1</option><option value="Level2" ${data?.securityLevel==='Level2'?'selected':''}>Level 2</option><option value="Level3" ${data?.securityLevel==='Level3'?'selected':''}>Level 3</option></select></div></div>`;
    }
}

// ══════ SAVE RECORD ══════
async function saveRecord() {
    const type = currentModal;
    const v = id => document.getElementById(id)?.value;
    let payload, endpoint, method;

    try {
        if (type === 'hotel') {
            payload = { name: v('f_name'), location: v('f_location'), rating: v('f_rating'), contactNo: v('f_contactNo') };
            if (editingId) { payload.hotelID = editingId; method = 'PUT'; } else { method = 'POST'; }
            endpoint = 'hotels.php';
        } else if (type === 'guest') {
            payload = { name: v('f_name'), email: v('f_email'), phone: v('f_phone'), address: v('f_address'), guestType: v('f_guestType') };
            if (editingId) { payload.guestID = editingId; method = 'PUT'; } else { method = 'POST'; }
            endpoint = 'guests.php';
        } else if (type === 'service') {
            payload = { serviceName: v('f_serviceName'), cost: v('f_cost') };
            if (editingId) { payload.serviceID = editingId; method = 'PUT'; } else { method = 'POST'; }
            endpoint = 'services.php';
        } else if (type === 'room') {
            payload = { roomNo: v('f_roomNo'), floor: v('f_floor'), status: v('f_status'), price: v('f_price'), hotelID: v('f_hotelID'), roomType: v('f_roomType') };
            const t = v('f_roomType');
            if (t === 'Suite') { payload.livingArea = v('f_livingArea'); payload.balcony = v('f_balcony'); }
            else if (t === 'Deluxe') { payload.luxuryFeatures = v('f_luxuryFeatures'); payload.extraServices = v('f_extraServices'); }
            else if (t === 'Executive') { payload.workDesk = v('f_workDesk'); payload.businessFacilities = v('f_businessFacilities'); }
            if (editingId) { payload.roomID = editingId; method = 'PUT'; } else { method = 'POST'; }
            endpoint = 'rooms.php';
        } else if (type === 'staff') {
            payload = { name: v('f_name'), salary: v('f_salary'), hotelID: v('f_hotelID'), role: v('f_role') };
            const r = v('f_role');
            if (r === 'Manager') { payload.department = v('f_department'); payload.bonus = v('f_bonus'); }
            else if (r === 'Receptionist') { payload.shift = v('f_shift'); payload.workingHours = v('f_workingHours'); }
            else if (r === 'Chef') { payload.specialization = v('f_specialization'); payload.experience = v('f_experience'); }
            else if (r === 'Cleaner') { payload.assignedFloor = v('f_assignedFloor'); }
            else if (r === 'SecurityGuard') { payload.shift = v('f_shift'); payload.securityLevel = v('f_securityLevel'); }
            if (editingId) { payload.staffID = editingId; method = 'PUT'; } else { method = 'POST'; }
            endpoint = 'staff.php';
        } else if (type === 'reservation') {
            const svcs = [...document.querySelectorAll('input[name="svc"]:checked')].map(c => c.value);
            payload = { guestID: v('f_guestID'), roomID: v('f_roomID'), checkInDate: v('f_checkInDate'), checkOutDate: v('f_checkOutDate'),
                totalAmount: v('f_totalAmount'), bookingDate: v('f_bookingDate'), status: v('f_resStatus'), serviceIDs: svcs };
            if (editingId) { payload.reservationID = editingId; method = 'PUT'; } else { method = 'POST'; }
            endpoint = 'reservations.php';
        } else if (type === 'payment') {
            payload = { paymentMethod: v('f_paymentMethod'), amount: v('f_amount'), status: v('f_payStatus') };
            if (editingId) { payload.paymentID = editingId; method = 'PUT'; }
            else { payload.reservationID = v('f_reservationID'); method = 'POST'; }
            endpoint = 'payments.php';
        }

        const result = await api(endpoint, method, payload);
        if (result.error) { toast(result.error, 'error'); return; }
        toast(result.message || 'Saved successfully!');
        closeModal();

        const loaders = { hotel: loadHotels, room: loadRooms, staff: loadStaff, guest: loadGuests,
            reservation: loadReservations, service: loadServices, payment: loadPayments };
        if (loaders[type]) loaders[type]();
    } catch (e) {
        toast('Error: ' + e.message, 'error');
    }
}
