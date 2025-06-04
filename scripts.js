let selectedRow = null;
let photos = [];
let receipts = [];
let currentSubtaskRow = null;
let sortColumn = null;
let sortDirection = 'asc';
let selectedVehicle = null;
let currentDate = new Date('2025-06-04T08:31:00-07:00'); // 08:31 AM PDT on June 04, 2025
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

// Load reminders and to-do items from localStorage, or use defaults if not present
let recurringReminders = JSON.parse(localStorage.getItem('recurringReminders')) || [
  { name: "Pay HELOC", frequency: "annually", startDate: "2025-01-01", instructions: "", textMessageEnabled: false },
  { name: "Pay Water Bill", frequency: "annually", startDate: "2025-02-01", instructions: "", textMessageEnabled: false },
  { name: "Notify Tenants of Rent Renewal", frequency: "annually", startDate: "2025-03-01", instructions: "", textMessageEnabled: false },
  { name: "Renew Insurance Policy", frequency: "annually", startDate: "2025-04-01", instructions: "", textMessageEnabled: false },
  { name: "Schedule Annual Maintenance", frequency: "annually", startDate: "2025-05-01", instructions: "", textMessageEnabled: false }
];

let toDoItems = JSON.parse(localStorage.getItem('toDoItems')) || [
  { task: "Install Wall Safes", dueDate: "2025-06-10", priority: "high", instructions: "", textMessageEnabled: false, completed: false },
  { task: "Install Security Cameras", dueDate: "2025-06-15", priority: "high", instructions: "", textMessageEnabled: false, completed: false },
  { task: "Book Split Hotel", dueDate: "2025-06-20", priority: "medium", instructions: "", textMessageEnabled: false, completed: false },
  { task: "Return Amplifier", dueDate: "2025-06-25", priority: "low", instructions: "", textMessageEnabled: false, completed: false },
  { task: "Schedule Dentist Appointment", dueDate: "2025-06-30", priority: "medium", instructions: "", textMessageEnabled: false, completed: false }
];

// Save to localStorage whenever data changes
function saveData() {
  localStorage.setItem('recurringReminders', JSON.stringify(recurringReminders));
  localStorage.setItem('toDoItems', JSON.stringify(toDoItems));
}

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

