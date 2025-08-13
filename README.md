# 🌙 Nightlio

> **A beautiful, self-hosted daily mood tracker and journal**

Nightlio is a privacy-first mood tracking application that helps you understand your emotional patterns through daily journaling. Built for self-hosting, your data stays completely under your control.

*Screenshots coming soon! The database has been populated with demo data for testing.*

## ✨ Features

### 🎯 **Core Functionality**
- **5-Level Mood Tracking**: Simple, intuitive mood selection with beautiful icons
- **Rich Text Journaling**: Write detailed entries with markdown support
- **Custom Categories**: Create personalized tags (Activities, Sleep, Productivity, etc.)
- **Streak Tracking**: Build consistent journaling habits with streak counters

### 📊 **Analytics & Insights**
- **Weekly Mood Trends**: Visualize your emotional patterns over time
- **Mood Distribution Charts**: See which moods are most common
- **Interactive Calendar**: Monthly view with mood indicators
- **Statistics Dashboard**: Track total entries, averages, and streaks

### 🎨 **User Experience**
- **Modern UI**: Clean, responsive design that works on all devices
- **Dark/Light Themes**: Comfortable viewing in any lighting
- **Fast & Lightweight**: Built with performance in mind
- **Offline Ready**: Works without internet connection

### 🔒 **Privacy & Control**
- **Self-Hosted**: Your data never leaves your server
- **No Tracking**: Zero analytics, cookies, or external dependencies
- **Local Storage**: SQLite database stored on your machine
- **Export Ready**: Easy data backup and migration

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ (for the frontend)
- **Python** 3.8+ (for the backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shirsakm/nightlio.git
   cd nightlio
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up the backend**
   ```bash
   cd api
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start the API
   npm run api:dev
   
   # Terminal 2: Start the frontend
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` and start journaling!

## 🐳 Docker Deployment

*Docker support coming soon! For now, use the manual installation method above.*

## 📱 Usage Guide

### Creating Your First Entry
1. Select your current mood using the emoji buttons
2. Choose relevant categories (optional)
3. Write about your day in the rich text editor
4. Click "Save Entry" to store your journal entry

### Viewing Your Progress
- **Home**: See your mood history and create new entries
- **Stats**: Analyze your mood patterns with charts and insights
- **Calendar**: Visual overview of your mood journey

### Managing Categories
- Create custom categories like "Work", "Health", "Relationships"
- Add specific options within each category
- Tag your entries for better organization and insights

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **MDXEditor** - Rich markdown editing experience
- **Recharts** - Beautiful, responsive charts
- **Lucide React** - Consistent icon system

### Backend
- **Flask** - Lightweight Python web framework
- **SQLite** - Reliable, serverless database
- **Flask-CORS** - Cross-origin resource sharing
- **Application Factory** - Scalable Flask architecture

### Infrastructure
- **Docker** - Containerized deployment
- **Nginx** - Reverse proxy and static file serving
- **Let's Encrypt** - Free SSL certificates

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
FLASK_ENV=production
DATABASE_PATH=/app/data/nightlio.db
SECRET_KEY=your-secret-key-here

# CORS Settings
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### Database Schema
The application automatically creates the necessary database tables:
- `mood_entries` - Your daily journal entries
- `groups` - Custom categories
- `group_options` - Specific options within categories
- `entry_selections` - Links between entries and selected options

## 📊 API Reference

### Mood Entries
- `POST /api/mood` - Create new mood entry
- `GET /api/moods` - Get all mood entries
- `GET /api/mood/<id>` - Get specific entry
- `PUT /api/mood/<id>` - Update entry
- `DELETE /api/mood/<id>` - Delete entry

### Categories & Options
- `GET /api/groups` - Get all categories
- `POST /api/groups` - Create new category
- `POST /api/groups/<id>/options` - Add option to category
- `DELETE /api/groups/<id>` - Delete category

### Analytics
- `GET /api/statistics` - Get mood statistics
- `GET /api/streak` - Get current streak
- `GET /api/mood/<id>/selections` - Get entry selections

## 🤝 Contributing

We welcome contributions! Feel free to open issues or submit pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: Black formatter + flake8 linting
- **Commits**: Conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Daylio](https://daylio.net/) for the mood tracking concept
- Built with love for the self-hosting community

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/shirsakm/nightlio/wiki)
- **Issues**: [GitHub Issues](https://github.com/shirsakm/nightlio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shirsakm/nightlio/discussions)

---

<div align="center">

**[⭐ Star this repo](https://github.com/shirsakm/nightlio)** if you find it helpful!

Made with ❤️ for better mental health awareness

</div>
