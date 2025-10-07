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
                    name: "Morning Revision",
                    startTime: "06:00",
                    endTime: "07:00",
                    description: "Review yesterday's topics and prepare for today",
                    type: "study"
                },
                {
                    id: 2,
                    name: "Breakfast",
                    startTime: "07:00",
                    endTime: "07:30",
                    description: "Healthy breakfast and coffee",
                    type: "meal"
                },
                {
                    id: 3,
                    name: "Mathematics",
                    startTime: "07:30",
                    endTime: "09:00",
                    description: "Solve problems and practice concepts",
                    type: "study"
                },
                {
                    id: 4,
                    name: "Short Break",
                    startTime: "09:00",
                    endTime: "09:15",
                    description: "Rest and refresh",
                    type: "break"
                },
                {
                    id: 5,
                    name: "Physics",
                    startTime: "09:15",
                    endTime: "10:45",
                    description: "Theoretical concepts and problem solving",
                    type: "study"
                },
                {
                    id: 6,
                    name: "Chemistry",
                    startTime: "10:45",
                    endTime: "12:00",
                    description: "Organic and inorganic chemistry",
                    type: "study"
                },
                {
                    id: 7,
                    name: "Lunch Break",
                    startTime: "12:00",
                    endTime: "12:30",
                    description: "Lunch and rest",
                    type: "meal"
                },
                {
                    id: 8,
                    name: "English",
                    startTime: "12:30",
                    endTime: "13:30",
                    description: "Grammar, vocabulary, and literature",
                    type: "study"
                },
                {
                    id: 9,
                    name: "Biology",
                    startTime: "13:30",
                    endTime: "14:30",
                    description: "Botany and zoology concepts",
                    type: "study"
                },
                {
                    id: 10,
                    name: "Evening Break",
                    startTime: "14:30",
                    endTime: "15:00",
                    description: "Rest and light snack",
                    type: "break"
                },
                {
                    id: 11,
                    name: "Computer Science",
                    startTime: "15:00",
                    endTime: "16:00",
                    description: "Programming and theory",
                    type: "study"
                },
                {
                    id: 12,
                    name: "Sleep",
                    startTime: "16:00",
                    endTime: "18:00",
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
            sessionElement.className = `study-session ${status}`;
            
            const timeRange = `${subject.startTime} - ${subject.endTime}`;
            const duration = this.calculateDuration(subject.startTime, subject.endTime);
            
            sessionElement.innerHTML = `
                <div class="session-time">${timeRange}</div>
                <div class="session-content">
                    <div class="session-title">${subject.name}</div>
                    <div class="session-description">${subject.description}</div>
                    <span class="session-subject">${subject.type.toUpperCase()}</span>
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
            type: 'study'
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

    setupEventListeners() {
        // Add subject button
        document.getElementById('addSubjectBtn').addEventListener('click', () => {
            this.addSubject();
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