// Update top navigation bar based on the current page
function updateTopNav(page) {
  const topNavTitle = document.getElementById('topNavTitle');
  const topNavLinks = document.getElementById('topNavLinks');
  topNavLinks.innerHTML = '';

  if (page === 'welcome') {
    topNavTitle.textContent = 'Welcome to Car Maintenance Tracker';
    // No sub-sections for Welcome page
  } else if (page === 'home') {
    topNavTitle.textContent = 'Car Maintenance Tracker';
    const subSections = [
      { id: 'fleet', label: 'My Fleet' },
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'services', label: 'Scheduled Services' }
    ];
    subSections.forEach(section => {
      const btn = document.createElement('button');
      btn.textContent = section.label;
      btn.addEventListener('click', () => {
        // Scroll to the section
        document.getElementById(section.id + 'List')?.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('dashboardTiles')?.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('scheduledServices')?.scrollIntoView({ behavior: 'smooth' });
        // Update active state
        topNavLinks.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      topNavLinks.appendChild(btn);
    });
    // Set "My Fleet" as active by default
    topNavLinks.querySelector('button').classList.add('active');
  } else if (page === 'reminders') {
    topNavTitle.textContent = 'Reminders and To-Do';
    const subSections = [
      { id: 'todo', label: "To-Do's" },
      { id: 'add-todo', label: 'Add To-Do' },
      { id: 'reminders', label: 'Add Recurring Reminders' }
    ];
    subSections.forEach(section => {
      const btn = document.createElement('button');
      btn.textContent = section.label;
      btn.addEventListener('click', () => {
        showRemindersSubSection(section.id);
        topNavLinks.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      topNavLinks.appendChild(btn);
    });
    // Set "To-Do's" as active by default
    topNavLinks.querySelector('button').classList.add('active');
  } else if (page === 'main') {
    topNavTitle.textContent = selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : 'Home Maintenance Tracker';
    const subSections = [
      { id: 'update-vehicle', label: 'Update Vehicle' },
      { id: 'add-service', label: 'Add Service' },
      { id: 'task-table', label: 'Tasks' }
    ];
    subSections.forEach(section => {
      const btn = document.createElement('button');
      btn.textContent = section.label;
      btn.addEventListener('click', () => {
        if (section.id === 'add-service') {
          showAddServicePopup();
        } else {
          document.querySelector(`.update-vehicle`)?.scrollIntoView({ behavior: 'smooth' });
          document.getElementById('taskTable')?.scrollIntoView({ behavior: 'smooth' });
        }
        topNavLinks.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      topNavLinks.appendChild(btn);
    });
    // Set "Update Vehicle" as active by default
    topNavLinks.querySelector('button').classList.add('active');
  }
}

// Show specific sub-section on the Reminders page
function showRemindersSubSection(sectionId) {
  const todoSection = document.getElementById('todoSection');
  const addTodoSection = document.getElementById('addTodoSection');
  const remindersSection = document.getElementById('remindersSection');

  todoSection.classList.add('hidden');
  addTodoSection.classList.add('hidden');
  remindersSection.classList.add('hidden');

  if (sectionId === 'todo') {
    todoSection.classList.remove('hidden');
  } else if (sectionId === 'add-todo') {
    addTodoSection.classList.remove('hidden');
  } else if (sectionId === 'reminders') {
    remindersSection.classList.remove('hidden');
  }
}

// Page navigation
function showPage(page, vehicle = null, service = null) {
  document.getElementById('welcomePage').classList.add('hidden');
  document.getElementById('homePage').classList.add('hidden');
  document.getElementById('mainPage').classList.add('hidden');
  document.getElementById('remindersPage').classList.add('hidden');
  document.getElementById(page + 'Page').classList.remove('hidden');

  // Update top navigation bar
  updateTopNav(page);

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
    // Show "To-Do's" by default
    showRemindersSubSection('todo');
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
    tile.addEventListener('click', () => showPage('main', vehicle));
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
    entry.addEventListener('click', () => showPage('main', vehicle, service));
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
      <td class="p-2 subtasks-col"><button class="subtaskBtn"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg></button></td>
      <td class="p-2 task-col">${task.description}</td>
      <td class="p-2 date-col">${task.scheduledDate}</td>
      <td class="p-2 mileage-col">${task.mileage}</td>
    `;
    row.addEventListener('click', () => showPopup(row));
    row.querySelector('.subtaskBtn').addEventListener('click', (event) => showSubtaskPopup(row, event));
    tbody.appendChild(row);
  });
}

// Populate tasks for a specific service
function populateTasksForService(service) {
  const tbody = document.getElementById('taskTable');
  tbody.innerHTML = '';
  const row = document.createElement('tr');
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
    <td class="p-2 subtasks-col"><button class="subtaskBtn"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg></button></td>
    <td class="p-2 task-col">${service.description}</td>
    <td class="p-2 date-col">${service.scheduledDate}</td>
    <td class="p-2 mileage-col">${service.mileage}</td>
  `;
  row.addEventListener('click', () => showPopup(row));
  row.querySelector('.subtaskBtn').addEventListener('click', (event) => showSubtaskPopup(row, event));
  tbody.appendChild(row);
}

// Populate reminders and to-do lists
function populateRemindersAndTodos() {
  const remindersList = document.getElementById('remindersList');
  const todoList = document.getElementById('todoList');

  // Populate recurring reminders
  remindersList.innerHTML = recurringReminders.length ? recurringReminders.map((reminder, index) => `
    <div class="reminder-item">
      <span class="reminder-details" data-index="${index}">
        <span class="name">${reminder.name}</span>
        <span class="frequency">${reminder.frequency}</span>
      </span>
      <div class="actions">
        <button class="edit-btn edit-reminder-btn" data-index="${index}">Edit</button>
        <button class="delete-btn delete-reminder-btn" data-index="${index}">Delete</button>
      </div>
    </div>
  `).join('') : '<p class="text-gray-500 italic">No recurring reminders yet.</p>';

  // Populate to-do items
  todoList.innerHTML = toDoItems.length ? toDoItems.map((todo, index) => `
    <div class="todo-item ${todo.completed ? 'completed' : ''}">
      <span class="todo-details" data-index="${index}">
        <span class="task">${todo.task}</span>
        <span class="due-date">${todo.dueDate}</span>
        <span class="priority">${todo.priority}</span>
      </span>
      <div class="actions">
        <button class="complete-btn ${todo.completed ? 'completed' : ''}" data-index="${index}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          ${todo.completed ? 'Undo' : 'Done'}
        </button>
        <button class="edit-btn edit-todo-btn" data-index="${index}">Edit</button>
        <button class="delete-btn delete-todo-btn" data-index="${index}">Delete</button>
      </div>
    </div>
  `).join('') : '<p class="text-gray-500 italic">No to-do items yet.</p>';

  // Add event listeners for details, edit, delete, and complete toggles
  document.querySelectorAll('.reminder-details').forEach(item => {
    item.addEventListener('click', () => showReminderDetails(parseInt(item.dataset.index)));
  });
  document.querySelectorAll('.todo-details').forEach(item => {
    item.addEventListener('click', () => showTodoDetails(parseInt(item.dataset.index)));
  });
  document.querySelectorAll('.edit-reminder-btn').forEach(btn => {
    btn.addEventListener('click', () => showReminderDetails(parseInt(btn.dataset.index), true));
  });
  document.querySelectorAll('.edit-todo-btn').forEach(btn => {
    btn.addEventListener('click', () => showTodoDetails(parseInt(btn.dataset.index), true));
  });
  document.querySelectorAll('.delete-reminder-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteReminder(parseInt(btn.dataset.index)));
  });
  document.querySelectorAll('.delete-todo-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteTodo(parseInt(btn.dataset.index)));
  });
  document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleTodoComplete(parseInt(btn.dataset.index)));
  });
}

