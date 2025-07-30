
export type User = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    role: string;
    role_details: string;
    date_joined: string;
    last_login: string;
    has_user_profile: boolean;
    country: {
        id: number;
        name: string;
        code3: string;
        currency: string;
        currency_name: string;
        currency_symbol: string;
        phone: string;
    };
};
