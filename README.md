# Daily Routine Tracker

A beautiful and functional daily routine tracking website designed specifically for students with university schedules and religious commitments.

## Features

### 🎯 **Smart Time Management**
- Real-time clock display
- Automatic task status updates (Pending, Current, Overdue, Completed, Missed)
- Visual indicators for different task types

### 📅 **Weekly Schedule**
- **Monday-Wednesday**: University classes (8 AM - 5 PM) + evening study/work
- **Thursday-Friday**: Weekend schedule with extended study time
- **Saturday-Sunday**: University classes (8 AM - 5 PM) + evening study/work

### 🕌 **Religious Considerations**
- Special Friday schedule with Jummah Prayer time (12:00 PM - 2:00 PM)
- Respects Bangladeshi cultural and religious practices

### 💻 **Web Development Focus**
- Dedicated coding study time (1.5-3 hours daily)
- Project work sessions
- Learning and skill development time

### 📊 **Progress Tracking**
- Real-time statistics (Completed, In Progress, Missed)
- Task completion tracking
- Data persistence using localStorage

### 🎨 **Beautiful UI**
- Modern, responsive design
- Color-coded task statuses
- Smooth animations and transitions
- Mobile-friendly interface

## How to Use

1. **Open the Website**: Simply open `index.html` in your web browser
2. **Select Day**: Click on any day of the week to view that day's routine
3. **Track Tasks**: 
   - Green tasks are currently active
   - Red tasks are overdue
   - Gray tasks are completed or missed
4. **Complete Tasks**: Click "Complete" when you finish a task
5. **Skip Tasks**: Click "Skip" if you need to skip a task
6. **View Progress**: Check the statistics at the bottom

## File Structure

```
Daily Rutine/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── sample-data.json    # Sample data structure
└── README.md          # This file
```

## Data Storage

The website uses:
- **localStorage**: For real-time data persistence
- **JSON format**: For data structure and export/import

## Customization

You can easily customize the routine by:
1. Editing the `getRoutineData()` function in `script.js`
2. Modifying task times, durations, and descriptions
3. Adding new task types or special categories

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Features Breakdown

### Task Status Colors
- **Gray**: Pending tasks
- **Green**: Current/active tasks
- **Red**: Overdue tasks
- **Blue**: Class time (8 AM - 5 PM)
- **Purple**: Religious time (Friday 12-2 PM)
- **Orange**: Weekend activities

### Special Time Blocks
- **Class Time**: 8:00 AM - 5:00 PM (Monday-Sunday)
- **Religious Time**: 12:00 PM - 2:00 PM (Friday only)
- **Study Time**: 1.5-3 hours daily
- **Project Work**: 1.5-3 hours daily

## Tips for Success

1. **Follow the Schedule**: Stick to the planned times as much as possible
2. **Complete Tasks**: Mark tasks as complete when finished
3. **Review Progress**: Check your statistics regularly
4. **Adjust as Needed**: Modify the schedule based on your actual needs
5. **Stay Consistent**: Regular use will help build good habits

## Technical Details

- **Pure HTML/CSS/JavaScript**: No external dependencies
- **Responsive Design**: Works on all screen sizes
- **Real-time Updates**: Updates every second
- **Data Persistence**: Saves progress automatically
- **Export/Import**: Can save and load data as JSON files

Enjoy organizing your daily routine and advancing your web development skills! 🚀
# Daily-task-rooting
