let selectedRow = null;
let photos = [];
let receipts = [];
let currentSubtaskRow = null;
let sortColumn = null;
let sortDirection = 'asc';
let selectedVehicle = null;
let currentDate = new Date('2025-06-03T07:19:00-07:00'); // 07:19 AM PDT on June 03, 2025
let fleet = [
  {
    id: 1,
    photo: "https://bonhamscarsonline.twic.pics/preview-CB223DB6-0E40-4AF9-9B8F-ABE1AC9D1C08.jpg?twic=v1/cover=1900x1199",
    make: "Porsche",
    model: "996 Convertible",
    year: 2003,
    mileage: 50000,
    vin: "WP0CA29933S651234"
  },
  {
    id: 2,
    photo: "https://media.ed.edmunds-media.com/tesla/model-3/2018/oem/2018_tesla_model-3_sedan_performance_fq_oem_1_1280x855.jpg",
    make: "Tesla",
    model: "Model 3",
    year: 2019,
    mileage: 65000,
    vin: "5YJ3E1EA8KF123456"
  }
];

// Sample scheduled services data
let scheduledServices = [
  {
    vehicleId: 1,
    description: "Oil Change",
    scheduledDate: "06/15/2025",
    mileage: 51000,
    details: "Check oil levels and replace filter",
    vendor: "AutoFix Shop",
    projectedCost: "$50",
    actualCost: "$45",
    vendors: "AutoFix Shop, CarCare Center",
    metadata: '{"oilChange": true, "sparkPlugs": false, "brakes": false}',
    subtasks: '[]',
    status: "Scheduled"
  },
  {
    vehicleId: 1,
    description: "Tire Rotation",
    scheduledDate: "07/01/2025",
    mileage: 52000,
    details: "Rotate tires and check pressure",
    vendor: "Tire Pros",
    projectedCost: "$30",
    actualCost: "$35",
    vendors: "Tire Pros, QuickFix Garage",
    metadata: '{"oilChange": false, "sparkPlugs": false, "brakes": false}',
    subtasks: '[]',
    status: "Scheduled"
  },
  {
    vehicleId: 2,
    description: "Battery Check",
    scheduledDate: "06/20/2025",
    mileage: 66000,
    details: "Test battery voltage and connections",
    vendor: "AutoFix Shop",
    projectedCost: "$20",
    actualCost: "$25",
    vendors: "AutoFix Shop, Battery Plus",
    metadata: '{"oilChange": false, "sparkPlugs": false, "brakes": false}',
    subtasks: '[]',
    status: "Scheduled"
  },
  {
    vehicleId: 2,
    description: "Brake Inspection",
    scheduledDate: "07/10/2025",
    mileage: 67000,
    details: "Inspect brake pads and rotors",
    vendor: "Brake Masters",
    projectedCost: "$150",
    actualCost: "$140",
    vendors: "Brake Masters, AutoFix Shop",
    metadata: '{"oilChange": false, "sparkPlugs": false, "brakes": true}',
    subtasks: '[]',
    status: "Scheduled"
  }
];

// Arrays to store reminders and to-do items
let recurringReminders = [];
let toDoItems = [];

// Determine status for a vehicle or service
function determineStatus(vehicleId, isService = false, service = null) {
  const vehicle = fleet.find(v => v.id === vehicleId);
  if (!vehicle) return 'status-grey';

  const relevantServices = isService 
    ? [service] 
    : scheduledServices.filter(s => s.vehicleId === vehicleId && s.status === "Scheduled");

  if (relevantServices.length === 0) return 'status-green'; // No scheduled services, all good

  let hasOverdue = false;
  let hasUpcoming = false;

  for (const svc of relevantServices) {
    const svcDate = new Date(svc.scheduledDate.split('/').reverse().join('-'));
    const daysDiff = (svcDate - currentDate) / (1000 * 60 * 60 * 24);
    const mileageDiff = svc.mileage - vehicle.mileage;

    // Overdue: Past the scheduled date or mileage exceeded
    if (svcDate < currentDate || mileageDiff < 0) {
      hasOverdue = true;
      break;
    }

    // Upcoming: Within 5 days or 500 miles
    if (daysDiff <= 5 || mileageDiff <= 500) {
      hasUpcoming = true;
    }
  }

  if (hasOverdue) return 'status-red';
  if (hasUpcoming) return 'status-grey';
  return 'status-green';
}

