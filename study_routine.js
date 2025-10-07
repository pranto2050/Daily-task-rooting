class StudyRoutineTracker {
    constructor() {
        this.subjects = this.loadSubjects();
        this.currentTime = new Date();
        this.bangladeshTimeZone = 'Asia/Dhaka';
        this.isEditing = false;
        this.editingIndex = -1;
        
        this.initializeDefaultSubjects();
        this.updateTime();
        this.renderStudySchedule();
        this.renderSubjects();
        this.updateStats();
        this.setupEventListeners();
        
        // Update time every second
        this.updateInterval = setInterval(() => {
            this.updateTime();
            this.updateSessionStatuses();
        }, 1000);
    }

    initializeDefaultSubjects() {
        if (this.subjects.length === 0) {
            this.subjects = [
                {
                    id: 1,
                    name: "Fajr Prayer",
                    startTime: "05:00",
                    endTime: "05:15",
                    description: "Dawn prayer - First prayer of the day",
                    type: "prayer",
                    isEditable: true,
                    prayerType: "fajr"
                },
                {
                    id: 2,
                    name: "Morning Revision",
                    startTime: "06:00",
                    endTime: "07:00",
                    description: "Review yesterday's topics and prepare for today",
                    type: "study"
                },
                {
                    id: 3,
                    name: "Breakfast",
                    startTime: "07:00",
                    endTime: "07:30",
                    description: "Healthy breakfast and coffee",
                    type: "meal"
                },
                {
                    id: 4,
                    name: "Mathematics",
                    startTime: "07:30",
                    endTime: "09:00",
                    description: "Solve problems and practice concepts",
                    type: "study"
                },
                {
                    id: 5,
                    name: "Short Break",
                    startTime: "09:00",
                    endTime: "09:15",
                    description: "Rest and refresh",
                    type: "break"
                },
                {
                    id: 6,
                    name: "Physics",
                    startTime: "09:15",
                    endTime: "10:45",
                    description: "Theoretical concepts and problem solving",
                    type: "study"
                },
                {
                    id: 7,
                    name: "Chemistry",
                    startTime: "10:45",
                    endTime: "12:00",
                    description: "Organic and inorganic chemistry",
                    type: "study"
                },
                {
                    id: 8,
                    name: "Dhuhr Prayer",
                    startTime: "12:00",
                    endTime: "12:15",
                    description: "Midday prayer - Second prayer of the day",
                    type: "prayer",
                    isEditable: true,
                    prayerType: "dhuhr"
                },
                {
                    id: 9,
                    name: "Lunch Break",
                    startTime: "12:15",
                    endTime: "12:45",
                    description: "Lunch and rest",
                    type: "meal"
                },
                {
                    id: 10,
                    name: "English",
                    startTime: "12:45",
                    endTime: "13:45",
                    description: "Grammar, vocabulary, and literature",
                    type: "study"
                },
                {
                    id: 11,
                    name: "Biology",
                    startTime: "13:45",
                    endTime: "14:45",
                    description: "Botany and zoology concepts",
                    type: "study"
                },
                {
                    id: 12,
                    name: "Asr Prayer",
                    startTime: "15:00",
                    endTime: "15:15",
                    description: "Afternoon prayer - Third prayer of the day",
                    type: "prayer",
                    isEditable: true,
                    prayerType: "asr"
                },
                {
                    id: 13,
                    name: "Evening Break",
                    startTime: "15:15",
                    endTime: "15:45",
                    description: "Rest and light snack",
                    type: "break"
                },
                {
                    id: 14,
                    name: "Computer Science",
                    startTime: "15:45",
                    endTime: "16:45",
                    description: "Programming and theory",
                    type: "study"
                },
                {
                    id: 15,
                    name: "Maghrib Prayer",
                    startTime: "18:00",
                    endTime: "18:15",
                    description: "Sunset prayer - Fourth prayer of the day",
                    type: "prayer",
                    isEditable: true,
                    prayerType: "maghrib"
                },
                {
                    id: 16,
                    name: "Isha Prayer",
                    startTime: "19:30",
                    endTime: "19:45",
                    description: "Night prayer - Fifth prayer of the day",
                    type: "prayer",
                    isEditable: true,
                    prayerType: "isha"
                },
                {
                    id: 17,
                    name: "Sleep",
                    startTime: "20:00",
                    endTime: "22:00",
                    description: "Power nap for better focus",
                    type: "sleep"
                }
            ];
            this.saveSubjects();
        }
    }

    updateTime() {
        const bangladeshTime = new Date().toLocaleString("en-US", {timeZone: this.bangladeshTimeZone});
        this.currentTime = new Date(bangladeshTime);
    }

    getCurrentTimeString() {
        return this.currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: this.bangladeshTimeZone
        });
    }

    getSessionStatus(session) {
        const now = this.currentTime;
        const startTime = this.parseTime(session.startTime);
        const endTime = this.parseTime(session.endTime);
        
        if (session.completed) return 'completed';
        if (session.missed) return 'missed';
        if (now >= startTime && now <= endTime) return 'current';
        if (now > endTime) return 'overdue';
        return 'upcoming';
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const time = new Date();
        time.setHours(hours, minutes, 0, 0);
        return time;
    }

    renderStudySchedule() {
        const container = document.getElementById('studySessions');
        container.innerHTML = '';

        // Sort subjects by start time
        const sortedSubjects = [...this.subjects].sort((a, b) => 
            a.startTime.localeCompare(b.startTime)
        );

        sortedSubjects.forEach((subject, index) => {
            const status = this.getSessionStatus(subject);
            const sessionElement = document.createElement('div');
            sessionElement.className = `study-session ${status} ${subject.type}`;
            
            const timeRange = `${subject.startTime} - ${subject.endTime}`;
            const duration = this.calculateDuration(subject.startTime, subject.endTime);
            
            // Special handling for prayer times
            const isPrayer = subject.type === 'prayer';
            const prayerIcon = isPrayer ? '<i class="fas fa-mosque"></i> ' : '';
            const timeClickable = isPrayer && subject.isEditable ? 'clickable-time' : '';
            
            sessionElement.innerHTML = `
                <div class="session-time ${timeClickable}" ${isPrayer && subject.isEditable ? `onclick="studyTracker.editPrayerTime(${index})"` : ''}>
                    ${timeRange}
                    ${isPrayer && subject.isEditable ? '<i class="fas fa-edit edit-time-icon"></i>' : ''}
                </div>
                <div class="session-content">
                    <div class="session-title">${prayerIcon}${subject.name}</div>
                    <div class="session-description">${subject.description}</div>
                    <span class="session-subject ${subject.type}">${subject.type.toUpperCase()}</span>
                </div>
                <div class="session-actions">
                    ${status === 'completed' ? `
                        <button class="session-btn incomplete-btn" onclick="studyTracker.markIncomplete(${index})">
                            <i class="fas fa-undo"></i> Undo
                        </button>
                    ` : `
                        <button class="session-btn complete-btn" onclick="studyTracker.completeSession(${index})">
                            <i class="fas fa-check"></i> Complete
                        </button>
                        <button class="session-btn missed-btn" onclick="studyTracker.missSession(${index})">
                            <i class="fas fa-times"></i> Miss
                        </button>
                    `}
                    ${isPrayer ? `
                        <button class="session-btn edit-btn" onclick="studyTracker.editPrayerTime(${index})" title="Edit Prayer Time">
                            <i class="fas fa-clock"></i>
                        </button>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(sessionElement);
        });
    }

    calculateDuration(startTime, endTime) {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m`;
        }
        return `${diffMinutes}m`;
    }

    renderSubjects() {
        const container = document.getElementById('subjectsList');
        container.innerHTML = '';

        this.subjects.forEach((subject, index) => {
            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card';
            
            subjectCard.innerHTML = `
                <div class="subject-name">${subject.name}</div>
                <div class="subject-time">${subject.startTime} - ${subject.endTime}</div>
                <div class="subject-actions">
                    <button class="subject-btn edit-btn" onclick="studyTracker.editSubject(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="subject-btn delete-btn" onclick="studyTracker.deleteSubject(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            container.appendChild(subjectCard);
        });
    }

    updateStats() {
        const totalSessions = this.subjects.length;
        const completedSessions = this.subjects.filter(subject => subject.completed).length;
        const missedSessions = this.subjects.filter(subject => subject.missed).length;
        
        // Calculate total study time
        const studyTime = this.subjects
            .filter(subject => subject.type === 'study')
            .reduce((total, subject) => {
                const duration = this.calculateDuration(subject.startTime, subject.endTime);
                const hours = parseInt(duration.split('h')[0]) || 0;
                return total + hours;
            }, 0);

        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('completedSessions').textContent = completedSessions;
        document.getElementById('missedSessions').textContent = missedSessions;
        document.getElementById('studyTime').textContent = `${studyTime}h`;
    }

    updateSessionStatuses() {
        // This method can be used to update visual indicators
        // For now, we'll just re-render the schedule
        this.renderStudySchedule();
    }

    completeSession(index) {
        this.subjects[index].completed = true;
        this.subjects[index].completedAt = new Date().toISOString();
        delete this.subjects[index].missed;
        delete this.subjects[index].missedAt;
        
        this.saveSubjects();
        this.renderStudySchedule();
        this.updateStats();
        this.showNotification('Session completed! Great job!', 'success');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    missSession(index) {
        this.subjects[index].missed = true;
        this.subjects[index].missedAt = new Date().toISOString();
        delete this.subjects[index].completed;
        delete this.subjects[index].completedAt;
        
        this.saveSubjects();
        this.renderStudySchedule();
        this.updateStats();
        this.showNotification('Session marked as missed!', 'warning');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]);
        }
    }

    markIncomplete(index) {
        this.subjects[index].completed = false;
        this.subjects[index].missed = false;
        delete this.subjects[index].completedAt;
        delete this.subjects[index].missedAt;
        
        this.saveSubjects();
        this.renderStudySchedule();
        this.updateStats();
        this.showNotification('Session marked as incomplete!', 'info');
    }

    addSubject() {
        this.isEditing = false;
        this.editingIndex = -1;
        this.openSubjectModal();
    }

    editSubject(index) {
        this.isEditing = true;
        this.editingIndex = index;
        const subject = this.subjects[index];
        
        document.getElementById('subjectName').value = subject.name;
        document.getElementById('startTime').value = subject.startTime;
        document.getElementById('endTime').value = subject.endTime;
        document.getElementById('subjectDescription').value = subject.description;
        
        this.openSubjectModal();
    }

    deleteSubject(index) {
        if (confirm('Are you sure you want to delete this subject?')) {
            this.subjects.splice(index, 1);
            this.saveSubjects();
            this.renderSubjects();
            this.renderStudySchedule();
            this.updateStats();
            this.showNotification('Subject deleted successfully!', 'success');
        }
    }

    openSubjectModal() {
        document.getElementById('subjectModal').style.display = 'block';
    }

    closeSubjectModal() {
        document.getElementById('subjectModal').style.display = 'none';
        this.clearSubjectForm();
    }

    clearSubjectForm() {
        document.getElementById('subjectForm').reset();
        this.isEditing = false;
        this.editingIndex = -1;
    }

    saveSubject() {
        const name = document.getElementById('subjectName').value.trim();
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const description = document.getElementById('subjectDescription').value.trim();
        const type = document.getElementById('subjectType') ? document.getElementById('subjectType').value : 'study';

        if (!name || !startTime || !endTime) {
            this.showNotification('Please fill in all required fields!', 'error');
            return;
        }

        if (startTime >= endTime) {
            this.showNotification('End time must be after start time!', 'error');
            return;
        }

        const subject = {
            id: this.isEditing ? this.subjects[this.editingIndex].id : Date.now(),
            name,
            startTime,
            endTime,
            description,
            type: type,
            isEditable: type === 'prayer',
            prayerType: type === 'prayer' ? this.generatePrayerType(name) : null
        };

        if (this.isEditing) {
            this.subjects[this.editingIndex] = subject;
            this.showNotification('Subject updated successfully!', 'success');
        } else {
            this.subjects.push(subject);
            this.showNotification('Subject added successfully!', 'success');
        }

        this.saveSubjects();
        this.renderSubjects();
        this.renderStudySchedule();
        this.updateStats();
        this.closeSubjectModal();
    }

    editPrayerTime(index) {
        const subject = this.subjects[index];
        const newStartTime = prompt(`Enter new start time for ${subject.name}:`, subject.startTime);
        if (newStartTime && this.isValidTime(newStartTime)) {
            const newEndTime = prompt(`Enter new end time for ${subject.name}:`, subject.endTime);
            if (newEndTime && this.isValidTime(newEndTime) && newStartTime < newEndTime) {
                subject.startTime = newStartTime;
                subject.endTime = newEndTime;
                this.saveSubjects();
                this.renderStudySchedule();
                this.renderSubjects();
                this.showNotification('Prayer time updated successfully!', 'success');
            } else {
                this.showNotification('Invalid end time!', 'error');
            }
        } else if (newStartTime) {
            this.showNotification('Invalid start time!', 'error');
        }
    }

    isValidTime(timeString) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    generatePrayerType(name) {
        const prayerTypes = {
            'fajr': 'fajr',
            'dhuhr': 'dhuhr', 
            'asr': 'asr',
            'maghrib': 'maghrib',
            'isha': 'isha'
        };
        
        const lowerName = name.toLowerCase();
        for (const [key, value] of Object.entries(prayerTypes)) {
            if (lowerName.includes(key)) {
                return value;
            }
        }
        return 'custom';
    }

    addPrayer() {
        this.isEditing = false;
        this.editingIndex = -1;
        this.openPrayerModal();
    }

    openPrayerModal() {
        // Create prayer modal if it doesn't exist
        if (!document.getElementById('prayerModal')) {
            this.createPrayerModal();
        }
        document.getElementById('prayerModal').style.display = 'block';
    }

    createPrayerModal() {
        const modal = document.createElement('div');
        modal.id = 'prayerModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="studyTracker.closePrayerModal()">&times;</span>
                <h2><i class="fas fa-mosque"></i> Add New Prayer</h2>
                <form id="prayerForm">
                    <div class="form-group">
                        <label>Prayer Name:</label>
                        <input type="text" id="prayerName" placeholder="e.g., Tahajjud, Witr, Sunnah" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Start Time:</label>
                            <input type="time" id="prayerStartTime" required>
                        </div>
                        <div class="form-group">
                            <label>End Time:</label>
                            <input type="time" id="prayerEndTime" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description:</label>
                        <textarea id="prayerDescription" placeholder="Description of the prayer"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="action-btn complete-btn">
                            <i class="fas fa-save"></i> Add Prayer
                        </button>
                        <button type="button" class="action-btn incomplete-btn" onclick="studyTracker.closePrayerModal()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listener for prayer form
        document.getElementById('prayerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePrayer();
        });
    }

    savePrayer() {
        const name = document.getElementById('prayerName').value.trim();
        const startTime = document.getElementById('prayerStartTime').value;
        const endTime = document.getElementById('prayerEndTime').value;
        const description = document.getElementById('prayerDescription').value.trim();

        if (!name || !startTime || !endTime) {
            this.showNotification('Please fill in all required fields!', 'error');
            return;
        }

        if (startTime >= endTime) {
            this.showNotification('End time must be after start time!', 'error');
            return;
        }

        const prayer = {
            id: Date.now(),
            name: name,
            startTime: startTime,
            endTime: endTime,
            description: description || `${name} prayer`,
            type: 'prayer',
            isEditable: true,
            prayerType: this.generatePrayerType(name)
        };

        this.subjects.push(prayer);
        this.saveSubjects();
        this.renderSubjects();
        this.renderStudySchedule();
        this.updateStats();
        this.closePrayerModal();
        this.showNotification('Prayer added successfully!', 'success');
    }

    closePrayerModal() {
        const modal = document.getElementById('prayerModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('prayerForm').reset();
        }
    }

    setupEventListeners() {
        // Add subject button
        document.getElementById('addSubjectBtn').addEventListener('click', () => {
            this.addSubject();
        });

        // Add prayer button
        document.getElementById('addPrayerBtn').addEventListener('click', () => {
            this.addPrayer();
        });

        // Subject form
        document.getElementById('subjectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSubject();
        });

        // Cancel button
        document.getElementById('cancelSubject').addEventListener('click', () => {
            this.closeSubjectModal();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeSubjectModal();
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('subjectModal');
            if (e.target === modal) {
                this.closeSubjectModal();
            }
        });
    }

    loadSubjects() {
        try {
            const data = localStorage.getItem('studySubjects');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading subjects:', error);
            return [];
        }
    }

    saveSubjects() {
        try {
            localStorage.setItem('studySubjects', JSON.stringify(this.subjects));
        } catch (error) {
            console.error('Error saving subjects:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#e53e3e' : type === 'warning' ? '#ed8936' : '#4299e1'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the study tracker
const studyTracker = new StudyRoutineTracker();
