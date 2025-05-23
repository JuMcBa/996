/* Changelog:
 * v1.0: Rewritten application for laptop use, removed Upcoming Events and Car Value, inspired by Fleetio design
 * v1.1: Fixed "Script error" by improving error handling and simplifying logic
 * v1.2: Simplified UI, switched to table format for service lists and dashboard
 * v1.3: Added hover effect for table rows, adjusted column sizes, modernized buttons and toggle switches
 * v1.4: Updated UI to Apple Inc. style with SF Pro font, neutral colors, and subtle animations
 * v1.5: Modified UI to flat design with solid colors, simple icons, soft edges, and ample white space
 */

const { useState, useEffect } = React;

const App = () => {
    const [currentMileage, setCurrentMileage] = useState(136000);
    const [upcomingServices, setUpcomingServices] = useState([
        { project: "Minor Service", type: "SERVICE", date: "2025-05-15", mileage: 136000, description: "Oil Change, Inspection, Brake Fluid Flush, Coolant Flush, Air Filter", oilChange: "Yes", sparkPlug: "No", brake: "Yes", cost: "$1,000" },
        { project: "IMS Bearing/Clutch Check", type: "UPGRADE", date: "2025-05-15", mileage: 136000, description: "Inspect IMS Bearing, Clutch", oilChange: "No", sparkPlug: "No", brake: "No", cost: "$500" },
        { project: "Tire Replacement", type: "UPGRADE", date: "2025-05-15", mileage: 136000, description: "Replace Tires", oilChange: "No", sparkPlug: "No", brake: "No", cost: "$1,200" },
        { project: "Oil Change", type: "SERVICE", date: "2025-08-15", mileage: 139000, description: "Oil Change, Inspection", oilChange: "Yes", sparkPlug: "No", brake: "No", cost: "$200" },
        { project: "Minor Service", type: "SERVICE", date: "2025-11-15", mileage: 144000, description: "Oil Change, Inspection", oilChange: "Yes", sparkPlug: "No", brake: "No", cost: "$200" },
        { project: "Major Service", type: "SERVICE", date: "2026-05-15", mileage: 150664, description: "Oil Change, Spark Plugs, Filters, Inspection", oilChange: "Yes", sparkPlug: "Yes", brake: "No", cost: "$1,500" },
        { project: "Brake Fluid Flush", type: "SERVICE", date: "2027-05-15", mileage: 151000, description: "Brake Fluid Flush", oilChange: "No", sparkPlug: "No", brake: "Yes", cost: "$300" },
        { project: "Coolant Flush", type: "SERVICE", date: "2029-05-15", mileage: 162245, description: "Coolant Flush", oilChange: "No", sparkPlug: "No", brake: "No", cost: "$400" },
        { project: "Air Filter/Fuel Filter", type: "SERVICE", date: "2029-05-15", mileage: 162245, description: "Replace Air Filter, Fuel Filter", oilChange: "No", sparkPlug: "No", brake: "No", cost: "$300" },
        { project: "IMS Bearing/Clutch Check", type: "UPGRADE", date: "2029-05-15", mileage: 188985, description: "Inspect IMS Bearing, Clutch", oilChange: "No", sparkPlug: "No", brake: "No", cost: "$500" }
    ]);
    const [completedServices, setCompletedServices] = useState([]);
    const [activeTab, setActiveTab] = useState('maintenance');
    const [modal, setModal] = useState({ visible: false, type: '', data: null });
    const [addServiceModal, setAddServiceModal] = useState({ visible: false, status: 'upcoming', type: 'SERVICE', date: '', mileage: '', project: '', description: '', oilChange: false, sparkPlug: false, brake: false, projectedCost: '', actualCost: '', vendor: '' });
    const [qrModal, setQrModal] = useState(false);
    const [upcomingSearch, setUpcomingSearch] = useState('');
    const [completedSearch, setCompletedSearch] = useState('');
    const [upcomingTypeFilter, setUpcomingTypeFilter] = useState('all');
    const [completedTypeFilter, setCompletedTypeFilter] = useState('all');
    const [upcomingSort, setUpcomingSort] = useState({ field: 'mileage', direction: 'asc' });
    const [completedSort, setCompletedSort] = useState({ field: 'mileage', direction: 'desc' });

    const initialCompletedServices = [
        { date: "2020-05-24", mileage: 97069, project: "Replace Catalytic Converter", description: "Replace Catalytic Converter", cost: "$1,849", vendor: "Makellos Classics" },
        { date: "2018-11-20", mileage: 95534, project: "Lube, Oil and Filter Service", description: "Remove and Replace Secondary Air Components and Check for Fault Codes", cost: "$266", vendor: "Makellos Classics" },
        { date: "2018-11-21", mileage: 95636, project: "Enkei Wheels and P-Zero Tires", description: "Enkei Wheels and P-Zero Tires", cost: "$2,405", vendor: "Makellos Classics" },
        { date: "2018-12-19", mileage: 96115, project: "Replace Starter", description: "Hood Lock Actuator", cost: "$1,082", vendor: "Makellos Classics" },
        { date: "2020-05-24", mileage: 102245, project: "Lube, Oil and Filter Service + New Xenon Light Bulbs", description: "Lube, Oil and Filter Service + New Xenon Light Bulbs", cost: "$585", vendor: "Makellos Classics" },
        { date: "2020-01-30", mileage: 104556, project: "New Rear Tires Cont Extreme Contact Sport", description: "New Rear Tires Cont Extreme Contact Sport", cost: "$688", vendor: "Discount Tire" },
        { date: "2020-02-18", mileage: 105289, project: "Replace Brake Rotors, Pads, Sensors and Hardware", description: "Replace Brake Rotors, Pads, Sensors and Hardware", cost: "$1,239", vendor: "Makellos Classics" },
        { date: "2020-05-14", mileage: 104938, project: "Headlight Switch", description: "Headlight Switch", cost: "$153", vendor: "Makellos Classics" },
        { date: "2021-07-01", mileage: 113000, project: "Replace with Magnaflow Catalytic Converter", description: "Replace with Magnaflow Catalytic Converter", cost: "$411", vendor: "Makellos Classics" },
        { date: "2021-07-06", mileage: 113000, project: "PCCM+ Unit", description: "Replace Shift Knob, Center Console Storage", cost: "$351", vendor: "Suncoastparts.com" },
        { date: "2021-08-29", mileage: 113000, project: "Rebuild Convertible Top Hydraulic Pistons", description: "Rebuild Convertible Top Hydraulic Pistons", cost: "$34", vendor: "N/A" },
        { date: "2021-08-29", mileage: 113000, project: "Leather Interior, Dash, Door Panels, Steering Column Trim, Dash Vents", description: "Leather Interior, Dash, Door Panels, Steering Column Trim, Dash Vents", cost: "$2,810", vendor: "eBay, Pride Auto Wrecking" },
        { date: "2021-10-04", mileage: 113000, project: "996 Turbo Front Bumper Cover with 45 Spoiler Lip", description: "996 Turbo Front Bumper Cover with 45 Spoiler Lip", cost: "$739", vendor: "eBay" },
        { date: "2021-10-11", mileage: 113000, project: "Sport Steering Wheel and Airbag Leather Wrap", description: "Sport Steering Wheel and Airbag Leather Wrap", cost: "$1,300", vendor: "eBay" },
        { date: "2021-10-29", mileage: 113000, project: "Window Tint 70 Front 40 Rear", description: "Window Tint 70 Front 40 Rear", cost: "$800", vendor: "??" },
        { date: "2021-11-11", mileage: 115500, project: "Adapter", description: "PCCM+ Installation", cost: "$1,700", vendor: "topsonline.com" },
        { date: "2022-08-11", mileage: 118068, project: "Refresh Spark Plugs and Coils", description: "Refresh Spark Plugs and Coils", cost: "$300", vendor: "FCP Euro.com" },
        { date: "2023-02-15", mileage: 120664, project: "Oil Change, Mobile 1 OW-40", description: "Oil Change, Mobile 1 OW-40", cost: "$150", vendor: "Self" },
        { date: "2024-10-01", mileage: 128000, project: "Paint Front Bumper and Hood", description: "Paint Front Bumper and Hood", cost: "$3,500", vendor: "TBD" },
        { date: "2024-04-26", mileage: 129876, project: "Porsche Classic Engine Oil SW-50 + Filter", description: "Oil Change, Inspection", cost: "$200", vendor: "Pelican Parts" },
        { date: "2017-08-24", mileage: 83180, project: "Replace O2 Sensor, Oil Pressure Send Unit, Lube, Oil and Filter Service", description: "Replace O2 Sensor, Oil Pressure Send Unit, Lube, Oil and Filter Service", cost: "$1,441", vendor: "Makellos Classics" },
        { date: "2017-10-30", mileage: 84813, project: "New Battery", description: "New Battery", cost: "$229", vendor: "Pep Boys" },
        { date: "2017-11-28", mileage: 85699, project: "Replace Brake Pads and Rotors", description: "Replace Brake Pads and Rotors", cost: "$1,679", vendor: "Makellos Classics" },
        { date: "2018-06-15", mileage: 86922, project: "Lube, Oil and Filter Service, Cab Top Operation, New Key, Remove and Replace Coolant Cover Flange", description: "Lube, Oil and Filter Service, Cab Top Operation, New Key, Remove and Replace Coolant Cover Flange", cost: "$454", vendor: "Makellos Classics" },
        { date: "2018-06-04", mileage: 90424, project: "Replace O2 Sensor, Voltage Regulator, H7 Battery, Battery Bracket", description: "Replace O2 Sensor, Voltage Regulator, H7 Battery, Battery Bracket", cost: "$1,038", vendor: "Makellos Classics" },
        { date: "2015-11-14", mileage: 68985, project: "IMS Bearing w/Oiling Kit, Rear Main Seal, Flywheel, Clutch, Timing Chain Tensioner, Oil and Rear Crank Seal, Oil Separator", description: "IMS Bearing w/Oiling Kit, Rear Main Seal, Flywheel, Clutch, Timing Chain Tensioner, Oil and Rear Crank Seal, Oil Separator", cost: "$6,918", vendor: "Konig Motorsport" },
        { date: "2015-11-17", mileage: 69098, project: "Transmission Oil", description: "Transmission Oil", cost: "$154", vendor: "Konig Motorsport" },
        { date: "2015-12-18", mileage: 69098, project: "Ignition Coil", description: "Ignition Coil", cost: "$463", vendor: "Konig Motorsport" },
        { date: "2016-01-16", mileage: 69098, project: "Replace Engine Harness", description: "Replace Engine Harness", cost: "$1,653", vendor: "Konig Motorsport" },
        { date: "2016-03-24", mileage: 71645, project: "Replace with Factory Clutch and Factory Single Mass Flywheel", description: "Replace with Factory Clutch and Factory Single Mass Flywheel", cost: "$2,029", vendor: "Hoehn Porsche" },
        { date: "2016-04-28", mileage: 72422, project: "Replace Wheel Bearing & CV Boot", description: "Replace Wheel Bearing & CV Boot", cost: "$735", vendor: "Makellos Classics" },
        { date: "2016-06-14", mileage: 74866, project: "Replace Engine Mounts", description: "Replace Engine Mounts", cost: "$520", vendor: "Makellos Classics" },
        { date: "2016-10-17", mileage: 76079, project: "Lube, Oil and Filter Service", description: "Lube, Oil and Filter Service", cost: "$249", vendor: "Makellos Classics" },
        { date: "2016-10-31", mileage: 76337, project: "Replace Steering Lock Assembly", description: "Replace Steering Lock Assembly", cost: "$732", vendor: "Makellos Classics" }
    ];

    useEffect(() => {
        try {
            const storedServices = localStorage.getItem('completedServices');
            if (storedServices) {
                setCompletedServices(JSON.parse(storedServices).sort((a, b) => b.mileage - a.mileage));
            } else {
                setCompletedServices(initialCompletedServices.sort((a, b) => b.mileage - a.mileage));
                localStorage.setItem('completedServices', JSON.stringify(initialCompletedServices));
            }
            const storedMileage = localStorage.getItem('currentMileage');
            if (storedMileage) {
                setCurrentMileage(parseInt(storedMileage));
            }

            const updatedUpcoming = upcomingServices.filter(upcoming => {
                return !completedServices.some(completed => 
                    completed.project === upcoming.project && completed.mileage >= upcoming.mileage
                );
            });
            setUpcomingServices(updatedUpcoming);
        } catch (error) {
            console.error('Error initializing data:', error);
            setCompletedServices(initialCompletedServices.sort((a, b) => b.mileage - a.mileage));
            localStorage.setItem('completedServices', JSON.stringify(initialCompletedServices));
        }
    }, []);

    const ServiceDetailsModal = ({ visible, type, data, onClose, onEdit, onDelete }) => {
        if (!visible || !data) return null;

        return (
            <div className="modal" style={{ display: 'block' }}>
                <div className="modal-content">
                    <span className="close" onClick={onClose}>×</span>
                    <h2 className="text-xl font-semibold mb-4">Service Details</h2>
                    <div>
                        <p><span className="label">Project:</span> {data.project}</p>
                        {type === 'upcoming' && <p><span className="label">Type:</span> {data.type}</p>}
                        <p><span className="label">Date:</span> {data.date}</p>
                        <p><span className="label">Mileage:</span> {data.mileage.toLocaleString()}</p>
                        {type === 'upcoming' && (
                            <>
                                <p><span className="label">Miles Remaining:</span> {(data.mileage - currentMileage).toLocaleString()}</p>
                                <p><span className="label">Oil Change:</span> {data.oilChange}</p>
                                <p><span className="label">Spark Plug:</span> {data.sparkPlug}</p>
                                <p><span className="label">Brake Service:</span> {data.brake}</p>
                                <p><span className="label">Projected Cost:</span> {data.cost}</p>
                            </>
                        )}
                        {type === 'completed' && (
                            <>
                                <p><span className="label">Actual Cost:</span> {data.cost}</p>
                                <p><span className="label">Vendor:</span> {data.vendor}</p>
                            </>
                        )}
                        <p><span className="label">Description:</span> {data.description}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onEdit}>Edit</button>
                        <button onClick={onDelete} className="danger">Delete</button>
                    </div>
                </div>
            </div>
        );
    };

    const AddServiceModal = ({ visible, onClose, onSubmit }) => {
        if (!visible) return null;

        const handleSubmit = () => {
            const newService = {
                status: addServiceModal.status,
                type: addServiceModal.type,
                date: addServiceModal.date,
                mileage: parseInt(addServiceModal.mileage) || 0,
                project: addServiceModal.project,
                description: addServiceModal.description,
                oilChange: addServiceModal.status === 'upcoming' ? (addServiceModal.oilChange ? 'Yes' : 'No') : undefined,
                sparkPlug: addServiceModal.status === 'upcoming' ? (addServiceModal.sparkPlug ? 'Yes' : 'No') : undefined,
                brake: addServiceModal.status === 'upcoming' ? (addServiceModal.brake ? 'Yes' : 'No') : undefined,
                cost: addServiceModal.status === 'upcoming' ? addServiceModal.projectedCost : addServiceModal.actualCost,
                vendor: addServiceModal.status === 'completed' ? addServiceModal.vendor : undefined
            };

            if (
                (newService.status === 'upcoming' && newService.type && newService.date && newService.mileage && newService.project && newService.description && newService.cost) ||
                (newService.status === 'completed' && newService.date && newService.mileage && newService.project && newService.description && newService.cost && newService.vendor)
            ) {
                onSubmit(newService);
                setAddServiceModal({
                    visible: false,
                    status: 'upcoming',
                    type: 'SERVICE',
                    date: '',
                    mileage: '',
                    project: '',
                    description: '',
                    oilChange: false,
                    sparkPlug: false,
                    brake: false,
                    projectedCost: '',
                    actualCost: '',
                    vendor: ''
                });
            } else {
                alert(`Please fill in all required fields for ${newService.status} services.`);
            }
        };

        return (
            <div className="modal" style={{ display: 'block' }}>
                <div className="modal-content">
                    <span className="close" onClick={onClose}>×</span>
                    <h2 className="text-xl font-semibold mb-4">Add Service</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1 text-sm">Service Status:</label>
                            <select 
                                value={addServiceModal.status} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, status: e.target.value })}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Service Type:</label>
                            <select 
                                value={addServiceModal.type} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, type: e.target.value })}
                                className={addServiceModal.status === 'completed' ? 'hidden' : ''}
                            >
                                <option value="SERVICE">SERVICE</option>
                                <option value="UPGRADE">UPGRADE</option>
                                <option value="REPAIR">REPAIR</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Date:</label>
                            <input 
                                type="date" 
                                value={addServiceModal.date} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Mileage:</label>
                            <input 
                                type="number" 
                                value={addServiceModal.mileage} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, mileage: e.target.value })}
                                placeholder="Mileage"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Project:</label>
                            <input 
                                type="text" 
                                value={addServiceModal.project} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, project: e.target.value })}
                                placeholder="Project"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Description:</label>
                            <input 
                                type="text" 
                                value={addServiceModal.description} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, description: e.target.value })}
                                placeholder="Description"
                            />
                        </div>
                        <div className={addServiceModal.status === 'completed' ? 'hidden' : ''}>
                            <label className="block mb-1 text-sm">Projected Cost:</label>
                            <input 
                                type="text" 
                                value={addServiceModal.projectedCost} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, projectedCost: e.target.value })}
                                placeholder="Projected Cost"
                            />
                        </div>
                        <div className={addServiceModal.status === 'upcoming' ? 'hidden' : ''}>
                            <label className="block mb-1 text-sm">Actual Cost:</label>
                            <input 
                                type="text" 
                                value={addServiceModal.actualCost} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, actualCost: e.target.value })}
                                placeholder="Actual Cost"
                            />
                        </div>
                        <div className={addServiceModal.status === 'upcoming' ? 'hidden' : ''}>
                            <label className="block mb-1 text-sm">Vendor:</label>
                            <input 
                                type="text" 
                                value={addServiceModal.vendor} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, vendor: e.target.value })}
                                placeholder="Vendor"
                            />
                        </div>
                        <div className={addServiceModal.status === 'completed' ? 'hidden' : ''}>
                            <label className="block mb-1 text-sm">Oil Change:</label>
                            <input 
                                type="checkbox" 
                                checked={addServiceModal.oilChange} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, oilChange: e.target.checked })}
                            />
                        </div>
                        <div className={addServiceModal.status === 'completed' ? 'hidden' : ''}>
                            <label className="block mb-1 text-sm">Spark Plug:</label>
                            <input 
                                type="checkbox" 
                                checked={addServiceModal.sparkPlug} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, sparkPlug: e.target.checked })}
                            />
                        </div>
                        <div className={addServiceModal.status === 'completed' ? 'hidden' : ''}>
                            <label className="block mb-1 text-sm">Brake Service:</label>
                            <input 
                                type="checkbox" 
                                checked={addServiceModal.brake} 
                                onChange={(e) => setAddServiceModal({ ...addServiceModal, brake: e.target.checked })}
                            />
                        </div>
                    </div>
                    <button onClick={handleSubmit} className="mt-6">Submit Service</button>
                </div>
            </div>
        );
    };

    const QRModal = ({ visible, onClose }) => {
        if (!visible) return null;

        return (
            <div className="modal" style={{ display: 'block' }}>
                <div className="modal-content">
                    <span className="close" onClick={onClose}>×</span>
                    <h2 className="text-xl font-semibold mb-4 text-center">Scan to Visit</h2>
                    <svg className="qr-code-large" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="10" y="10" width="30" height="30" fill="black"/>
                        <rect x="60" y="10" width="30" height="30" fill="black"/>
                        <rect x="10" y="60" width="30" height="30" fill="black"/>
                        <rect x="60" y="60" width="30" height="30" fill="black"/>
                        <rect x="40" y="40" width="20" height="20" fill="black"/>
                        <rect x="45" y="45" width="5" height="5" fill="white"/>
                        <rect x="50" y="50" width="5" height="5" fill="white"/>
                        <rect x="45" y="50" width="5" height="5" fill="white"/>
                        <rect x="50" y="45" width="5" height="5" fill="white"/>
                    </svg>
                    <p className="text-center mt-4">
                        <a href="https://jumcba.github.io/996/" target="_blank" className="text-blue-500 hover:underline">https://jumcba.github.io/996/</a>
                    </p>
                </div>
            </div>
        );
    };

    const MaintenanceTab = () => {
        const inferServiceType = (description) => {
            if (!description) return '';
            const desc = description.toLowerCase();
            if (desc.includes('oil change') || desc.includes('filter') || desc.includes('inspection') || desc.includes('fluid')) return 'SERVICE';
            if (desc.includes('replace') || desc.includes('bearing') || desc.includes('clutch')) return 'UPGRADE';
            if (desc.includes('repair') || desc.includes('fix')) return 'REPAIR';
            return '';
        };

        const filteredUpcoming = upcomingServices
            .filter(service => 
                (upcomingTypeFilter === 'all' || service.type === upcomingTypeFilter) &&
                (service.project.toLowerCase().includes(upcomingSearch.toLowerCase()) ||
                 (service.description || '').toLowerCase().includes(upcomingSearch.toLowerCase()))
            )
            .sort((a, b) => {
                const field = upcomingSort.field;
                const direction = upcomingSort.direction;
                const aValue = field === 'mileage' ? a[field] : field === 'date' ? new Date(a[field]) : a[field].toLowerCase();
                const bValue = field === 'mileage' ? b[field] : field === 'date' ? new Date(b[field]) : b[field].toLowerCase();
                return direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
            });

        const filteredCompleted = completedServices
            .filter(service => {
                const inferredType = inferServiceType(service.description);
                return (
                    (completedTypeFilter === 'all' || inferredType === completedTypeFilter) &&
                    (service.project.toLowerCase().includes(completedSearch.toLowerCase()) ||
                     (service.description || '').toLowerCase().includes(completedSearch.toLowerCase()))
                );
            })
            .sort((a, b) => {
                const field = completedSort.field;
                const direction = completedSort.direction;
                const aValue = field === 'mileage' ? a[field] : field === 'date' ? new Date(a[field]) : a[field].toLowerCase();
                const bValue = field === 'mileage' ? b[field] : field === 'date' ? new Date(b[field]) : b[field].toLowerCase();
                return direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
            });

        const handleSortUpcoming = (field) => {
            setUpcomingSort({
                field,
                direction: upcomingSort.field === field && upcomingSort.direction === 'asc' ? 'desc' : 'asc'
            });
        };

        const handleSortCompleted = (field) => {
            setCompletedSort({
                field,
                direction: completedSort.field === field && completedSort.direction === 'asc' ? 'desc' : 'asc'
            });
        };

        return (
            <div id="maintenance" className="tab-content active">
                <div className="panel">
                    <h2 className="text-xl font-semibold mb-4">Current Mileage</h2>
                    <input 
                        type="number" 
                        value={currentMileage} 
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 0) {
                                setCurrentMileage(value);
                                localStorage.setItem('currentMileage', value);
                            } else {
                                alert('Please enter a valid mileage.');
                            }
                        }} 
                        placeholder="Enter current mileage"
                        style={{ width: '200px', marginRight: '12px' }}
                    />
                    <button onClick={() => setCurrentMileage(currentMileage)}>Update Mileage</button>
                    <p className="mt-4 text-sm">Current Mileage: <span>{currentMileage.toLocaleString()}</span> miles</p>
                </div>

                <div className="panel">
                    <button onClick={() => setAddServiceModal({ ...addServiceModal, visible: true })}>Add Service</button>
                </div>

                <div className="panel">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Upcoming Services</h2>
                        <div className="filter-container">
                            <label>Filter by Type:</label>
                            <select 
                                value={upcomingTypeFilter} 
                                onChange={(e) => setUpcomingTypeFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="SERVICE">SERVICE</option>
                                <option value="UPGRADE">UPGRADE</option>
                                <option value="REPAIR">REPAIR</option>
                            </select>
                            <input 
                                type="text" 
                                value={upcomingSearch} 
                                onChange={(e) => setUpcomingSearch(e.target.value)} 
                                placeholder="Search..." 
                                style={{ width: '200px' }}
                            />
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th className="project-col" onClick={() => handleSortUpcoming('project')}>Project</th>
                                <th onClick={() => handleSortUpcoming('type')}>Type</th>
                                <th onClick={() => handleSortUpcoming('date')}>Date</th>
                                <th onClick={() => handleSortUpcoming('mileage')}>Mileage</th>
                                <th>Miles Remaining</th>
                                <th>Oil Change</th>
                                <th>Spark Plug</th>
                                <th>Brake Service</th>
                                <th>Projected Cost</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUpcoming.map(service => {
                                const isOverdue = service.mileage <= currentMileage;
                                return (
                                    <tr 
                                        key={`${service.project}-${service.mileage}`} 
                                        className={`upcoming-row ${isOverdue ? 'overdue-row' : ''}`}
                                        onClick={() => setModal({ visible: true, type: 'upcoming', data: service })}
                                    >
                                        <td className="project-col">{service.project}</td>
                                        <td>{service.type}</td>
                                        <td>{service.date}</td>
                                        <td>{service.mileage.toLocaleString()}</td>
                                        <td className="miles-remaining">{(service.mileage - currentMileage).toLocaleString()}</td>
                                        <td>{service.oilChange}</td>
                                        <td>{service.sparkPlug}</td>
                                        <td>{service.brake}</td>
                                        <td>{service.cost}</td>
                                        <td>{service.description || 'No description'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="panel">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Completed Services</h2>
                        <div className="filter-container">
                            <label>Filter by Type:</label>
                            <select 
                                value={completedTypeFilter} 
                                onChange={(e) => setCompletedTypeFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="SERVICE">SERVICE</option>
                                <option value="UPGRADE">UPGRADE</option>
                                <option value="REPAIR">REPAIR</option>
                            </select>
                            <input 
                                type="text" 
                                value={completedSearch} 
                                onChange={(e) => setCompletedSearch(e.target.value)} 
                                placeholder="Search..." 
                                style={{ width: '200px' }}
                            />
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th className="project-col" onClick={() => handleSortCompleted('project')}>Project</th>
                                <th onClick={() => handleSortCompleted('date')}>Date</th>
                                <th onClick={() => handleSortCompleted('mileage')}>Mileage</th>
                                <th onClick={() => handleSortCompleted('vendor')}>Vendor</th>
                                <th>Actual Cost</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompleted.map(service => (
                                <tr 
                                    key={`${service.project}-${service.mileage}`} 
                                    className="completed-row"
                                    onClick={() => setModal({ visible: true, type: 'completed', data: service })}
                                >
                                    <td className="project-col">{service.project}</td>
                                    <td className="date-col prominent-date">{service.date}</td>
                                    <td className="mileage-col prominent-mileage">{service.mileage.toLocaleString()}</td>
                                    <td className="vendor-col">{service.vendor || 'N/A'}</td>
                                    <td className="cost-col">{service.cost}</td>
                                    <td>{service.description || 'No description'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const ServiceHistoryTab = () => {
        const allServices = [...upcomingServices, ...completedServices];
        const servicesByYear = {};

        allServices.forEach(service => {
            const year = service.date.split('-')[0];
            if (!servicesByYear[year]) {
                servicesByYear[year] = { upcoming: [], completed: [] };
            }
            if (upcomingServices.includes(service)) {
                servicesByYear[year].upcoming.push(service);
            } else {
                servicesByYear[year].completed.push(service);
            }
        });

        const years = Object.keys(servicesByYear).sort((a, b) => b - a);

        return (
            <div id="history" className="tab-content">
                <div className="panel">
                    <h2 className="text-xl font-semibold mb-6">Service History Dashboard</h2>
                    {years.map(year => {
                        const { upcoming, completed } = servicesByYear[year];
                        const projectedSpend = upcoming.reduce((sum, s) => sum + parseFloat(s.cost.replace('$', '').replace(',', '')), 0);
                        const actualSpend = completed.reduce((sum, s) => sum + parseFloat(s.cost.replace('$', '').replace(',', '')), 0);

                        const oilChanges = completed
                            .filter(s => (s.description || '').toLowerCase().includes('oil change'))
                            .sort((a, b) => a.mileage - b.mileage);
                        const sparkPlugs = completed
                            .filter(s => (s.description || '').toLowerCase().includes('spark plug') || (s.description || '').toLowerCase().includes('spark plugs'))
                            .sort((a, b) => a.mileage - b.mileage);

                        const oilChangeIntervals = [];
                        for (let i = 1; i < oilChanges.length; i++) {
                            const interval = oilChanges[i].mileage - oilChanges[i-1].mileage;
                            oilChangeIntervals.push(interval);
                        }
                        const avgOilChangeInterval = oilChangeIntervals.length > 0 ? (oilChangeIntervals.reduce((sum, val) => sum + val, 0) / oilChangeIntervals.length).toFixed(0) : 'N/A';

                        const sparkPlugIntervals = [];
                        for (let i = 1; i < sparkPlugs.length; i++) {
                            const interval = sparkPlugs[i].mileage - sparkPlugs[i-1].mileage;
                            sparkPlugIntervals.push(interval);
                        }
                        const avgSparkPlugInterval = sparkPlugIntervals.length > 0 ? (sparkPlugIntervals.reduce((sum, val) => sum + val, 0) / sparkPlugIntervals.length).toFixed(0) : 'N/A';

                        return (
                            <div key={year} className="dashboard-section">
                                <h3>{year}</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Projected Spend</th>
                                            <th>Actual Spend</th>
                                            <th>Avg. Miles Between Oil Changes</th>
                                            <th>Avg. Miles Between Spark Plugs</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>${projectedSpend.toLocaleString()}</td>
                                            <td>${actualSpend.toLocaleString()}</td>
                                            <td>{avgOilChangeInterval === 'N/A' ? 'N/A' : avgOilChangeInterval + ' miles'}</td>
                                            <td>{avgSparkPlugInterval === 'N/A' ? 'N/A' : avgSparkPlugInterval + ' miles'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleEditService = (service, type) => {
        if (type === 'upcoming') {
            const newType = prompt("Edit Type:", service.type);
            const newDate = prompt("Edit Date (YYYY-MM-DD):", service.date);
            const newMileage = prompt("Edit Mileage:", service.mileage);
            const newProject = prompt("Edit Project:", service.project);
            const newDescription = prompt("Edit Description:", service.description);
            const newOilChange = prompt("Edit Oil Change (Yes/No):", service.oilChange);
            const newSparkPlug = prompt("Edit Spark Plug (Yes/No):", service.sparkPlug);
            const newBrake = prompt("Edit Brake (Yes/No):", service.brake);
            const newCost = prompt("Edit Projected Cost:", service.cost);

            if (newType && newDate && newMileage && newProject && newDescription && newOilChange && newSparkPlug && newBrake && newCost) {
                const updatedServices = upcomingServices.map(s => 
                    s.project === service.project && s.mileage === service.mileage
                        ? {
                            ...s,
                            project: newProject,
                            type: newType,
                            date: newDate,
                            mileage: parseInt(newMileage),
                            description: newDescription,
                            oilChange: newOilChange,
                            sparkPlug: newSparkPlug,
                            brake: newBrake,
                            cost: newCost
                        }
                        : s
                );
                setUpcomingServices(updatedServices);
            } else {
                alert('All fields are required.');
            }
        } else {
            const index = completedServices.findIndex(s => s.project === service.project && s.mileage === service.mileage);
            const date = prompt("Edit Date (YYYY-MM-DD):", service.date);
            const mileage = prompt("Edit Mileage:", service.mileage);
            const project = prompt("Edit Project:", service.project);
            const description = prompt("Edit Description:", service.description);
            const cost = prompt("Edit Actual Cost:", service.cost);
            const vendor = prompt("Edit Vendor:", service.vendor);

            if (date && mileage && project && description && cost && vendor) {
                const updatedServices = [...completedServices];
                updatedServices[index] = { date, mileage: parseInt(mileage), project, description, cost, vendor };
                setCompletedServices(updatedServices);
                localStorage.setItem('completedServices', JSON.stringify(updatedServices));

                const completedMileage = parseInt(mileage);
                const updatedUpcoming = upcomingServices.filter(s => 
                    !(s.project === project && completedMileage >= s.mileage)
                );
                setUpcomingServices(updatedUpcoming);
            } else {
                alert('All fields are required.');
            }
        }
    };

    const handleDeleteService = (service, type) => {
        if (type === 'upcoming') {
            setUpcomingServices(upcomingServices.filter(s => s.project !== service.project));
        } else {
            const index = completedServices.findIndex(s => s.project === service.project && s.mileage === service.mileage);
            if (window.confirm('Are you sure you want to delete this completed service?')) {
                const updatedServices = [...completedServices];
                updatedServices.splice(index, 1);
                setCompletedServices(updatedServices);
                localStorage.setItem('completedServices', JSON.stringify(updatedServices));
            }
        }
    };

    const handleAddService = (newService) => {
        if (newService.status === 'upcoming') {
            setUpcomingServices([...upcomingServices, {
                project: newService.project,
                type: newService.type,
                date: newService.date,
                mileage: newService.mileage,
                description: newService.description,
                oilChange: newService.oilChange,
                sparkPlug: newService.sparkPlug,
                brake: newService.brake,
                cost: newService.cost
            }]);
        } else {
            const updatedCompleted = [...completedServices, {
                date: newService.date,
                mileage: newService.mileage,
                project: newService.project,
                description: newService.description,
                cost: newService.cost,
                vendor: newService.vendor
            }];
            setCompletedServices(updatedCompleted);
            localStorage.setItem('completedServices', JSON.stringify(updatedCompleted));

            const updatedUpcoming = upcomingServices.filter(s => 
                !(s.project === newService.project && newService.mileage >= s.mileage)
            );
            setUpcomingServices(updatedUpcoming);
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h1>Porsche 996 Maintenance Tracker</h1>
                <div onClick={() => setQrModal(true)}>
                    <svg className="qr-icon" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="4" y="4" width="6" height="6" />
                        <rect x="14" y="4" width="6" height="6" />
                        <rect x="4" y="14" width="6" height="6" />
                        <rect x="14" y="14" width="6" height="6" />
                        <rect x="10" y="10" width="4" height="4" />
                    </svg>
                </div>
            </div>

            <div className="nav-bar">
                <ul className="flex">
                    <li>
                        <button 
                            className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('maintenance')}
                        >
                            Maintenance
                        </button>
                    </li>
                    <li>
                        <button 
                            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('history')}
                        >
                            Service History
                        </button>
                    </li>
                </ul>
            </div>

            {activeTab === 'maintenance' && <MaintenanceTab />}
            {activeTab === 'history' && <ServiceHistoryTab />}

            <ServiceDetailsModal 
                visible={modal.visible} 
                type={modal.type} 
                data={modal.data} 
                onClose={() => setModal({ visible: false, type: '', data: null })}
                onEdit={() => handleEditService(modal.data, modal.type)}
                onDelete={() => handleDeleteService(modal.data, modal.type)}
            />

            <AddServiceModal 
                visible={addServiceModal.visible} 
                onClose={() => setAddServiceModal({ ...addServiceModal, visible: false })}
                onSubmit={handleAddService}
            />

            <QRModal 
                visible={qrModal} 
                onClose={() => setQrModal(false)}
            />
        </div>
    );
};

try {
    ReactDOM.render(<App />, document.getElementById('root'));
} catch (error) {
    console.error('Error rendering React app:', error);
    document.getElementById('root').innerHTML = '<p>Error: Failed to render the application. Please check the console for details.</p>';
}