// Show Reminder Details/Edit Popup
function showReminderDetails(index, editMode = false) {
  const reminder = recurringReminders[index];
  const popup = document.getElementById('reminderDetailsPopup');
  const title = document.getElementById('reminderDetailsTitle');
  const content = document.getElementById('reminderDetailsContent');
  const editFields = document.getElementById('reminderEditFields');
  const editBtn = document.getElementById('editReminderBtn');
  const saveBtn = document.getElementById('saveReminderBtn');

  title.textContent = editMode ? 'Edit Reminder' : 'Reminder Details';

  if (editMode) {
    document.getElementById('editReminderName').value = reminder.name;
    document.getElementById('editReminderFrequency').value = reminder.frequency;
    document.getElementById('editReminderStartDate').value = reminder.startDate;
    document.getElementById('editReminderInstructions').value = reminder.instructions || '';
    document.getElementById('editReminderTextMessage').checked = reminder.textMessageEnabled || false;
    content.classList.add('hidden');
    editFields.classList.remove('hidden');
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
    saveBtn.dataset.index = index;
  } else {
    content.innerHTML = `
      <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${reminder.name}</span></div>
      <div class="detail-row"><span class="detail-label">Frequency</span><span class="detail-value">${reminder.frequency}</span></div>
      <div class="detail-row"><span class="detail-label">Start Date</span><span class="detail-value">${reminder.startDate}</span></div>
      <div class="detail-row"><span class="detail-label">Instructions</span><span class="detail-value">${reminder.instructions || 'None'}</span></div>
      <div class="detail-row"><span class="detail-label">Text Message</span><span class="detail-value">${reminder.textMessageEnabled ? 'Enabled' : 'Disabled'}</span></div>
    `;
    content.classList.remove('hidden');
    editFields.classList.add('hidden');
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    editBtn.dataset.index = index;
  }

  popup.classList.remove('hidden');
  popup.classList.add('show');
}

// Show To-Do Details/Edit Popup
function showTodoDetails(index, editMode = false) {
  const todo = toDoItems[index];
  const popup = document.getElementById('todoDetailsPopup');
  const title = document.getElementById('todoDetailsTitle');
  const content = document.getElementById('todoDetailsContent');
  const editFields = document.getElementById('todoEditFields');
  const editBtn = document.getElementById('editTodoBtn');
  const saveBtn = document.getElementById('saveTodoBtn');

  title.textContent = editMode ? 'Edit To-Do' : 'To-Do Details';

  if (editMode) {
    document.getElementById('editTodoTask').value = todo.task;
    document.getElementById('editTodoDueDate').value = todo.dueDate;
    document.getElementById('editTodoPriority').value = todo.priority;
    document.getElementById('editTodoInstructions').value = todo.instructions || '';
    document.getElementById('editTodoTextMessage').checked = todo.textMessageEnabled || false;
    content.classList.add('hidden');
    editFields.classList.remove('hidden');
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
    saveBtn.dataset.index = index;
  } else {
    content.innerHTML = `
      <div class="detail-row"><span class="detail-label">Task</span><span class="detail-value">${todo.task}</span></div>
      <div class="detail-row"><span class="detail-label">Due Date</span><span class="detail-value">${todo.dueDate}</span></div>
      <div class="detail-row"><span class="detail-label">Priority</span><span class="detail-value">${todo.priority}</span></div>
      <div class="detail-row"><span class="detail-label">Instructions</span><span class="detail-value">${todo.instructions || 'None'}</span></div>
      <div class="detail-row"><span class="detail-label">Text Message</span><span class="detail-value">${todo.textMessageEnabled ? 'Enabled' : 'Disabled'}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${todo.completed ? 'Completed' : 'Pending'}</span></div>
    `;
    content.classList.remove('hidden');
    editFields.classList.add('hidden');
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    editBtn.dataset.index = index;
  }

  popup.classList.remove('hidden');
  popup.classList.add('show');
}

// Add a new recurring reminder
function addReminder() {
  const name = document.getElementById('reminderName').value.trim();
  const frequency = document.getElementById('reminderFrequency').value;
  const startDate = document.getElementById('reminderStartDate').value;
  const instructions = document.getElementById('reminderInstructions').value.trim();
  const textMessageEnabled = document.getElementById('reminderTextMessage').checked;

  if (!name || !startDate) {
    alert('Please fill in all required fields (Reminder Name, Start Date).');
    return;
  }

  recurringReminders.push({
    name: name,
    frequency: frequency,
    startDate: startDate,
    instructions: instructions,
    textMessageEnabled: textMessageEnabled
  });

  document.getElementById('reminderName').value = '';
  document.getElementById('reminderFrequency').value = 'daily';
  document.getElementById('reminderStartDate').value = '';
  document.getElementById('reminderInstructions').value = '';
  document.getElementById('reminderTextMessage').checked = false;
  saveData();
  populateRemindersAndTodos();
  // Switch back to To-Do's view after adding
  showRemindersSubSection('todo');
  document.getElementById('topNavLinks').querySelector('button').classList.add('active');
}

