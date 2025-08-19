

// A simple data fetching function
export async function fetchData<T>(url: string, options?: RequestInit): Promise<T | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://are.towerbuddy.tel:8000';
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
        
        const response = await fetch(fullUrl, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
            // You could throw an error here to be caught by the caller
            return null;
        }

        return await response.json() as T;
    } catch (error) {
        console.error("Network or parsing error:", error);
        // You could throw an error here to be caught by the caller
        return null;
    }
}
