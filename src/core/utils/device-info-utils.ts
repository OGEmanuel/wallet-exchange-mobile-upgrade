/**
 * Device Info Utilities
 * 
 * Provides utilities to get device IP address and location information
 * 
 * @example
 * ```typescript
 * const { ip, location } = await getDeviceIpAndLocation();
 * ```
 */

export interface DeviceIpAndLocation {
  ip: string;
  location: string;
}

/**
 * Get device IP address and location using IP geolocation service
 * @returns Promise<DeviceIpAndLocation> - Device IP and location information
 */
export const getDeviceIpAndLocation = async (): Promise<DeviceIpAndLocation> => {
  try {
    // Use ipapi.co for IP geolocation (free tier available)
    // This service returns both IP and location data
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract IP address
    const ip = data.ip || data.query || '';

    // Build location string from available data
    // Format: "City, Country" or "Country" if city not available
    let location = '';
    if (data.city && data.country_name) {
      location = `${data.city}, ${data.country_name}`;
    } else if (data.country_name) {
      location = data.country_name;
    } else if (data.country) {
      location = data.country;
    }

    return {
      ip: ip || '',
      location: location || '',
    };
  } catch (error) {
    console.warn('Failed to get IP and location from ipapi.co, trying fallback:', error);

    // Fallback: Try ipify for IP and ip-api for location
    try {
      // Get IP from ipify
      const ipResponse = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        const ip = ipData.ip || '';

        // Try to get location from ip-api.com
        if (ip) {
          try {
            const locationResponse = await fetch(`http://ip-api.com/json/${ip}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });

            if (locationResponse.ok) {
              const locationData = await locationResponse.json();
              let location = '';
              if (locationData.city && locationData.country) {
                location = `${locationData.city}, ${locationData.country}`;
              } else if (locationData.country) {
                location = locationData.country;
              }

              return {
                ip: ip || '',
                location: location || '',
              };
            }
          } catch (locationError) {
            console.warn('Failed to get location from ip-api.com:', locationError);
          }
        }

        return {
          ip: ip || '',
          location: '',
        };
      }
    } catch (fallbackError) {
      console.warn('Failed to get IP and location from fallback services:', fallbackError);
    }

    // Return empty values if all services fail
    return {
      ip: '',
      location: '',
    };
  }
};

/**
 * Get device IP address only
 * @returns Promise<string> - Device IP address
 */
export const getDeviceIp = async (): Promise<string> => {
  try {
    const { ip } = await getDeviceIpAndLocation();
    return ip;
  } catch (error) {
    console.warn('Failed to get device IP:', error);
    return '';
  }
};

/**
 * Get device location only
 * @returns Promise<string> - Device location
 */
export const getDeviceLocation = async (): Promise<string> => {
  try {
    const { location } = await getDeviceIpAndLocation();
    return location;
  } catch (error) {
    console.warn('Failed to get device location:', error);
    return '';
  }
};