// Add a new to-do item
function addTodo() {
  const task = document.getElementById('todoTask').value.trim();
  const dueDate = document.getElementById('todoDueDate').value;
  const priority = document.getElementById('todoPriority').value;
  const instructions = document.getElementById('todoInstructions').value.trim();
  const textMessageEnabled = document.getElementById('todoTextMessage').checked;

  if (!task || !dueDate) {
    alert('Please fill in all required fields (Task Name, Due Date).');
    return;
  }

  toDoItems.push({
    task: task,
    dueDate: dueDate,
    priority: priority,
    instructions: instructions,
    textMessageEnabled: textMessageEnabled,
    completed: false
  });

  document.getElementById('todoTask').value = '';
  document.getElementById('todoDueDate').value = '';
  document.getElementById('todoPriority').value = 'low';
  document.getElementById('todoInstructions').value = '';
  document.getElementById('todoTextMessage').checked = false;
  saveData();
  populateRemindersAndTodos();
  // Switch back to To-Do's view after adding
  showRemindersSubSection('todo');
  document.getElementById('topNavLinks').querySelector('button').classList.add('active');
}

// Delete a reminder
function deleteReminder(index) {
  if (confirm('Are you sure you want to delete this reminder?')) {
    recurringReminders.splice(index, 1);
    saveData();
    populateRemindersAndTodos();
  }
}

// Delete a to-do item
function deleteTodo(index) {
  if (confirm('Are you sure you want to delete this to-do item?')) {
    toDoItems.splice(index, 1);
    saveData();
    populateRemindersAndTodos();
  }
}

// Toggle completion for a to-do item
function toggleTodoComplete(index) {
  toDoItems[index].completed = !toDoItems[index].completed;
  saveData();
  populateRemindersAndTodos();
}

// Save edited reminder
function saveEditedReminder(index) {
  const name = document.getElementById('editReminderName').value.trim();
  const frequency = document.getElementById('editReminderFrequency').value;
  const startDate = document.getElementById('editReminderStartDate').value;
  const instructions = document.getElementById('editReminderInstructions').value.trim();
  const textMessageEnabled = document.getElementById('editReminderTextMessage').checked;

  if (!name || !startDate) {
    alert('Please fill in all required fields (Reminder Name, Start Date).');
    return;
  }

  recurringReminders[index] = {
    name: name,
    frequency: frequency,
    startDate: startDate,
    instructions: instructions,
    textMessageEnabled: textMessageEnabled
  };

  saveData();
  closeReminderDetailsPopup();
  populateRemindersAndTodos();
}

// Save edited to-do item
function saveEditedTodo(index) {
  const task = document.getElementById('editTodoTask').value.trim();
  const dueDate = document.getElementById('editTodoDueDate').value;
  const priority = document.getElementById('editTodoPriority').value;
  const instructions = document.getElementById('editTodoInstructions').value.trim();
  const textMessageEnabled = document.getElementById('editTodoTextMessage').checked;
  const completed = toDoItems[index].completed; // Preserve the completed status

  if (!task || !dueDate) {
    alert('Please fill in all required fields (Task Name, Due Date).');
    return;
  }

  toDoItems[index] = {
    task: task,
    dueDate: dueDate,
    priority: priority,
    instructions: instructions,
    textMessageEnabled: textMessageEnabled,
    completed: completed
  };

  saveData();
  closeTodoDetailsPopup();
  populateRemindersAndTodos();
}

// Close Reminder Details Popup
function closeReminderDetailsPopup() {
  const popup = document.getElementById('reminderDetailsPopup');
  popup.classList.remove('show');
  setTimeout(() => popup.classList.add('hidden'), 300);
}

// Close To-Do Details Popup
function closeTodoDetailsPopup() {
  const popup = document.getElementById('todoDetailsPopup');
  popup.classList.remove('show');
  setTimeout(() => popup.classList.add('hidden'), 300);
}

// Show Add Vehicle Popup
function showAddVehiclePopup() {
  document.getElementById('vehiclePhoto').value = '';
  document.getElementById('vehiclePhotoPreview').classList.add('hidden');
  document.getElementById('vehicleMake').value = '';
  document.getElementById('vehicleModel').value = '';
  document.getElementById('vehicleMileage').value = '';
  document.getElementById('vehicleVIN').value = '';
  const popup = document.getElementById('addVehiclePopup');
  popup.classList.remove('hidden');
  popup.classList.add('show');
}

// Preview Vehicle Photo
function previewVehiclePhoto(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('vehiclePhotoPreview');
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
}

// Save Vehicle
function saveVehicle() {
  const photo = document.getElementById('vehiclePhotoPreview').src || 'https://via.placeholder.com/200x150?text=Vehicle';
  const make = document.getElementById('vehicleMake').value.trim();
  const model = document.getElementById('vehicleModel').value.trim();
  const mileage = parseInt(document.getElementById('vehicleMileage').value.trim());
  const vin = document.getElementById('vehicleVIN').value.trim();

  if (!make || !model || isNaN(mileage) || !vin) {
    alert('Please fill in all fields.');
    return;
  }

  const vehicle = {
    id: fleet.length + 1,
    photo: photo,
    make: make,
    model: model,
    year: new Date().getFullYear(),
    mileage: mileage,
    vin: vin
  };

  fleet.push(vehicle);
  populateFleet();
  closeAddVehiclePopup();
}

// Close Add Vehicle Popup
function closeAddVehiclePopup() {
  const popup = document.getElementById('addVehiclePopup');
  popup.classList.remove('show');
  setTimeout(() => popup.classList.add('hidden'), 300);
}

