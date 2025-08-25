# RelationshipWise AI

## Overview

RelationshipWise is a full-stack web application that provides AI-powered relationship coaching and educational resources. The platform helps users develop communication skills, emotional intelligence, and social awareness through interactive learning modules, personalized AI coaching sessions, and skill assessments. Built with a modern tech stack, it features a React frontend with shadcn/ui components, an Express.js backend, and uses OpenAI's GPT-5 for intelligent coaching responses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React 18 and TypeScript, using Vite as the build tool and development server. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing a consistent and accessible design system. State management is handled through React Query for server state and React Context for authentication state. The application uses Wouter for client-side routing, providing a lightweight alternative to React Router.

### Backend Architecture
The server is an Express.js application written in TypeScript that provides RESTful API endpoints. The architecture follows a layered approach with separate route handlers, business logic services, and data access layers. Session-based authentication is implemented using express-session with bcrypt for password hashing. The server includes comprehensive error handling middleware and request logging for debugging and monitoring.

### Data Storage Solutions
The application uses a PostgreSQL database accessed through Drizzle ORM for type-safe database operations. Database schemas are defined with Drizzle's declarative schema definition, supporting complex data types like JSONB for storing user preferences, chat messages, and learning module content. For development and testing, an in-memory storage implementation is provided as an abstraction layer.

### Authentication and Authorization
Authentication is implemented using traditional session-based authentication with secure HTTP-only cookies. Password security is handled with bcrypt hashing, and session management includes configurable security settings for production environments. The system includes middleware for protecting routes that require authentication.

### API Design
The REST API is organized into logical resource groups:
- `/api/auth/*` - User registration, login, logout, and session management
- `/api/chats/*` - Chat session creation, message handling, and AI coaching
- `/api/modules/*` - Learning module retrieval and content management  
- `/api/assessments/*` - Skill assessments and progress tracking
- `/api/progress/*` - User progress tracking and analytics

Each endpoint follows RESTful conventions with appropriate HTTP methods and status codes.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database service accessed via `@neondatabase/serverless`
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect support

### AI Services
- **OpenAI GPT-5**: Powers the intelligent coaching responses through the OpenAI API, providing contextual relationship advice and interactive feedback

### UI Framework
- **Radix UI**: Comprehensive collection of accessible, unstyled UI primitives
- **shadcn/ui**: Pre-built component library built on Radix UI with consistent styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### Development Tools  
- **Vite**: Fast build tool and development server with HMR support
- **TypeScript**: Static type checking for both client and server code
- **React Query**: Data fetching and caching library for server state management

### Session Management
- **connect-pg-simple**: PostgreSQL session store for express-session
- **express-session**: Session middleware for Express.js applications

### Authentication
- **bcrypt**: Password hashing library for secure credential storage