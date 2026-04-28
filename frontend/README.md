# TaskFlow - Frontend

A modern, professional React + Tailwind CSS frontend for task management.

## Features

✨ **Modern UI**
- Clean, professional design inspired by SaaS products (Notion, Linear, Trello)
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Dark-aware color palette

🔐 **Authentication**
- Beautiful login and signup pages
- JWT token-based authentication
- Persistent login with localStorage
- Protected routes

📋 **Task Management**
- Create, read, update, delete tasks
- Toggle task status (pending/completed)
- Beautiful task cards with animations
- Task filtering (all, pending, completed)
- Real-time statistics

🎨 **UI/UX**
- Toast notifications (success, error, warning)
- Loading states and spinners
- Confirmation dialogs
- Modal forms
- Hover effects and transitions
- Icons from lucide-react

🚀 **Developer Experience**
- Vite for fast development
- React Router for navigation
- Axios with interceptors
- Context API for state management
- Tailwind CSS for styling
- Framer Motion for animations

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Context API** - State management

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ConfirmDialog.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── TaskCard.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useToast.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Configuration

### Vite Config
- Dev server on port 3000
- API proxy to http://localhost:5000

### Tailwind Config
- Custom primary color palette
- Custom animations
- Extended theme

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login (returns JWT token)
- `GET /auth/me` - Get current user (protected)

### Task Endpoints
- `GET /tasks` - Get all user tasks
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get single task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/stats/all` - Get task statistics

All requests automatically include JWT token in Authorization header.

## Features Breakdown

### Authentication
- **Login Page**: Email/password login with validation
- **Signup Page**: Account creation with password confirmation
- **Protected Routes**: Redirect unauthenticated users to login

### Dashboard
- **Header**: Shows current user info and logout button
- **Statistics**: Display total, completed, pending tasks and completion percentage
- **Task List**: Filterable task cards with animations
- **Task Creation**: Modal form for creating new tasks
- **Task Management**: Toggle status, delete tasks with confirmation

### Styling
- **Gradient Backgrounds**: Modern gradient design
- **Animations**: Smooth transitions and Framer Motion animations
- **Responsive Design**: Mobile-first approach with Tailwind
- **Color System**: Professional color palette with primary, secondary, danger colors

### Components

#### ProtectedRoute
Wraps protected pages and redirects unauthenticated users to login.

#### Navbar
Top navigation with user info and logout button. Mobile-responsive menu.

#### TaskCard
Individual task display with:
- Toggle button to mark complete/pending
- Task title and description
- Status badge
- Delete button
- Smooth animations

#### Modal
Reusable modal component for forms with animations.

#### ConfirmDialog
Confirmation dialog for destructive actions.

#### Toast
Notification component with success, error, and warning types.

### Hooks

#### useToast
Custom hook for managing toast notifications.

```javascript
const { toasts, showToast, removeToast } = useToast()
showToast('Success!', 'success')
```

### Context

#### AuthContext
Provides authentication state and methods:
- `user` - Current user
- `loading` - Loading state
- `error` - Error message
- `isAuthenticated` - Auth status
- `login()` - Login method
- `signup()` - Signup method
- `logout()` - Logout method

## Demo Credentials

For testing with the demo backend:
- **Email**: tarunlakkimsetty@gmail.com
- **Password**: password123

## Styling Guide

### Color Palette
- Primary: Sky blue (#0ea5e9) - Actions, links, highlights
- Secondary: Slate - Neutral elements
- Success: Green - Completed tasks
- Warning: Yellow - Pending tasks
- Danger: Red - Delete actions

### Tailwind Classes
- `card` - Card container with shadow
- `btn-primary` - Primary button
- `btn-secondary` - Secondary button
- `btn-danger` - Danger/delete button
- `badge-pending` - Pending status badge
- `badge-completed` - Completed status badge

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance

- Code splitting with React
- Lazy loading with Route component
- Optimized animations with Framer Motion
- Minimal CSS with Tailwind
- Fast builds with Vite

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Task categories/tags
- [ ] Due dates and reminders
- [ ] Task priority levels
- [ ] Search functionality
- [ ] Export tasks
- [ ] Team collaboration
- [ ] Real-time sync with WebSockets
- [ ] Offline support with service workers
- [ ] Progressive Web App (PWA)

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

---

Built with ❤️ using React, Tailwind CSS, and Vite