// Preview Updated Vehicle Photo
function previewUpdateVehiclePhoto(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('updateVehiclePhotoPreview');
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Update Vehicle Details
function updateVehicleDetails() {
  const newPhoto = document.getElementById('updateVehiclePhotoPreview').src;
  const newMileage = parseInt(document.getElementById('updateVehicleMileage').value.trim());

  if (isNaN(newMileage)) {
    alert('Please enter a valid mileage.');
    return;
  }

  const vehicleIndex = fleet.findIndex(v => v.id === selectedVehicle.id);
  if (vehicleIndex !== -1) {
    fleet[vehicleIndex] = {
      ...fleet[vehicleIndex],
      photo: newPhoto,
      mileage: newMileage
    };
    selectedVehicle = fleet[vehicleIndex];
    document.getElementById('vehicleHeader').innerHTML = `
      <h2 class="text-base font-semibold text-gray-700">${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}</h2>
      <p class="text-sm text-gray-700">VIN: ${selectedVehicle.vin} | Mileage: ${selectedVehicle.mileage}</p>
    `;
    populateFleet();
    populateScheduledServices();
  }
}

// Show Add Service Popup
function showAddServicePopup() {
  document.getElementById('newServiceDescription').value = '';
  document.getElementById('newServiceDate').value = '';
  document.getElementById('newServiceMileage').value = '';
  document.getElementById('newServiceDetails').value = '';
  document.getElementById('newServiceVendor').value = '';
  document.getElementById('newServiceProjectedCost').value = '';
  document.getElementById('newServiceActualCost').value = '';
  document.getElementById('newServiceVendors').value = '';
  document.getElementById('newServiceOilChange').checked = false;
  document.getElementById('newServiceSparkPlugs').checked = false;
  document.getElementById('newServiceBrakes').checked = false;
  document.getElementById('newServiceStatus').value = 'Scheduled';
  const popup = document.getElementById('addServicePopup');
  popup.classList.remove('hidden');
  popup.classList.add('show');
}

// Save New Service
function saveNewService() {
  const description = document.getElementById('newServiceDescription').value.trim();
  const scheduledDate = document.getElementById('newServiceDate').value.trim();
  const mileage = parseInt(document.getElementById('newServiceMileage').value.trim());
  const details = document.getElementById('newServiceDetails').value.trim();
  const vendor = document.getElementById('newServiceVendor').value.trim();
  const projectedCost = document.getElementById('newServiceProjectedCost').value.trim();
  const actualCost = document.getElementById('newServiceActualCost').value.trim();
  const vendors = document.getElementById('newServiceVendors').value.trim();
  const metadata = {
    oilChange: document.getElementById('newServiceOilChange').checked,
    sparkPlugs: document.getElementById('newServiceSparkPlugs').checked,
    brakes: document.getElementById('newServiceBrakes').checked
  };
  const status = document.getElementById('newServiceStatus').value;

  if (!description || !scheduledDate || isNaN(mileage)) {
    alert('Please fill in all required fields (Description, Scheduled Date, Mileage).');
    return;
  }

  const newService = {
    vehicleId: selectedVehicle.id,
    description: description,
    scheduledDate: scheduledDate,
    mileage: mileage,
    details: details || "No details provided",
    vendor: vendor || "Not specified",
    projectedCost: projectedCost || "Not specified",
    actualCost: actualCost || "Not specified",
    vendors: vendors || "Not specified",
    metadata: JSON.stringify(metadata),
    subtasks: '[]',
    status: status
  };

  scheduledServices.push(newService);
  populateTasksForVehicle(selectedVehicle.id);
  populateScheduledServices();
  populateFleet();
  updateDashboard();
  closeAddServicePopup();
}

// Close Add Service Popup
function closeAddServicePopup() {
  const popup = document.getElementById('addServicePopup');
  popup.classList.remove('show');
  setTimeout(() => popup.classList.add('hidden'), 300);
}

// Update dashboard counts
function updateDashboard() {
  let scheduledCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;

  scheduledServices.forEach(service => {
    if (service.status === 'Scheduled') scheduledCount++;
    if (service.status === 'In Progress') inProgressCount++;
    if (service.status === 'Completed') completedCount++;
  });

  document.getElementById('scheduledCount').textContent = scheduledCount;
  document.getElementById('inProgressCount').textContent = inProgressCount;
  document.getElementById('completedCount').textContent = completedCount;
}

// Toggle filter dropdown
function toggleFilterDropdown() {
  if (document.getElementById('mainPage').classList.contains('hidden')) {
    return;
  }

  const dropdown = document.getElementById('filterDropdown');
  const button = document.getElementById('filterBtn');

  if (dropdown && button) {
    dropdown.classList.toggle('hidden');
    dropdown.classList.toggle('show');
    button.classList.toggle('active');
  }
}

// Combined filter and search
function filterAndSearch() {
  const searchInput = document.getElementById('searchInput');
  const checkboxes = document.querySelectorAll('#filterDropdown input[type="checkbox"]');

  if (!searchInput || !checkboxes) return;

  const searchValue = searchInput.value.toLowerCase();
  const selectedStatuses = Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  const rows = Array.from(document.querySelectorAll('#taskTable tr'));
  const filteredRows = rows.filter(row => {
    const task = row.cells[2].textContent.toLowerCase();
    const status = row.cells[0].textContent;
    const matchesSearch = task.includes(searchValue);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(status);
    return matchesSearch && matchesStatus;
  });

  if (sortColumn !== null) {
    const columnIndex = { 'status': 0, 'task': 2, 'serviceDate': 3, 'mileage': 4 }[sortColumn];
    filteredRows.sort((a, b) => compareRows(a, b, columnIndex, sortColumn));
  }

  const tbody = document.getElementById('taskTable');
  tbody.innerHTML = '';
  filteredRows.forEach(row => tbody.appendChild(row));

  filteredRows.forEach(row => row.style.display = '');
}

// Sort table
function sortTable(columnIndex, columnType) {
  const headers = document.querySelectorAll('thead th');
  headers.forEach(header => {
    header.classList.remove('asc', 'desc');
    const svg = header.querySelector('.sort-arrow');
    if (svg) svg.style.transform = 'rotate(0deg)';
  });

  if (sortColumn === columnType) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = columnType;
    sortDirection = 'asc';
  }

  const header = headers[columnIndex];
  header.classList.add(sortDirection);
  const svg = header.querySelector('.sort-arrow');
  if (svg) svg.style.transform = sortDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)';

  const rows = Array.from(document.querySelectorAll('#taskTable tr'));
  const sortedRows = rows.sort((a, b) => compareRows(a, b, columnIndex, columnType));

  const tbody = document.getElementById('taskTable');
  tbody.innerHTML = '';
  sortedRows.forEach(row => tbody.appendChild(row));

  filterAndSearch();
}

