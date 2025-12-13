const holidayApiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include authentication
holidayApiClient.interceptors.request.use(
  (config) => {
    // If there's an authentication token in localStorage, add it to headers
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = Bearer ${token};
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
holidayApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access - maybe redirect to login
      console.warn('Unauthorized access to holiday API');
    }
    return Promise.reject(error);
  }
);

export default holidayApiClient;








