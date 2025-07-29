
// A simple data fetching function
export async function fetchData<T>(url: string, options?: RequestInit): Promise<T | null> {
    try {
        // In a real app, you might get the base URL from an environment variable
        const response = await fetch(url, options);

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
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