function compareRows(a, b, columnIndex, columnType) {
  let aValue = a.cells[columnIndex].textContent.trim();
  let bValue = b.cells[columnIndex].textContent.trim();

  if (columnType === 'status') {
    const statusOrder = { 'Scheduled': 1, 'In Progress': 2, 'Completed': 3 };
    aValue = statusOrder[aValue] || 0;
    bValue = statusOrder[bValue] || 0;
  } else if (columnType === 'serviceDate') {
    aValue = new Date(aValue.split('/').reverse().join('-'));
    bValue = new Date(bValue.split('/').reverse().join('-'));
  } else if (columnType === 'mileage') {
    aValue = parseInt(aValue.replace(/,/g, ''), 10);
    bValue = parseInt(bValue.replace(/,/g, ''), 10);
  }

  if (sortDirection === 'asc') {
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
  } else {
    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
  }
}

// Task Details Popup
function showPopup(row) {
  selectedRow = row;
  const popup = document.getElementById('popup');
  const popupContent = document.getElementById('popupContent');
  const cells = row.cells;
  const details = row.getAttribute('data-details') || '';
  const vendor = row.getAttribute('data-vendor') || '';
  const projectedCost = row.getAttribute('data-projected-cost') || '';
  const actualCost = row.getAttribute('data-actual-cost') || '';
  const vendors = row.getAttribute('data-vendors') || '';
  const metadata = JSON.parse(row.getAttribute('data-metadata') || '{}');

  popupContent.innerHTML = `
    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${cells[0].textContent}</span></div>
    <div class="detail-row"><span class="detail-label">Task</span><span class="detail-value">${cells[2].textContent}</span></div>
    <div class="detail-row"><span class="detail-label">Service Date</span><span class="detail-value">${cells[3].textContent}</span></div>
    <div class="detail-row"><span class="detail-label">Mileage</span><span class="detail-value">${cells[4].textContent}</span></div>
    <div class="detail-row"><span class="detail-label">Details</span><span class="detail-value">${details}</span></div>
    <div class="detail-row"><span class="detail-label">Vendor</span><span class="detail-value">${vendor}</span></div>
    <div class="detail-row"><span class="detail-label">Projected Cost</span><span class="detail-value">${projectedCost}</span></div>
    <div class="detail-row"><span class="detail-label">Actual Cost</span><span class="detail-value">${actualCost}</span></div>
    <div class="detail-row"><span class="detail-label">Vendors</span><span class="detail-value">${vendors}</span></div>
    <div class="detail-row"><span class="detail-label">Oil Change</span><span class="detail-value">${metadata.oilChange ? 'Yes' : 'No'}</span></div>
    <div class="detail-row"><span class="detail-label">Spark Plugs</span><span class="detail-value">${metadata.sparkPlugs ? 'Yes' : 'No'}</span></div>
    <div class="detail-row"><span class="detail-label">Brakes</span><span class="detail-value">${metadata.brakes ? 'Yes' : 'No'}</span></div>
  `;

  document.getElementById('editBtn').classList.remove('hidden');
  document.getElementById('saveBtn').classList.add('hidden');
  document.getElementById('editFields').classList.add('hidden');
  popupContent.classList.remove('hidden');
  popup.classList.remove('hidden');
  popup.classList.add('show');
}

