import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { get, post } from '@/lib/api';

// Define the user type based on your application's user model
interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  role?: string;
  settings?: Record<string, any>;
  [key: string]: any;
}

// Define the login credentials type
interface LoginCredentials {
  username: string;
  password: string;
}

// Define the registration data type
interface RegisterData {
  username: string;
  password: string;
  email?: string;
  name?: string;
}

// Define the authentication context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the authentication provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Authentication provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Clear the error
  const clearError = () => setError(null);

  // Load the user on component mount
  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // Get the user's profile
        const userData = await get<User>('auth/me');
        setUser(userData);
      } catch (err: any) {
        // Handle authentication errors
        console.log('Not authenticated');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login the user
  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      setIsLoading(true);
      clearError();
      
      // Send the login request
      const userData = await post<User>('auth/login', credentials);
      
      // Set the user data
      setUser(userData);
      
      return userData;
    } catch (err: any) {
      // Handle login errors
      const errMessage = err.message || 'Failed to login';
      setError(errMessage);
      throw new Error(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Register a new user
  const register = async (data: RegisterData): Promise<User> => {
    try {
      setIsLoading(true);
      clearError();
      
      // Send the registration request
      const userData = await post<User>('auth/register', data);
      
      // Set the user data
      setUser(userData);
      
      return userData;
    } catch (err: any) {
      // Handle registration errors
      const errMessage = err.message || 'Failed to register';
      setError(errMessage);
      throw new Error(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout the user
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Send the logout request
      await post('auth/logout', {});
      
      // Clear the user data
      setUser(null);
      
      // Redirect to the login page
      router.push('/auth');
    } catch (err: any) {
      console.error('Logout error:', err);
      
      // Even if there's an error, clear the user data
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Create the context value
  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  // Provide the authentication context
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component to require authentication
export const withAuth = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
  return (props: P) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/auth');
      }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
      return <div>Loading...</div>;
    }

    return <Component {...props} />;
  };
};