// Page navigation
function showPage(page, vehicle = null, service = null) {
  document.getElementById('welcomePage').classList.add('hidden');
  document.getElementById('homePage').classList.add('hidden');
  document.getElementById('mainPage').classList.add('hidden');
  document.getElementById('remindersPage').classList.add('hidden');
  document.getElementById(page + 'Page').classList.remove('hidden');
  if (page === 'home') {
    updateDashboard();
  } else if (page === 'main' && vehicle) {
    selectedVehicle = vehicle;
    document.getElementById('vehicleHeader').innerHTML = `
      <h2 class="text-base font-semibold text-gray-700">${vehicle.year} ${vehicle.make} ${vehicle.model}</h2>
      <p class="text-sm text-gray-700">VIN: ${vehicle.vin} | Mileage: ${vehicle.mileage}</p>
    `;
    document.getElementById('updateVehiclePhotoPreview').src = vehicle.photo;
    document.getElementById('updateVehicleMileage').value = vehicle.mileage;
    if (service) {
      populateTasksForService(service);
    } else {
      populateTasksForVehicle(vehicle.id);
    }
  } else if (page === 'reminders') {
    populateRemindersAndTodos();
  }
}

// Populate vehicle filter dropdown
function populateVehicleFilter() {
  const vehicleFilter = document.getElementById('vehicleFilter');
  vehicleFilter.innerHTML = '<option value="all">All Vehicles</option>';
  fleet.forEach(vehicle => {
    const option = document.createElement('option');
    option.value = vehicle.id;
    option.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    vehicleFilter.appendChild(option);
  });
}

// Filter services by selected vehicle
function filterServicesByVehicle() {
  const vehicleId = document.getElementById('vehicleFilter').value;
  if (vehicleId === 'all') {
    populateScheduledServices(scheduledServices);
  } else {
    const filteredServices = scheduledServices.filter(service => 
      service.vehicleId === parseInt(vehicleId) && 
      (service.status === "Scheduled" || service.status === "Completed")
    );
    populateScheduledServices(filteredServices);
  }
}

// Populate fleet tiles on homepage
function populateFleet() {
  const fleetList = document.getElementById('fleetList');
  fleetList.innerHTML = '';
  fleet.forEach(vehicle => {
    const tile = document.createElement('div');
    tile.className = 'fleet-tile';
    const statusClass = determineStatus(vehicle.id);
    tile.innerHTML = `
      <img src="${vehicle.photo}" alt="${vehicle.make} ${vehicle.model}">
      <div>
        <h3>${vehicle.make}</h3>
        <p>${vehicle.model}</p>
      </div>
      <div class="status-line-bottom ${statusClass}"></div>
    `;
    tile.onclick = () => showPage('main', vehicle);
    fleetList.appendChild(tile);
  });
  populateVehicleFilter();
}

// Populate scheduled services
function populateScheduledServices(servicesToShow = scheduledServices) {
  const servicesList = document.getElementById('scheduledServices');
  servicesList.innerHTML = '';
  servicesToShow.forEach(service => {
    const vehicle = fleet.find(v => v.id === service.vehicleId);
    if (!vehicle) return;
    const entry = document.createElement('div');
    entry.className = 'service-entry';
    const statusClass = determineStatus(vehicle.id, true, service);
    entry.innerHTML = `
      <div class="status-line-left ${statusClass}"></div>
      <div style="flex: 1; display: flex; justify-content: space-between; align-items: center;">
        <div class="service-details">
          <h4>${vehicle.year} ${vehicle.make} ${vehicle.model}</h4>
          <p>${service.description}</p>
        </div>
        <div class="service-meta">
          <div>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            ${service.scheduledDate}
          </div>
          <div>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ${service.mileage}
          </div>
        </div>
      </div>
    `;
    entry.onclick = () => showPage('main', vehicle, service);
    servicesList.appendChild(entry);
  });
}

// Sort scheduled services
function sortServices() {
  const sortBy = document.getElementById('sortServices').value;
  const vehicleId = document.getElementById('vehicleFilter').value;
  let servicesToSort = scheduledServices;
  if (vehicleId !== 'all') {
    servicesToSort = scheduledServices.filter(service => 
      service.vehicleId === parseInt(vehicleId) && 
      (service.status === "Scheduled" || service.status === "Completed")
    );
  }
  servicesToSort.sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.scheduledDate.split('/').reverse().join('-'));
      const dateB = new Date(b.scheduledDate.split('/').reverse().join('-'));
      return dateA - dateB;
    } else {
      return a.mileage - b.mileage;
    }
  });
  populateScheduledServices(servicesToSort);
}

