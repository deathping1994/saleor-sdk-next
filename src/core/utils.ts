import axios, { AxiosResponse } from "axios";
import { axiosRequest } from "../apollo";
import { REST_API_ENDPOINTS, REST_API_METHODS_TYPES } from "../constants";

export interface UtilityFunctionsSDK {
  searchProducts: (
    queryOptions: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
  filterProducts: (
    filters: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
  metaSync: (
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
}

export const utilityFunctions = (
  restApiUrl: string | undefined,
  wizzyConfig: any
): UtilityFunctionsSDK => {
  const searchProducts = async (queryOptions: any, options: any = {}) => {
    const { headers, baseUrl } = wizzyConfig;
    if (queryOptions && headers && baseUrl) {
      try {
        const url = `${baseUrl}/products/search`;
        const method = "POST";
        const response = await axios({
          url,
          method,
          data: queryOptions,
          headers,
          ...options,
        });

        return response;
      } catch (error) {
        console.log("Error occurred in axiosRequest", error);
        return;
      }
    }
    return null;
  };

  const filterProducts = async (filters: any, options: any = {}) => {
    const { headers, baseUrl } = wizzyConfig;
    if (filters && headers && baseUrl) {
      try {
        const url = `${baseUrl}/products/filter`;
        const method = "POST";
        const response = await axios({
          url,
          method,
          data: filters,
          headers,
          ...options,
        });

        return response;
      } catch (error) {
        console.log("Error occurred in axiosRequest", error);
        return;
      }
    }
    return null;
  };

  const metaSync = async (options: any = {}) => {
    if (!restApiUrl) {
      console.warn("restApiUrl is not configured");
      return null;
    }

    const getCookie = (name: string): string | null => {
      if (typeof window === "undefined") {
        return null;
      }
      const cookieArr = document.cookie.split(";");
      for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
          return cookiePair[1] ? decodeURIComponent(cookiePair[1]) : null;
        }
      }
      return null;
    };

    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc");

    let expires: string | null = null;

    if (typeof window !== "undefined") {
      // Try Cookie Store API (modern browsers like Chrome/Edge/Opera)
      if ((window as any).cookieStore) {
        try {
          const cookieFbp = await (window as any).cookieStore.get("_fbp");
          if (cookieFbp && typeof cookieFbp.expires === "number") {
            expires = new Date(cookieFbp.expires).toISOString();
          } else {
            const cookieFbc = await (window as any).cookieStore.get("_fbc");
            if (cookieFbc && typeof cookieFbc.expires === "number") {
              expires = new Date(cookieFbc.expires).toISOString();
            }
          }
        } catch (e) {
          console.warn("Error reading from cookieStore:", e);
        }
      }
    }

    const fullUrl = `${restApiUrl}${REST_API_ENDPOINTS.META_SYNC}`;
    const data = {
      fbp: fbp || "",
      fbc: fbc || "",
      expires: expires || null,
    };

    try {
      const response = await axiosRequest(
        fullUrl,
        REST_API_METHODS_TYPES.POST,
        data,
        options
      );
      return response;
    } catch (error) {
      console.error("Error occurred in metaSync", error);
      return null;
    }
  };

  return {
    searchProducts,
    filterProducts,
    metaSync,
  };
};