function editDetails() {
  const cells = selectedRow.cells;
  const editFields = document.getElementById('editFields');
  const details = selectedRow.getAttribute('data-details') || '';
  const vendor = selectedRow.getAttribute('data-vendor') || '';
  const projectedCost = selectedRow.getAttribute('data-projected-cost') || '';
  const actualCost = selectedRow.getAttribute('data-actual-cost') || '';
  const vendors = selectedRow.getAttribute('data-vendors') || '';
  const metadata = JSON.parse(selectedRow.getAttribute('data-metadata') || '{}');

  editFields.innerHTML = `
    <div class="edit-field"><label>Status</label><input id="editStatus" type="text" class="text-sm" value="${cells[0].textContent}"></div>
    <div class="edit-field"><label>Task</label><input id="editTask" type="text" class="text-sm" value="${cells[2].textContent}"></div>
    <div class="edit-field"><label>Service Date</label><input id="editServiceDate" type="text" class="text-sm" value="${cells[3].textContent}"></div>
    <div class="edit-field"><label>Mileage</label><input id="editMileage" type="text" class="text-sm" value="${cells[4].textContent}"></div>
    <div class="edit-field"><label>Details</label><input id="editDetails" type="text" class="text-sm" value="${details}"></div>
    <div class="edit-field"><label>Vendor</label><input id="editVendor" type="text" class="text-sm" value="${vendor}"></div>
    <div class="edit-field"><label>Projected Cost</label><input id="editProjectedCost" type="text" class="text-sm" value="${projectedCost}"></div>
    <div class="edit-field"><label>Actual Cost</label><input id="editActualCost" type="text" class="text-sm" value="${actualCost}"></div>
    <div class="edit-field"><label>Vendors</label><input id="editVendors" type="text" class="text-sm" value="${vendors}"></div>
    <div class="edit-field"><label>Oil Change</label><input id="editOilChange" type="checkbox" ${metadata.oilChange ? 'checked' : ''}></div>
    <div class="edit-field"><label>Spark Plugs</label><input id="editSparkPlugs" type="checkbox" ${metadata.sparkPlugs ? 'checked' : ''}></div>
    <div class="edit-field"><label>Brakes</label><input id="editBrakes" type="checkbox" ${metadata.brakes ? 'checked' : ''}></div>
  `;

  document.getElementById('popupContent').classList.add('hidden');
  document.getElementById('editFields').classList.remove('hidden');
  document.getElementById('saveBtn').classList.remove('hidden');
}

function saveEdits() {
  const cells = selectedRow.cells;
  const newStatus = document.getElementById('editStatus').value;
  const newTask = document.getElementById('editTask').value;
  const newServiceDate = document.getElementById('editServiceDate').value;
  const newMileage = document.getElementById('editMileage').value;
  const newDetails = document.getElementById('editDetails').value;
  const newVendor = document.getElementById('editVendor').value;
  const newProjectedCost = document.getElementById('editProjectedCost').value;
  const newActualCost = document.getElementById('editActualCost').value;
  const newVendors = document.getElementById('editVendors').value;
  const newMetadata = {
    oilChange: document.getElementById('editOilChange').checked,
    sparkPlugs: document.getElementById('editSparkPlugs').checked,
    brakes: document.getElementById('editBrakes').checked
  };

  let statusColor = 'bg-gray-500';
  if (newStatus === 'In Progress') statusColor = 'bg-green-500';
  if (newStatus === 'Completed') statusColor = 'bg-blue-500';

  cells[0].innerHTML = `<span class="${statusColor} text-white px-2 py-1 rounded text-xs">${newStatus}</span>`;
  cells[2].textContent = newTask;
  cells[3].textContent = newServiceDate;
  cells[4].textContent = newMileage;
  selectedRow.setAttribute('data-details', newDetails);
  selectedRow.setAttribute('data-vendor', newVendor);
  selectedRow.setAttribute('data-projected-cost', newProjectedCost);
  selectedRow.setAttribute('data-actual-cost', newActualCost);
  selectedRow.setAttribute('data-vendors', newVendors);
  selectedRow.setAttribute('data-metadata', JSON.stringify(newMetadata));

  // Update the scheduledServices array if this task is part of it
  const serviceIndex = scheduledServices.findIndex(service => 
    service.vehicleId === selectedVehicle.id && 
    service.description === cells[2].textContent &&
    service.scheduledDate === cells[3].textContent
  );
  if (serviceIndex !== -1) {
    scheduledServices[serviceIndex] = {
      ...scheduledServices[serviceIndex],
      status: newStatus,
      description: newTask,
      scheduledDate: newServiceDate,
      mileage: parseInt(newMileage.replace(/,/g, ''), 10),
      details: newDetails,
      vendor: newVendor,
      projectedCost: newProjectedCost,
      actualCost: newActualCost,
      vendors: newVendors,
      metadata: JSON.stringify(newMetadata)
    };
    populateScheduledServices();
    populateFleet();
    updateDashboard();
  }

  showPopup(selectedRow);
}

function closePopup() {
  const popup = document.getElementById('popup');
  popup.classList.remove('show');
  setTimeout(() => popup.classList.add('hidden'), 300);
}

