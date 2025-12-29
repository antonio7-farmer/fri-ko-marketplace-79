# Frisko - Croatian Farmer Marketplace

A modern marketplace platform connecting local farmers (OPG - Obiteljsko Gospodarstvo) with buyers in Croatia. Built with React, TypeScript, Supabase, and Capacitor for cross-platform support.

## Features

- **Multi-role Authentication**: Separate signup flows for buyers and sellers/farmers
- **Product Marketplace**: Browse, search, and filter local farm products
- **Real-time Messaging**: Direct communication between buyers and sellers
- **Reservation System**: Book products with status tracking (pending, confirmed, completed, cancelled)
- **Location-based Search**: Interactive map view with Leaflet integration
- **Push Notifications**: FCM-powered notifications for messages, reservations, and stock updates
- **Favorites**: Follow your preferred sellers
- **User Profiles**: Customizable profiles with avatars, cover images, and farm galleries
- **Responsive Design**: Mobile-first design with Android app support via Capacitor
- **Dark/Light Theme**: User-selectable theme support

## Tech Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **TanStack Query** for data fetching
- **shadcn/ui** + **Radix UI** for component library
- **Tailwind CSS** for styling
- **React Hook Form** + **Zod** for form validation
- **Leaflet** for maps
- **Capacitor** for mobile app

### Backend
- **Supabase** - PostgreSQL database, authentication, storage, Edge Functions
- **Firebase Cloud Functions** - FCM notification delivery
- **Row Level Security (RLS)** policies for data protection

## Prerequisites

- Node.js 20+
- npm or bun
- Supabase account and project
- Firebase project (for push notifications)
- Android Studio (for Android builds)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fri-ko-marketplace-79-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Run migrations: `npx supabase db push`
   - Deploy Edge Functions (see [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md))

5. **Set up Firebase (for push notifications)**
   - Follow instructions in [FIREBASE_FUNCTIONS_SETUP.md](FIREBASE_FUNCTIONS_SETUP.md)
   - Add `google-services.json` to project root (for Android)

## Development

### Run development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Lint code
```bash
npm run lint
```

## Mobile Development

### Android

1. **Build web assets**
   ```bash
   npm run build
   ```

2. **Sync Capacitor**
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

4. **Build APK/AAB**
   - Use Android Studio build tools
   - Or command line: `cd android && ./gradlew assembleDebug`

## Project Structure

```
fri-ko-marketplace-79-main/
├── src/
│   ├── components/       # Reusable React components
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Route components
│   ├── services/        # Business logic (push notifications, etc.)
│   ├── integrations/    # External service integrations
│   │   └── supabase/   # Supabase client & types
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript type definitions
├── supabase/
│   ├── migrations/     # Database schema migrations
│   └── functions/      # Edge Functions
├── functions/          # Firebase Cloud Functions
├── android/           # Native Android app
├── public/            # Static assets
└── ...config files
```

## Database Schema

Main tables:
- `profiles` - User profiles with role, location, ratings
- `products` - Product listings
- `messages` - User-to-user messaging
- `reservations` - Product bookings
- `favorites` - User favorites/following
- `fcm_tokens` - Push notification tokens
- `notification_queue` - Queued notifications
- `notification_preferences` - User notification settings

See `supabase/migrations/` for complete schema.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Deployment

### Web Deployment
1. Build the project: `npm run build`
2. Deploy `dist/` folder to your hosting provider (Vercel, Netlify, etc.)

### Android Deployment
1. Build the web assets: `npm run build`
2. Sync Capacitor: `npx cap sync android`
3. Open Android Studio: `npx cap open android`
4. Build and sign APK/AAB for Play Store

## Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md) - Push notification configuration
- [FIREBASE_FUNCTIONS_SETUP.md](FIREBASE_FUNCTIONS_SETUP.md) - Firebase Functions setup

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Build and test: `npm run build`
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub or contact the maintainers.
