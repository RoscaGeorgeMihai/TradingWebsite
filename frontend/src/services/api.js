export const fetchUsers = async () => {
    const response = await fetch("/api/users");  // NU mai punem API_URL
    return response.json();
  };
  