// Subtask Popup
function showSubtaskPopup(row, event) {
  event.stopPropagation();
  currentSubtaskRow = row;
  const subtaskPopup = document.getElementById('subtaskPopup');
  const subtaskList = document.getElementById('subtaskList');
  const subtasks = JSON.parse(row.getAttribute('data-subtasks') || '[]');

  subtaskList.innerHTML = subtasks.length ? subtasks.map((subtask, index) => `
    <div class="subtask-row ${subtask.completed ? 'completed' : ''}">
      <span>${subtask.name}</span>
      <div>
        <button class="text-green-500 mr-2" onclick="toggleSubtask(${index})">${subtask.completed ? 'Undo' : 'Complete'}</button>
        <button class="text-red-500" onclick="deleteSubtask(${index})">Delete</button>
      </div>
    </div>
  `).join('') : '<p>No subtasks yet.</p>';

  subtaskPopup.classList.remove('hidden');
  subtaskPopup.classList.add('show');
}

function addSubtask() {
  const input = document.getElementById('newSubtaskInput');
  const subtaskName = input.value.trim();
  if (!subtaskName) return;

  const subtasks = JSON.parse(currentSubtaskRow.getAttribute('data-subtasks') || '[]');
  subtasks.push({ name: subtaskName, completed: false });
  currentSubtaskRow.setAttribute('data-subtasks', JSON.stringify(subtasks));
  input.value = '';
  showSubtaskPopup(currentSubtaskRow, { stopPropagation: () => {} });
}

function toggleSubtask(index) {
  const subtasks = JSON.parse(currentSubtaskRow.getAttribute('data-subtasks') || '[]');
  subtasks[index].completed = !subtasks[index].completed;
  currentSubtaskRow.setAttribute('data-subtasks', JSON.stringify(subtasks));
  showSubtaskPopup(currentSubtaskRow, { stopPropagation: () => {} });
}

function deleteSubtask(index) {
  const subtasks = JSON.parse(currentSubtaskRow.getAttribute('data-subtasks') || '[]');
  subtasks.splice(index, 1);
  currentSubtaskRow.setAttribute('data-subtasks', JSON.stringify(subtasks));
  showSubtaskPopup(currentSubtaskRow, { stopPropagation: () => {} });
}

function closeSubtaskPopup() {
  const subtaskPopup = document.getElementById('subtaskPopup');
  subtaskPopup.classList.remove('show');
  setTimeout(() => subtaskPopup.classList.add('hidden'), 300);
}

// Initialize the page
showPage('home');
populateFleet();
populateScheduledServices();

// Set up event listeners
document.getElementById('welcomeBtn').addEventListener('click', () => showPage('welcome'));
document.getElementById('homeBtn').addEventListener('click', () => showPage('home'));
document.getElementById('remindersBtn').addEventListener('click', () => showPage('reminders'));
document.getElementById('addVehicleBtn').addEventListener('click', showAddVehiclePopup);
document.getElementById('vehiclePhoto').addEventListener('change', previewVehiclePhoto);
document.getElementById('saveVehicleBtn').addEventListener('click', saveVehicle);
document.getElementById('closeAddVehiclePopupBtn').addEventListener('click', closeAddVehiclePopup);
document.getElementById('updateVehiclePhoto').addEventListener('change', previewUpdateVehiclePhoto);
document.getElementById('updateVehicleBtn').addEventListener('click', updateVehicleDetails);
document.getElementById('addServiceBtn').addEventListener('click', showAddServicePopup);
document.getElementById('saveNewServiceBtn').addEventListener('click', saveNewService);
document.getElementById('closeAddServicePopupBtn').addEventListener('click', closeAddServicePopup);
document.getElementById('filterBtn').addEventListener('click', toggleFilterDropdown);
document.getElementById('searchInput').addEventListener('keyup', filterAndSearch);
document.querySelectorAll('#filterDropdown input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', filterAndSearch);
});
document.getElementById('vehicleFilter').addEventListener('change', filterServicesByVehicle);
document.getElementById('sortServices').addEventListener('change', sortServices);
document.querySelectorAll('thead th').forEach((header, index) => {
  const columnTypes = ['status', '', 'task', 'serviceDate', 'mileage'];
  if (columnTypes[index]) {
    header.addEventListener('click', () => sortTable(index, columnTypes[index]));
  }
});
document.getElementById('editBtn').addEventListener('click', editDetails);
document.getElementById('saveBtn').addEventListener('click', saveEdits);
document.getElementById('closePopupBtn').addEventListener('click', closePopup);
document.getElementById('addSubtaskBtn').addEventListener('click', addSubtask);
document.getElementById('closeSubtaskPopupBtn').addEventListener('click', closeSubtaskPopup);
document.getElementById('addReminderBtn').addEventListener('click', addReminder);
document.getElementById('addTodoBtn').addEventListener('click', addTodo);
document.getElementById('editReminderBtn').addEventListener('click', (e) => showReminderDetails(parseInt(e.target.dataset.index), true));
document.getElementById('saveReminderBtn').addEventListener('click', (e) => saveEditedReminder(parseInt(e.target.dataset.index)));
document.getElementById('closeReminderDetailsBtn').addEventListener('click', closeReminderDetailsPopup);
document.getElementById('editTodoBtn').addEventListener('click', (e) => showTodoDetails(parseInt(e.target.dataset.index), true));
document.getElementById('saveTodoBtn').addEventListener('click', (e) => saveEditedTodo(parseInt(e.target.dataset.index)));
document.getElementById('closeTodoDetailsBtn').addEventListener('click', closeTodoDetailsPopup);
