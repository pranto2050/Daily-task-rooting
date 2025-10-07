class DailyRoutineTracker {
    constructor() {
        this.currentDay = this.getCurrentDay();
        this.routines = this.loadRoutines();
        this.currentTime = new Date();
        this.updateInterval = null;
        this.bangladeshTimeZone = 'Asia/Dhaka';
        this.manualTimeMode = false;
        this.manualTime = null;
        
        this.init();
    }

    init() {
        this.updateTime();
        this.setupEventListeners();
        this.updateDaySelector(); // Set the correct active day
        this.renderRoutine();
        this.updateStats();
        
        // Update time every second
        this.updateInterval = setInterval(() => {
            this.updateTime();
            this.updateTaskStatuses();
        }, 1000);
    }

    getCurrentDay() {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const bangladeshTime = new Date().toLocaleString("en-US", {timeZone: this.bangladeshTimeZone});
        const bangladeshDate = new Date(bangladeshTime);
        return days[bangladeshDate.getDay()];
    }

    updateTime() {
        if (this.manualTimeMode && this.manualTime) {
            // Use manual time
            this.currentTime = new Date(this.manualTime);
        } else {
            // Get Bangladesh time
            const bangladeshTime = new Date().toLocaleString("en-US", {timeZone: this.bangladeshTimeZone});
            this.currentTime = new Date(bangladeshTime);
        }
        
        const timeString = this.currentTime.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: this.bangladeshTimeZone
        });
        const dateString = this.currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: this.bangladeshTimeZone
        });
        
        document.getElementById('currentTime').textContent = timeString;
        document.getElementById('currentDate').textContent = dateString;
        
        // Update current day if it changed
        const newDay = this.getCurrentDay();
        if (newDay !== this.currentDay) {
            this.currentDay = newDay;
            this.updateDaySelector();
            this.renderRoutine();
        }
    }

    updateDaySelector() {
        // Update the active day button
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.day === this.currentDay) {
                btn.classList.add('active');
            }
        });
    }

    setupEventListeners() {
        // Day selector buttons
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.day-btn.active').classList.remove('active');
                e.target.classList.add('active');
                this.currentDay = e.target.dataset.day;
                this.renderRoutine();
            });
        });

        // Modal close
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Settings panel
        this.setupSettingsPanel();
        
        // Task form functionality
        this.setupTaskForm();
    }

    setupSettingsPanel() {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const manualTimeToggle = document.getElementById('manualTimeToggle');
        const manualTimeControl = document.getElementById('manualTimeControl');
        const setManualTime = document.getElementById('setManualTime');
        const manualTimeInput = document.getElementById('manualTimeInput');
        const exportData = document.getElementById('exportData');
        const importData = document.getElementById('importData');
        const importFile = document.getElementById('importFile');
        const addNewTaskBtn = document.getElementById('addNewTaskBtn');

        // Open settings modal
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
            this.displayAllRoutines();
        });

        // Manual time toggle
        manualTimeToggle.addEventListener('change', (e) => {
            this.manualTimeMode = e.target.checked;
            manualTimeControl.style.display = e.target.checked ? 'flex' : 'none';
            if (!e.target.checked) {
                this.manualTime = null;
            }
        });

        // Set manual time
        setManualTime.addEventListener('click', () => {
            const timeValue = manualTimeInput.value;
            if (timeValue) {
                const today = new Date();
                const [hours, minutes] = timeValue.split(':');
                today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                this.manualTime = today;
                this.updateTime();
                this.showNotification('Manual time set successfully!', 'success');
            }
        });

        // Export data
        exportData.addEventListener('click', () => {
            this.exportData();
        });

        // Import data
        importData.addEventListener('click', () => {
            importFile.click();
        });

        importFile.addEventListener('change', (e) => {
            this.importData(e);
        });

        // Add new task
        addNewTaskBtn.addEventListener('click', () => {
            this.openTaskForm();
        });

        // Open report
        const openReport = document.getElementById('openReport');
        openReport.addEventListener('click', () => {
            document.getElementById('reportModal').style.display = 'block';
            this.initializeReport();
        });
    }

    setupTaskForm() {
        const taskForm = document.getElementById('taskForm');
        const cancelTask = document.getElementById('cancelTask');

        // Task form submission
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Cancel task
        cancelTask.addEventListener('click', () => {
            document.getElementById('taskFormModal').style.display = 'none';
        });
    }

    getRoutineData() {
        const routines = {
            saturday: [
                { time: '06:00', title: 'Wake up & Morning Routine', description: 'Wake up, brush teeth, freshen up', duration: 30, type: 'personal' },
                { time: '06:30', title: 'Exercise & Workout', description: 'Physical exercise and fitness routine', duration: 60, type: 'health' },
                { time: '07:30', title: 'Breakfast', description: 'Healthy breakfast and coffee', duration: 30, type: 'personal' },
                { time: '08:00', title: 'University Classes', description: 'Attend university classes (8 AM - 5 PM)', duration: 540, type: 'class', special: 'class-time' },
                { time: '17:00', title: 'Evening Break', description: 'Rest and refresh after classes', duration: 30, type: 'personal' },
                { time: '17:30', title: 'Web Development Study', description: 'Learn HTML, CSS, JavaScript, React', duration: 120, type: 'study' },
                { time: '19:30', title: 'Dinner', description: 'Evening meal with family', duration: 45, type: 'personal' },
                { time: '20:15', title: 'Project Work', description: 'Work on personal coding projects', duration: 90, type: 'work' },
                { time: '21:45', title: 'Reading & Learning', description: 'Read books, articles, or online courses', duration: 60, type: 'study' },
                { time: '22:45', title: 'Relaxation', description: 'Watch TV, listen to music, or relax', duration: 30, type: 'personal' },
                { time: '23:15', title: 'Prepare for Tomorrow', description: 'Plan next day, prepare clothes', duration: 15, type: 'personal' },
                { time: '23:30', title: 'Sleep', description: 'Go to bed for good night sleep', duration: 390, type: 'personal' }
            ],
            sunday: [
                { time: '06:00', title: 'Wake up & Morning Routine', description: 'Wake up, brush teeth, freshen up', duration: 30, type: 'personal' },
                { time: '06:30', title: 'Exercise & Workout', description: 'Physical exercise and fitness routine', duration: 60, type: 'health' },
                { time: '07:30', title: 'Breakfast', description: 'Healthy breakfast and coffee', duration: 30, type: 'personal' },
                { time: '08:00', title: 'University Classes', description: 'Attend university classes (8 AM - 5 PM)', duration: 540, type: 'class', special: 'class-time' },
                { time: '17:00', title: 'Evening Break', description: 'Rest and refresh after classes', duration: 30, type: 'personal' },
                { time: '17:30', title: 'Web Development Study', description: 'Learn HTML, CSS, JavaScript, React', duration: 120, type: 'study' },
                { time: '19:30', title: 'Dinner', description: 'Evening meal with family', duration: 45, type: 'personal' },
                { time: '20:15', title: 'Project Work', description: 'Work on personal coding projects', duration: 90, type: 'work' },
                { time: '21:45', title: 'Reading & Learning', description: 'Read books, articles, or online courses', duration: 60, type: 'study' },
                { time: '22:45', title: 'Relaxation', description: 'Watch TV, listen to music, or relax', duration: 30, type: 'personal' },
                { time: '23:15', title: 'Prepare for Tomorrow', description: 'Plan next day, prepare clothes', duration: 15, type: 'personal' },
                { time: '23:30', title: 'Sleep', description: 'Go to bed for good night sleep', duration: 390, type: 'personal' }
            ],
            monday: [
                { time: '06:00', title: 'Wake up & Morning Routine', description: 'Wake up, brush teeth, freshen up', duration: 30, type: 'personal' },
                { time: '06:30', title: 'Exercise & Workout', description: 'Physical exercise and fitness routine', duration: 60, type: 'health' },
                { time: '07:30', title: 'Breakfast', description: 'Healthy breakfast and coffee', duration: 30, type: 'personal' },
                { time: '08:00', title: 'University Classes', description: 'Attend university classes (8 AM - 5 PM)', duration: 540, type: 'class', special: 'class-time' },
                { time: '17:00', title: 'Evening Break', description: 'Rest and refresh after classes', duration: 30, type: 'personal' },
                { time: '17:30', title: 'Web Development Study', description: 'Learn HTML, CSS, JavaScript, React', duration: 120, type: 'study' },
                { time: '19:30', title: 'Dinner', description: 'Evening meal with family', duration: 45, type: 'personal' },
                { time: '20:15', title: 'Project Work', description: 'Work on personal coding projects', duration: 90, type: 'work' },
                { time: '21:45', title: 'Reading & Learning', description: 'Read books, articles, or online courses', duration: 60, type: 'study' },
                { time: '22:45', title: 'Relaxation', description: 'Watch TV, listen to music, or relax', duration: 30, type: 'personal' },
                { time: '23:15', title: 'Prepare for Tomorrow', description: 'Plan next day, prepare clothes', duration: 15, type: 'personal' },
                { time: '23:30', title: 'Sleep', description: 'Go to bed for good night sleep', duration: 390, type: 'personal' }
            ],
            tuesday: [
                { time: '06:00', title: 'Wake up & Morning Routine', description: 'Wake up, brush teeth, freshen up', duration: 30, type: 'personal' },
                { time: '06:30', title: 'Exercise & Workout', description: 'Physical exercise and fitness routine', duration: 60, type: 'health' },
                { time: '07:30', title: 'Breakfast', description: 'Healthy breakfast and coffee', duration: 30, type: 'personal' },
                { time: '08:00', title: 'University Classes', description: 'Attend university classes (8 AM - 5 PM)', duration: 540, type: 'class', special: 'class-time' },
                { time: '17:00', title: 'Evening Break', description: 'Rest and refresh after classes', duration: 30, type: 'personal' },
                { time: '17:30', title: 'Web Development Study', description: 'Learn HTML, CSS, JavaScript, React', duration: 120, type: 'study' },
                { time: '19:30', title: 'Dinner', description: 'Evening meal with family', duration: 45, type: 'personal' },
                { time: '20:15', title: 'Project Work', description: 'Work on personal coding projects', duration: 90, type: 'work' },
                { time: '21:45', title: 'Reading & Learning', description: 'Read books, articles, or online courses', duration: 60, type: 'study' },
                { time: '22:45', title: 'Relaxation', description: 'Watch TV, listen to music, or relax', duration: 30, type: 'personal' },
                { time: '23:15', title: 'Prepare for Tomorrow', description: 'Plan next day, prepare clothes', duration: 15, type: 'personal' },
                { time: '23:30', title: 'Sleep', description: 'Go to bed for good night sleep', duration: 390, type: 'personal' }
            ],
            wednesday: [
                { time: '06:00', title: 'Wake up & Morning Routine', description: 'Wake up, brush teeth, freshen up', duration: 30, type: 'personal' },
                { time: '06:30', title: 'Exercise & Workout', description: 'Physical exercise and fitness routine', duration: 60, type: 'health' },
                { time: '07:30', title: 'Breakfast', description: 'Healthy breakfast and coffee', duration: 30, type: 'personal' },
                { time: '08:00', title: 'University Classes', description: 'Attend university classes (8 AM - 5 PM)', duration: 540, type: 'class', special: 'class-time' },
                { time: '17:00', title: 'Evening Break', description: 'Rest and refresh after classes', duration: 30, type: 'personal' },
                { time: '17:30', title: 'Web Development Study', description: 'Learn HTML, CSS, JavaScript, React', duration: 120, type: 'study' },
                { time: '19:30', title: 'Dinner', description: 'Evening meal with family', duration: 45, type: 'personal' },
                { time: '20:15', title: 'Project Work', description: 'Work on personal coding projects', duration: 90, type: 'work' },
                { time: '21:45', title: 'Reading & Learning', description: 'Read books, articles, or online courses', duration: 60, type: 'study' },
                { time: '22:45', title: 'Relaxation', description: 'Watch TV, listen to music, or relax', duration: 30, type: 'personal' },
                { time: '23:15', title: 'Prepare for Tomorrow', description: 'Plan next day, prepare clothes', duration: 15, type: 'personal' },
                { time: '23:30', title: 'Sleep', description: 'Go to bed for good night sleep', duration: 390, type: 'personal' }
            ],
            thursday: [
                { time: '08:00', title: 'Wake up & Morning Routine', description: 'Wake up, brush teeth, freshen up (Weekend)', duration: 60, type: 'personal', special: 'weekend' },
                { time: '09:00', title: 'Exercise & Workout', description: 'Physical exercise and fitness routine', duration: 90, type: 'health', special: 'weekend' },
                { time: '10:30', title: 'Breakfast', description: 'Healthy breakfast and coffee', duration: 45, type: 'personal', special: 'weekend' },
                { time: '11:15', title: 'Web Development Study', description: 'Intensive coding and learning session', duration: 180, type: 'study', special: 'weekend' },
                { time: '14:15', title: 'Lunch Break', description: 'Lunch and short rest', duration: 45, type: 'personal', special: 'weekend' },
                { time: '15:00', title: 'Project Work', description: 'Work on personal coding projects', duration: 180, type: 'work', special: 'weekend' },
                { time: '18:00', title: 'Evening Activities', description: 'Hobbies, reading, or personal time', duration: 120, type: 'personal', special: 'weekend' },
                { time: '20:00', title: 'Dinner', description: 'Evening meal with family', duration: 60, type: 'personal', special: 'weekend' },
                { time: '21:00', title: 'Relaxation & Entertainment', description: 'Watch movies, play games, or relax', duration: 120, type: 'personal', special: 'weekend' },
                { time: '23:00', title: 'Prepare for Tomorrow', description: 'Plan next day, prepare clothes', duration: 30, type: 'personal', special: 'weekend' },
                { time: '23:30', title: 'Sleep', description: 'Go to bed for good night sleep', duration: 510, type: 'personal', special: 'weekend' }
            ],
            friday: [
                { time: '08:00', title: 'Wake up & Morning Routine', description: 'Wake up, brush teeth, freshen up (Weekend)', duration: 60, type: 'personal', special: 'weekend' },
                { time: '09:00', title: 'Exercise & Workout', description: 'Physical exercise and fitness routine', duration: 90, type: 'health', special: 'weekend' },
                { time: '10:30', title: 'Breakfast', description: 'Healthy breakfast and coffee', duration: 45, type: 'personal', special: 'weekend' },
                { time: '11:15', title: 'Web Development Study', description: 'Intensive coding and learning session', duration: 45, type: 'study', special: 'weekend' },
                { time: '12:00', title: 'Jummah Prayer', description: 'Friday Prayer and Religious Ceremony (12:00 PM - 2:00 PM)', duration: 120, type: 'religious', special: 'religious-time' },
                { time: '14:00', title: 'Lunch Break', description: 'Lunch after prayer', duration: 45, type: 'personal', special: 'weekend' },
                { time: '14:45', title: 'Project Work', description: 'Work on personal coding projects', duration: 180, type: 'work', special: 'weekend' },
                { time: '17:45', title: 'Evening Activities', description: 'Hobbies, reading, or personal time', duration: 120, type: 'personal', special: 'weekend' },
                { time: '19:45', title: 'Dinner', description: 'Evening meal with family', duration: 60, type: 'personal', special: 'weekend' },
                { time: '20:45', title: 'Relaxation & Entertainment', description: 'Watch movies, play games, or relax', duration: 120, type: 'personal', special: 'weekend' },
                { time: '22:45', title: 'Prepare for Tomorrow', description: 'Plan next day, prepare clothes', duration: 30, type: 'personal', special: 'weekend' },
                { time: '23:15', title: 'Sleep', description: 'Go to bed for good night sleep', duration: 525, type: 'personal', special: 'weekend' }
            ]
        };
        
        return routines;
    }

    loadRoutines() {
        const saved = localStorage.getItem('dailyRoutineData');
        if (saved) {
            return JSON.parse(saved);
        }
        return this.getRoutineData();
    }

    saveRoutines() {
        localStorage.setItem('dailyRoutineData', JSON.stringify(this.routines));
    }

    getTaskStatus(task, index) {
        if (task.completed) return 'completed';
        if (task.missed) return 'missed';
        if (task.skipped) return 'missed';
        
        // Default to pending for all non-completed tasks
        return 'pending';
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const bangladeshTime = new Date().toLocaleString("en-US", {timeZone: this.bangladeshTimeZone});
        const date = new Date(bangladeshTime);
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    formatTimeRange(startTime, endTime) {
        const formatTime = (date) => {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };
        
        const start = formatTime(startTime);
        const end = formatTime(endTime);
        
        return `${start} - ${end}`;
    }

    updateTaskStatuses() {
        const tasks = document.querySelectorAll('.task-item');
        tasks.forEach((taskElement, index) => {
            const task = this.routines[this.currentDay][index];
            const status = this.getTaskStatus(task, index);
            
            taskElement.className = `task-item ${status}`;
            if (task.special) {
                taskElement.classList.add(task.special);
            }
        });
    }

    renderRoutine() {
        const routineContainer = document.getElementById('routineSchedule');
        const dayRoutine = this.routines[this.currentDay] || [];
        
        // Sort tasks by time and status
        const sortedTasks = this.sortTasksByTimeAndStatus(dayRoutine);
        
        routineContainer.innerHTML = '';
        
        sortedTasks.forEach((task, index) => {
            const status = this.getTaskStatus(task, index);
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${status}`;
            if (task.special) {
                taskElement.classList.add(task.special);
            }
            
            // Calculate end time
            const startTime = this.parseTime(task.time);
            const endTime = new Date(startTime.getTime() + task.duration * 60000);
            const timeRange = this.formatTimeRange(startTime, endTime);
            
            // Find original index for button actions
            const originalIndex = dayRoutine.findIndex(t => t === task);
            
            // Add position indicator
            const positionIndicator = status === 'completed' ? '✅ DONE' : 
                                    status === 'missed' ? '⏰ TIME OVER' : '⏳ UPCOMING';

            taskElement.innerHTML = `
                <div class="task-position">
                    <span class="position-indicator">${positionIndicator}</span>
                </div>
                <div class="task-time">${timeRange}</div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description}</div>
                </div>
                <div class="task-actions">
                    ${status === 'completed' ? `
                        <button class="action-btn incomplete-btn" onclick="routineTracker.markIncomplete(${originalIndex})">
                            <i class="fas fa-undo"></i> Incomplete
                        </button>
                    ` : `
                        <button class="action-btn complete-btn" onclick="routineTracker.completeTask(${originalIndex})">
                            <i class="fas fa-check"></i> Complete
                        </button>
                        <button class="action-btn missed-btn" onclick="routineTracker.markMissed(${originalIndex})">
                            <i class="fas fa-times"></i> Missed
                        </button>
                    `}
                </div>
            `;
            
            routineContainer.appendChild(taskElement);
        });
        
        this.updateStats();
    }

    sortTasksByTimeAndStatus(tasks) {
        const now = this.currentTime;
        
        return tasks.sort((a, b) => {
            const aStartTime = this.parseTime(a.time);
            const aEndTime = new Date(aStartTime.getTime() + a.duration * 60000);
            const bStartTime = this.parseTime(b.time);
            const bEndTime = new Date(bStartTime.getTime() + b.duration * 60000);
            
            // Get status for each task
            const aStatus = this.getTaskStatusByTime(a, aStartTime, aEndTime, now);
            const bStatus = this.getTaskStatusByTime(b, bStartTime, bEndTime, now);
            
            // Define priority order: pending > completed > missed
            const statusPriority = {
                'pending': 1,
                'completed': 2,
                'missed': 3
            };
            
            const aPriority = statusPriority[aStatus] || 6;
            const bPriority = statusPriority[bStatus] || 6;
            
            // If different priorities, sort by priority
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            
            // If same priority, sort by time
            if (aPriority === 1) {
                // For pending tasks, sort by start time (chronological order)
                return aStartTime - bStartTime;
            } else if (aPriority === 2) {
                // For completed tasks, sort by start time (chronological order)
                return aStartTime - bStartTime;
            } else {
                // For missed tasks, sort by end time (most recent first)
                return bEndTime - aEndTime;
            }
        });
    }

    getTaskStatusByTime(task, startTime, endTime, now) {
        if (task.completed) return 'completed';
        if (task.missed) return 'missed';
        if (task.skipped) return 'missed';
        
        // Default to pending for all non-completed tasks
        return 'pending';
    }

    completeTask(index) {
        const task = this.routines[this.currentDay][index];
        task.completed = true;
        task.completedAt = new Date().toISOString();
        
        // Store in report database
        this.storeTaskInReport(task, 'completed');
        
        this.saveRoutines();
        
        // Update statistics
        this.updateStats();
        
        // Re-render with new sorting
        this.renderRoutine();
        
        // Show success notification
        this.showNotification('Task completed! Great job!', 'success');
        
        // Add completion animation
        this.animateTaskCompletion();
    }

    skipTask(index) {
        const task = this.routines[this.currentDay][index];
        task.skipped = true;
        task.skippedAt = new Date().toISOString();
        
        // Store in report database
        this.storeTaskInReport(task, 'missed');
        
        this.saveRoutines();
        
        // Update statistics
        this.updateStats();
        
        // Re-render with new sorting
        this.renderRoutine();
        
        // Show warning notification
        this.showNotification('Task skipped. Try to complete it next time!', 'warning');
    }

    markIncomplete(index) {
        const task = this.routines[this.currentDay][index];
        
        // Reset task status
        task.completed = false;
        task.skipped = false;
        task.missed = false;
        delete task.completedAt;
        delete task.skippedAt;
        delete task.missedAt;
        
        this.saveRoutines();
        
        // Update statistics
        this.updateStats();
        
        // Re-render with new sorting
        this.renderRoutine();
        
        // Show notification
        this.showNotification('Task marked as incomplete!', 'info');
    }

    markMissed(index) {
        const task = this.routines[this.currentDay][index];
        
        // Mark task as missed
        task.completed = false;
        task.skipped = false;
        task.missed = true;
        task.missedAt = new Date().toISOString();
        delete task.completedAt;
        delete task.skippedAt;
        
        // Store in report database
        this.storeTaskInReport(task, 'missed');
        
        this.saveRoutines();
        
        // Update statistics
        this.updateStats();
        
        // Re-render with new sorting
        this.renderRoutine();
        
        // Show notification
        this.showNotification('Task marked as missed!', 'warning');
    }

    animateTaskCompletion() {
        // Find the completed task and add animation
        const completedTasks = document.querySelectorAll('.task-item.completed');
        if (completedTasks.length > 0) {
            const lastCompleted = completedTasks[completedTasks.length - 1];
            lastCompleted.style.animation = 'slideDown 0.5s ease-out';
            
            setTimeout(() => {
                lastCompleted.style.animation = '';
            }, 500);
        }
    }

    updateStats() {
        const dayRoutine = this.routines[this.currentDay] || [];
        const completed = dayRoutine.filter(task => task.completed).length;
        const missed = dayRoutine.filter(task => task.skipped || task.missed).length;
        
        // Count tasks that are not completed and not missed as "In Progress"
        const inProgress = dayRoutine.filter(task => !task.completed && !task.skipped && !task.missed).length;
        
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('inProgressCount').textContent = inProgress;
        document.getElementById('missedCount').textContent = missed;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : type === 'warning' ? '#ed8936' : '#4299e1'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    exportData() {
        const dataStr = JSON.stringify(this.routines, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'daily-routine-data.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.routines = data;
                    this.saveRoutines();
                    this.renderRoutine();
                    this.showNotification('Data imported successfully!', 'success');
                } catch (error) {
                    this.showNotification('Error importing data. Please check the file format.', 'warning');
                }
            };
            reader.readAsText(file);
        }
    }

    // Dashboard Methods
    updateDashboardOverview() {
        this.updateWeekStats();
        this.updateTaskTypesChart();
    }

    updateWeekStats() {
        const weekStats = document.getElementById('weekStats');
        const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const dayNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        weekStats.innerHTML = '';
        
        days.forEach((day, index) => {
            const dayRoutine = this.routines[day] || [];
            const completed = dayRoutine.filter(task => task.completed).length;
            const total = dayRoutine.length;
            
            const dayStat = document.createElement('div');
            dayStat.className = 'day-stat';
            dayStat.innerHTML = `
                <div class="day-name">${dayNames[index]}</div>
                <div class="task-count">${completed}/${total}</div>
            `;
            weekStats.appendChild(dayStat);
        });
    }

    updateTaskTypesChart() {
        const taskTypesChart = document.getElementById('taskTypesChart');
        const typeCounts = {};
        
        Object.values(this.routines).forEach(dayRoutine => {
            dayRoutine.forEach(task => {
                typeCounts[task.type] = (typeCounts[task.type] || 0) + 1;
            });
        });
        
        taskTypesChart.innerHTML = '';
        
        Object.entries(typeCounts).forEach(([type, count]) => {
            const typeItem = document.createElement('div');
            typeItem.className = 'task-type-item';
            typeItem.innerHTML = `
                <span class="task-type-name">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <span class="task-type-count">${count}</span>
            `;
            taskTypesChart.appendChild(typeItem);
        });
    }

    updateTasksList() {
        const selectedDay = document.getElementById('dashboardDaySelect').value;
        const tasksList = document.getElementById('tasksList');
        const dayRoutine = this.routines[selectedDay] || [];
        
        tasksList.innerHTML = '';
        
        dayRoutine.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item-dashboard';
            
            const startTime = this.parseTime(task.time);
            const endTime = new Date(startTime.getTime() + task.duration * 60000);
            const timeRange = this.formatTimeRange(startTime, endTime);
            
            taskElement.innerHTML = `
                <div class="task-time-dashboard">${timeRange}</div>
                <div class="task-content-dashboard">
                    <div class="task-title-dashboard">${task.title}</div>
                    <div class="task-description-dashboard">${task.description}</div>
                </div>
                <div class="task-actions-dashboard">
                    <button class="action-btn-dashboard edit-btn" onclick="routineTracker.editTask('${selectedDay}', ${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn-dashboard delete-btn" onclick="routineTracker.deleteTask('${selectedDay}', ${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            tasksList.appendChild(taskElement);
        });
    }

    addNewTask() {
        const day = document.getElementById('newTaskDay').value;
        const time = document.getElementById('newTaskTime').value;
        const duration = parseInt(document.getElementById('newTaskDuration').value);
        const title = document.getElementById('newTaskTitle').value;
        const description = document.getElementById('newTaskDescription').value;
        const type = document.getElementById('newTaskType').value;
        const special = document.getElementById('newTaskSpecial').value;
        
        const newTask = {
            time: time,
            title: title,
            description: description,
            duration: duration,
            type: type,
            completed: false,
            skipped: false
        };
        
        if (special) {
            newTask.special = special;
        }
        
        if (!this.routines[day]) {
            this.routines[day] = [];
        }
        
        this.routines[day].push(newTask);
        
        // Sort tasks by time
        this.routines[day].sort((a, b) => {
            const timeA = this.parseTime(a.time);
            const timeB = this.parseTime(b.time);
            return timeA - timeB;
        });
        
        this.saveRoutines();
        this.renderRoutine();
        this.updateTasksList();
        
        // Reset form
        document.getElementById('addTaskForm').reset();
        
        this.showNotification('Task added successfully!', 'success');
    }

    editTask(day, index) {
        const task = this.routines[day][index];
        
        // Create edit modal
        const editModal = document.createElement('div');
        editModal.className = 'modal';
        editModal.style.display = 'block';
        editModal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Edit Task</h2>
                <form id="editTaskForm">
                    <div class="form-group">
                        <label>Time:</label>
                        <input type="time" id="editTaskTime" value="${task.time}" required>
                    </div>
                    <div class="form-group">
                        <label>Duration (minutes):</label>
                        <input type="number" id="editTaskDuration" value="${task.duration}" min="5" max="480" required>
                    </div>
                    <div class="form-group">
                        <label>Title:</label>
                        <input type="text" id="editTaskTitle" value="${task.title}" required>
                    </div>
                    <div class="form-group">
                        <label>Description:</label>
                        <textarea id="editTaskDescription" rows="3">${task.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Type:</label>
                        <select id="editTaskType">
                            <option value="personal" ${task.type === 'personal' ? 'selected' : ''}>Personal</option>
                            <option value="study" ${task.type === 'study' ? 'selected' : ''}>Study</option>
                            <option value="work" ${task.type === 'work' ? 'selected' : ''}>Work</option>
                            <option value="health" ${task.type === 'health' ? 'selected' : ''}>Health</option>
                            <option value="class" ${task.type === 'class' ? 'selected' : ''}>Class</option>
                            <option value="religious" ${task.type === 'religious' ? 'selected' : ''}>Religious</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Special Category:</label>
                        <select id="editTaskSpecial">
                            <option value="">None</option>
                            <option value="class-time" ${task.special === 'class-time' ? 'selected' : ''}>Class Time</option>
                            <option value="religious-time" ${task.special === 'religious-time' ? 'selected' : ''}>Religious Time</option>
                            <option value="weekend" ${task.special === 'weekend' ? 'selected' : ''}>Weekend</option>
                        </select>
                    </div>
                    <button type="submit" class="add-task-btn">Update Task</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(editModal);
        
        // Close modal
        editModal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(editModal);
        });
        
        // Submit form
        editModal.querySelector('#editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            task.time = document.getElementById('editTaskTime').value;
            task.duration = parseInt(document.getElementById('editTaskDuration').value);
            task.title = document.getElementById('editTaskTitle').value;
            task.description = document.getElementById('editTaskDescription').value;
            task.type = document.getElementById('editTaskType').value;
            
            const special = document.getElementById('editTaskSpecial').value;
            if (special) {
                task.special = special;
            } else {
                delete task.special;
            }
            
            // Sort tasks by time
            this.routines[day].sort((a, b) => {
                const timeA = this.parseTime(a.time);
                const timeB = this.parseTime(b.time);
                return timeA - timeB;
            });
            
            this.saveRoutines();
            this.renderRoutine();
            this.updateTasksList();
            
            document.body.removeChild(editModal);
            this.showNotification('Task updated successfully!', 'success');
        });
    }

    deleteTask(day, index) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.routines[day].splice(index, 1);
            this.saveRoutines();
            this.renderRoutine();
            this.updateTasksList();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    // New Settings Page Methods
    displayAllRoutines() {
        const routinesGrid = document.getElementById('routinesGrid');
        const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        routinesGrid.innerHTML = '';
        
        days.forEach((day, index) => {
            const dayRoutine = this.routines[day] || [];
            const completed = dayRoutine.filter(task => task.completed).length;
            const total = dayRoutine.length;
            
            const dayCard = document.createElement('div');
            dayCard.className = 'day-routine-card';
            
            dayCard.innerHTML = `
                <div class="day-routine-header">
                    <span>${dayNames[index]}</span>
                    <span>${completed}/${total} tasks</span>
                </div>
                <div class="day-routine-tasks">
                    ${dayRoutine.map((task, taskIndex) => {
                        const startTime = this.parseTime(task.time);
                        const endTime = new Date(startTime.getTime() + task.duration * 60000);
                        const timeRange = this.formatTimeRange(startTime, endTime);
                        
                        return `
                            <div class="routine-task-item">
                                <div class="routine-task-time">${timeRange}</div>
                                <div class="routine-task-content">
                                    <div class="routine-task-title">${task.title}</div>
                                    <div class="routine-task-description">${task.description}</div>
                                </div>
                                <div class="routine-task-actions">
                                    <button class="routine-action-btn routine-edit-btn" onclick="routineTracker.editTaskFromSettings('${day}', ${taskIndex})">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="routine-action-btn routine-delete-btn" onclick="routineTracker.deleteTaskFromSettings('${day}', ${taskIndex})">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            routinesGrid.appendChild(dayCard);
        });
    }

    openTaskForm(day = null, taskIndex = null) {
        const taskFormModal = document.getElementById('taskFormModal');
        const taskFormTitle = document.getElementById('taskFormTitle');
        const taskForm = document.getElementById('taskForm');
        
        // Reset form
        taskForm.reset();
        
        if (day && taskIndex !== null) {
            // Edit mode
            const task = this.routines[day][taskIndex];
            taskFormTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Task';
            document.getElementById('taskDay').value = day;
            document.getElementById('taskTime').value = task.time;
            document.getElementById('taskDuration').value = task.duration;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskType').value = task.type;
            document.getElementById('taskSpecial').value = task.special || '';
            
            // Store edit data
            taskForm.dataset.editDay = day;
            taskForm.dataset.editIndex = taskIndex;
        } else {
            // Add mode
            taskFormTitle.innerHTML = '<i class="fas fa-plus"></i> Add New Task';
            delete taskForm.dataset.editDay;
            delete taskForm.dataset.editIndex;
        }
        
        taskFormModal.style.display = 'block';
    }

    saveTask() {
        const taskForm = document.getElementById('taskForm');
        const day = document.getElementById('taskDay').value;
        const time = document.getElementById('taskTime').value;
        const duration = parseInt(document.getElementById('taskDuration').value);
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const type = document.getElementById('taskType').value;
        const special = document.getElementById('taskSpecial').value;
        
        const taskData = {
            time: time,
            title: title,
            description: description,
            duration: duration,
            type: type,
            completed: false,
            skipped: false
        };
        
        if (special) {
            taskData.special = special;
        }
        
        // Check if editing existing task
        if (taskForm.dataset.editDay && taskForm.dataset.editIndex !== undefined) {
            // Edit existing task
            const editDay = taskForm.dataset.editDay;
            const editIndex = parseInt(taskForm.dataset.editIndex);
            
            this.routines[editDay][editIndex] = taskData;
            
            // Sort tasks by time
            this.routines[editDay].sort((a, b) => {
                const timeA = this.parseTime(a.time);
                const timeB = this.parseTime(b.time);
                return timeA - timeB;
            });
            
            this.showNotification('Task updated successfully!', 'success');
        } else {
            // Add new task
            if (!this.routines[day]) {
                this.routines[day] = [];
            }
            
            this.routines[day].push(taskData);
            
            // Sort tasks by time
            this.routines[day].sort((a, b) => {
                const timeA = this.parseTime(a.time);
                const timeB = this.parseTime(b.time);
                return timeA - timeB;
            });
            
            this.showNotification('Task added successfully!', 'success');
        }
        
        this.saveRoutines();
        this.renderRoutine();
        this.displayAllRoutines();
        
        // Close modal
        document.getElementById('taskFormModal').style.display = 'none';
    }

    editTaskFromSettings(day, index) {
        this.openTaskForm(day, index);
    }

    deleteTaskFromSettings(day, index) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.routines[day].splice(index, 1);
            this.saveRoutines();
            this.renderRoutine();
            this.displayAllRoutines();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    // Report functionality
    initializeReport() {
        const generateReportBtn = document.getElementById('generateReport');
        generateReportBtn.addEventListener('click', () => {
            this.generateReport();
        });

        const clearReportDataBtn = document.getElementById('clearReportData');
        clearReportDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all report data? This action cannot be undone.')) {
                this.clearReportData();
            }
        });

        // Set current month and year as default
        const now = new Date();
        document.getElementById('reportMonth').value = now.getMonth() + 1;
        document.getElementById('reportYear').value = now.getFullYear();
    }

    generateReport() {
        const month = parseInt(document.getElementById('reportMonth').value);
        const year = parseInt(document.getElementById('reportYear').value);
        const reportType = document.getElementById('reportType').value;

        // Generate mock data for demonstration
        const reportData = this.generateMockReportData(month, year);
        
        this.displayReport(reportData, reportType);
        document.getElementById('reportResults').style.display = 'block';
    }

    generateMockReportData(month, year) {
        // Load actual report data
        const reportData = this.loadReportData();
        
        const daysInMonth = new Date(year, month, 0).getDate();
        const report = {
            month: month,
            year: year,
            totalDays: daysInMonth,
            totalTasks: 0,
            completedTasks: 0,
            missedTasks: 0,
            completionRate: 0,
            dailyStats: [],
            reportData: reportData // Include raw data for detailed reports
        };

        // Calculate stats for the selected month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayStats = this.calculateDayStats(reportData, dateStr);
            
            report.totalTasks += dayStats.totalTasks;
            report.completedTasks += dayStats.completed;
            report.missedTasks += dayStats.missed;
            
            report.dailyStats.push({
                date: dateStr,
                totalTasks: dayStats.totalTasks,
                completed: dayStats.completed,
                missed: dayStats.missed,
                completionRate: dayStats.completionRate
            });
        }

        report.completionRate = report.totalTasks > 0 ? Math.round((report.completedTasks / report.totalTasks) * 100) : 0;
        return report;
    }

    displayReport(data, reportType) {
        const reportSummary = document.getElementById('reportSummary');
        const reportCharts = document.getElementById('reportCharts');
        const reportDetails = document.getElementById('reportDetails');

        // Display summary
        reportSummary.innerHTML = `
            <div class="summary-card">
                <h4>Total Tasks</h4>
                <div class="value">${data.totalTasks}</div>
            </div>
            <div class="summary-card">
                <h4>Completed</h4>
                <div class="value" style="color: #48bb78;">${data.completedTasks}</div>
            </div>
            <div class="summary-card">
                <h4>Missed</h4>
                <div class="value" style="color: #e53e3e;">${data.missedTasks}</div>
            </div>
            <div class="summary-card">
                <h4>Completion Rate</h4>
                <div class="value" style="color: #667eea;">${data.completionRate}%</div>
            </div>
        `;

        // Display charts
        reportCharts.innerHTML = `
            <div class="chart-container">
                <h4>Daily Completion Trend</h4>
                <div style="height: 200px; background: #f7fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #718096;">
                    📊 Chart visualization would go here
                </div>
            </div>
        `;

        // Display details based on report type
        let detailsHTML = '';
        if (reportType === 'daily') {
            detailsHTML = '<h4>Daily Task Details</h4>';
            data.dailyStats.forEach(day => {
                const dayTasks = this.getDayTaskDetails(data.reportData, day.date);
                detailsHTML += `
                    <div class="detail-item">
                        <div class="detail-date">${this.formatDate(day.date)}</div>
                        <div class="detail-stats">
                            <div class="stat-item">
                                <div class="stat-value">${day.totalTasks}</div>
                                <div class="stat-label">Total</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" style="color: #48bb78;">${day.completed}</div>
                                <div class="stat-label">Completed</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" style="color: #e53e3e;">${day.missed}</div>
                                <div class="stat-label">Missed</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" style="color: #667eea;">${day.completionRate}%</div>
                                <div class="stat-label">Rate</div>
                            </div>
                        </div>
                        ${dayTasks.completed.length > 0 || dayTasks.missed.length > 0 ? `
                            <div class="task-details">
                                ${dayTasks.completed.length > 0 ? `
                                    <div class="completed-tasks">
                                        <h5 style="color: #48bb78; margin: 10px 0 5px 0;">✅ Completed Tasks:</h5>
                                        ${dayTasks.completed.map(task => `
                                            <div class="task-item completed">
                                                <span class="task-time">${task.time}</span>
                                                <span class="task-title">${task.title}</span>
                                                <span class="task-status">Completed at ${this.formatTime(task.timestamp)}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                ${dayTasks.missed.length > 0 ? `
                                    <div class="missed-tasks">
                                        <h5 style="color: #e53e3e; margin: 10px 0 5px 0;">❌ Missed Tasks:</h5>
                                        ${dayTasks.missed.map(task => `
                                            <div class="task-item missed">
                                                <span class="task-time">${task.time}</span>
                                                <span class="task-title">${task.title}</span>
                                                <span class="task-status">Missed at ${this.formatTime(task.timestamp)}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        } else if (reportType === 'weekly') {
            detailsHTML = '<h4>Weekly Breakdown</h4>';
            const weeks = this.groupByWeeks(data.dailyStats);
            weeks.forEach((week, index) => {
                const weekTotal = week.reduce((sum, day) => sum + day.totalTasks, 0);
                const weekCompleted = week.reduce((sum, day) => sum + day.completed, 0);
                const weekMissed = week.reduce((sum, day) => sum + day.missed, 0);
                const weekRate = Math.round((weekCompleted / weekTotal) * 100);
                
                detailsHTML += `
                    <div class="detail-item">
                        <div class="detail-date">Week ${index + 1} (${week[0].date} - ${week[week.length-1].date})</div>
                        <div class="detail-stats">
                            <div class="stat-item">
                                <div class="stat-value">${weekTotal}</div>
                                <div class="stat-label">Total</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" style="color: #48bb78;">${weekCompleted}</div>
                                <div class="stat-label">Completed</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" style="color: #e53e3e;">${weekMissed}</div>
                                <div class="stat-label">Missed</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" style="color: #667eea;">${weekRate}%</div>
                                <div class="stat-label">Rate</div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            detailsHTML = '<h4>Monthly Summary</h4>';
            detailsHTML += `
                <div class="detail-item">
                    <div class="detail-date">${this.getMonthName(data.month)} ${data.year}</div>
                    <div class="detail-stats">
                        <div class="stat-item">
                            <div class="stat-value">${data.totalTasks}</div>
                            <div class="stat-label">Total Tasks</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="color: #48bb78;">${data.completedTasks}</div>
                            <div class="stat-label">Completed</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="color: #e53e3e;">${data.missedTasks}</div>
                            <div class="stat-label">Missed</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="color: #667eea;">${data.completionRate}%</div>
                            <div class="stat-label">Success Rate</div>
                        </div>
                    </div>
                </div>
            `;
        }

        reportDetails.innerHTML = detailsHTML;
    }

    groupByWeeks(dailyStats) {
        const weeks = [];
        for (let i = 0; i < dailyStats.length; i += 7) {
            weeks.push(dailyStats.slice(i, i + 7));
        }
        return weeks;
    }

    getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    }

    // Report data management methods
    storeTaskInReport(task, status) {
        const reportData = this.loadReportData();
        const today = new Date().toISOString().split('T')[0];
        
        const taskRecord = {
            id: Date.now() + Math.random(),
            title: task.title,
            description: task.description,
            time: task.time,
            duration: task.duration,
            type: task.type,
            day: this.currentDay,
            status: status,
            timestamp: new Date().toISOString(),
            date: today
        };

        if (status === 'completed') {
            reportData.completedTasks.push(taskRecord);
        } else if (status === 'missed') {
            reportData.missedTasks.push(taskRecord);
        }

        // Update daily stats
        if (!reportData.dailyStats[today]) {
            reportData.dailyStats[today] = {
                totalTasks: 0,
                completed: 0,
                missed: 0
            };
        }

        reportData.dailyStats[today].totalTasks++;
        if (status === 'completed') {
            reportData.dailyStats[today].completed++;
        } else if (status === 'missed') {
            reportData.dailyStats[today].missed++;
        }

        reportData.lastUpdated = new Date().toISOString();
        this.saveReportData(reportData);
    }

    loadReportData() {
        try {
            const data = localStorage.getItem('reportData');
            return data ? JSON.parse(data) : {
                completedTasks: [],
                missedTasks: [],
                dailyStats: {},
                monthlyStats: {},
                lastUpdated: null
            };
        } catch (error) {
            console.error('Error loading report data:', error);
            return {
                completedTasks: [],
                missedTasks: [],
                dailyStats: {},
                monthlyStats: {},
                lastUpdated: null
            };
        }
    }

    saveReportData(data) {
        try {
            localStorage.setItem('reportData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving report data:', error);
        }
    }

    clearReportData() {
        try {
            localStorage.removeItem('reportData');
            this.showNotification('Report data cleared successfully!', 'success');
        } catch (error) {
            console.error('Error clearing report data:', error);
            this.showNotification('Error clearing report data!', 'error');
        }
    }

    calculateDayStats(reportData, dateStr) {
        const dayStats = reportData.dailyStats[dateStr] || {
            totalTasks: 0,
            completed: 0,
            missed: 0
        };

        const completionRate = dayStats.totalTasks > 0 ? 
            Math.round((dayStats.completed / dayStats.totalTasks) * 100) : 0;

        return {
            totalTasks: dayStats.totalTasks,
            completed: dayStats.completed,
            missed: dayStats.missed,
            completionRate: completionRate
        };
    }

    getDayTaskDetails(reportData, dateStr) {
        const completed = reportData.completedTasks.filter(task => task.date === dateStr);
        const missed = reportData.missedTasks.filter(task => task.date === dateStr);
        
        return {
            completed: completed,
            missed: missed
        };
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Dhaka'
        });
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the application
const routineTracker = new DailyRoutineTracker();
