export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}

export interface User {
    firstname?: string;
    lastname?: string;
    phone?: string;
    email?: string;
}