// Populate tasks for a vehicle
function populateTasksForVehicle(vehicleId) {
  const tasks = scheduledServices.filter(service => service.vehicleId === vehicleId);
  const tbody = document.getElementById('taskTable');
  tbody.innerHTML = '';
  tasks.forEach(task => {
    const row = document.createElement('tr');
    row.onclick = () => showPopup(row);
    row.setAttribute('data-subtasks', task.subtasks);
    row.setAttribute('data-details', task.details);
    row.setAttribute('data-vendor', task.vendor);
    row.setAttribute('data-projected-cost', task.projectedCost);
    row.setAttribute('data-actual-cost', task.actualCost);
    row.setAttribute('data-vendors', task.vendors);
    row.setAttribute('data-metadata', task.metadata);
    let statusColor = 'bg-gray-500';
    if (task.status === 'In Progress') statusColor = 'bg-green-500';
    if (task.status === 'Completed') statusColor = 'bg-blue-500';
    row.innerHTML = `
      <td class="p-2 status-col"><span class="${statusColor} text-white px-2 py-1 rounded text-xs">${task.status}</span></td>
      <td class="p-2 subtasks-col"><button onclick="showSubtaskPopup(this.parentElement.parentElement, event)"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg></button></td>
      <td class="p-2 task-col">${task.description}</td>
      <td class="p-2 date-col">${task.scheduledDate}</td>
      <td class="p-2 mileage-col">${task.mileage}</td>
    `;
    tbody.appendChild(row);
  });
}

// Populate tasks for a specific service
function populateTasksForService(service) {
  const tbody = document.getElementById('taskTable');
  tbody.innerHTML = '';
  const row = document.createElement('tr');
  row.onclick = () => showPopup(row);
  row.setAttribute('data-subtasks', service.subtasks);
  row.setAttribute('data-details', service.details);
  row.setAttribute('data-vendor', service.vendor);
  row.setAttribute('data-projected-cost', service.projectedCost);
  row.setAttribute('data-actual-cost', service.actualCost);
  row.setAttribute('data-vendors', service.vendors);
  row.setAttribute('data-metadata', service.metadata);
  let statusColor = 'bg-gray-500';
  if (service.status === 'In Progress') statusColor = 'bg-green-500';
  if (service.status === 'Completed') statusColor = 'bg-blue-500';
  row.innerHTML = `
    <td class="p-2 status-col"><span class="${statusColor} text-white px-2 py-1 rounded text-xs">${service.status}</span></td>
    <td class="p-2 subtasks-col"><button onclick="showSubtaskPopup(this.parentElement.parentElement, event)"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg></button></td>
    <td class="p-2 task-col">${service.description}</td>
    <td class="p-2 date-col">${service.scheduledDate}</td>
    <td class="p-2 mileage-col">${service.mileage}</td>
  `;
  tbody.appendChild(row);
}

// Populate reminders and to-do lists
function populateRemindersAndTodos() {
  const remindersList = document.getElementById('remindersList');
  const todoList = document.getElementById('todoList');

  // Populate recurring reminders
  remindersList.innerHTML = recurringReminders.length ? recurringReminders.map(reminder => `
    <div class="reminder-item">
      <span>${reminder.name} (${reminder.frequency}, starts ${reminder.startDate})</span>
    </div>
  `).join('') : '<p>No recurring reminders yet.</p>';

  // Populate to-do items
  todoList.innerHTML = toDoItems.length ? toDoItems.map(todo => `
    <div class="todo-item">
      <span>${todo.task} (Due: ${todo.dueDate}, Priority: ${todo.priority})</span>
    </div>
  `).join('') : '<p>No to-do items yet.</p>';
}

// Add a new recurring reminder
function addReminder() {
  const name = document.getElementById('reminderName').value.trim();
  const frequency = document.getElementById('reminderFrequency').value;
  const startDate = document.getElementById('reminderStartDate').value;

  if (!name || !startDate) {
    alert('Please fill in all required fields (Reminder Name, Start Date).');
    return
