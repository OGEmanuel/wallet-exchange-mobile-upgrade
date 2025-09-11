import { ENVIRONMENTS } from "@/configs/environments";
// import { toast } from "@/stores/toast.store";
import axios, { AxiosError, type AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

export type StandardResponse<T> = {
  data: T;
  message: string;
  status: boolean;
  responseCode: number;
};

const api: AxiosInstance = axios.create({
  baseURL: `${ENVIRONMENTS.EXPO_PUBLIC_STAGING_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const errorHandler = (error: AxiosError<StandardResponse<any>>) => {
  // Check if the error is due to a network issue (e.g., no response received)
  if (!error.response) {
    console.error("Network Error:", error.message);
    // toast.error({
    //   title: "Network error",
    //   description: "Please check your internet connection.",
    // });
    return Promise.reject({
      message: "Network error. Please check your internet connection.",
      status: "NETWORK_ERROR",
    });
  }

  // Error response exists; handle based on status codes
  const errorResponse = error.response;

  switch (errorResponse.status) {
    case 401:
      console.warn("Unauthorized: Redirecting to login.");
      //   toast.error({
      //     title: "Session expired",
      //     description: "Please log in again.",
      //   });
      break;
    default:
      console.error("Unhandled Error:", errorResponse.data);
      break;
  }

  // Customize user-facing error messages based on the response
  const errorMessage = Array.isArray(errorResponse?.data?.message)
    ? errorResponse.data.message[0] // Show first error if message is an array
    : errorResponse?.data?.message || "An error occurred. Please try again.";

  //   toast.error({ title: "Error", description: errorMessage });
  console.log("errorMessage", errorMessage);
  // Propagate the error for further handling if needed
  return Promise.reject(error);
};

api.interceptors.request.use(
  async (config) => {
    const accessToken = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (accessToken) {
      config.headers["access_token"] = accessToken;
      config.headers["refresh_token"] = refreshToken;
    }
    return config;
  },
  (error) => errorHandler(error)
);

api.interceptors.response.use(
  (response) => {
    // console.log("exios response:", JSON.stringify(response, null, 2));
    return response;
  },
  (error) => {
    errorHandler(error);
    console.log("interceptor error:", JSON.stringify(error, null, 2));
  }
);

export default api;
