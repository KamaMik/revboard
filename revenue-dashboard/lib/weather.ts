
export const WEATHER_STACK_API_KEY = process.env.WEATHER_STACK_API_KEY;
export const WEATHER_LOCATION = process.env.WEATHER_LOCATION || "Rome";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const cache = new Map<string, { data: any; timestamp: number }>();

// Coordinates from env or default to Rome
const LATITUDE = process.env.LATITUDE || "41.9028";
const LONGITUDE = process.env.LONGITUDE || "12.4964";

// WMO Weather Code Mapping
const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: "Sunny", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png" },
  1: { description: "Mainly Clear", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png" },
  2: { description: "Partly Cloudy", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png" },
  3: { description: "Overcast", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0004_black_low_cloud.png" },
  45: { description: "Fog", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0006_mist.png" },
  48: { description: "Depositing Rime Fog", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0006_mist.png" },
  51: { description: "Light Drizzle", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0009_light_rain_showers.png" },
  53: { description: "Moderate Drizzle", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0009_light_rain_showers.png" },
  55: { description: "Dense Drizzle", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0010_heavy_rain_showers.png" },
  61: { description: "Slight Rain", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0009_light_rain_showers.png" },
  63: { description: "Moderate Rain", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0010_heavy_rain_showers.png" },
  65: { description: "Heavy Rain", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0010_heavy_rain_showers.png" },
  71: { description: "Slight Snow", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0011_light_snow_showers.png" },
  73: { description: "Moderate Snow", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0012_heavy_snow_showers.png" },
  75: { description: "Heavy Snow", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0012_heavy_snow_showers.png" },
  80: { description: "Slight Rain Showers", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0009_light_rain_showers.png" },
  81: { description: "Moderate Rain Showers", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0010_heavy_rain_showers.png" },
  82: { description: "Violent Rain Showers", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0010_heavy_rain_showers.png" },
  95: { description: "Thunderstorm", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0024_thunderstorms.png" },
  96: { description: "Thunderstorm with Hail", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0024_thunderstorms.png" },
  99: { description: "Thunderstorm with Heavy Hail", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0024_thunderstorms.png" },
};

function getWeatherDetails(code: number) {
  return weatherCodeMap[code] || { description: "Unknown", icon: "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png" };
}

export async function getWeatherData(date: string, time: string = "12:00") {
  // Check cache
  const cacheKey = `${date}-${time}-Rome`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("Returning cached weather data for", cacheKey);
    return cached.data;
  }

  // Check if date is today, past, or future
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const isToday = targetDate.getTime() === todayDate.getTime();
  const isFuture = targetDate.getTime() > todayDate.getTime();

  let url = "";

  if (isFuture) {
    // Forecast API
    // Note: Open-Meteo forecast can provide hourly data too. 
    // To support specific time selection for future dates, we should use hourly=temperature_2m,weather_code
    url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&hourly=temperature_2m,weather_code&timezone=auto&start_date=${date}&end_date=${date}`;
  } else {
    // Historical or Today
    if (isToday) {
       // For today, we can use Forecast hourly to get specific time
       url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&hourly=temperature_2m,weather_code&timezone=auto&start_date=${date}&end_date=${date}`;
    } else {
       // Using ERA5 as requested for historical data
       url = `https://archive-api.open-meteo.com/v1/era5?latitude=${LATITUDE}&longitude=${LONGITUDE}&start_date=${date}&end_date=${date}&hourly=temperature_2m,weather_code&timezone=auto`;
    }
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
       console.error("Open-Meteo API error:", data.reason);
       throw new Error(data.reason || "Weather API Error");
    }

    let result;
    
    // We are now fetching hourly data for all cases to support time selection
    if (data.hourly) {
        const hourlyData = data.hourly;
        
        // Find index for the requested time
        // API returns ISO strings like "2025-12-28T12:00"
        // We look for the hour part.
        // Incoming time format is "HH:MM", we just need the "HH:00" part usually.
        const targetHour = time.split(":")[0];
        const targetTimeStr = `T${targetHour}:00`;
        
        const timeIndex = hourlyData.time.findIndex((t: string) => t.includes(targetTimeStr));
        // Fallback to noon or 0 index if specific hour not found (e.g. if time is 23:59 and API only goes to 23:00)
        const index = timeIndex !== -1 ? timeIndex : 12; 
        
        const code = hourlyData.weather_code?.[index];
        const temp = hourlyData.temperature_2m?.[index];
        
        if (code === undefined || temp === undefined) {
             // Try fallback to first available
             if (hourlyData.weather_code?.length > 0) {
                 const details = getWeatherDetails(hourlyData.weather_code[0]);
                 result = {
                    weather_temperature: hourlyData.temperature_2m[0],
                    weather_description: details.description,
                    weather_icon: details.icon,
                 };
             } else {
                throw new Error("Incomplete weather data received");
             }
        } else {
            const details = getWeatherDetails(code);
            result = {
                weather_temperature: temp,
                weather_description: details.description,
                weather_icon: details.icon,
            };
        }
    } else {
        throw new Error("No hourly weather data found in response");
    }

    // Save to cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;

  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

function getMockWeatherData(date: string) {
  // Generate deterministic mock data based on date string
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = date.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const tempBase = 20;
  const tempVariance = hash % 10; // -9 to 9 roughly
  const temperature = tempBase + tempVariance;
  
  const descriptions = ["Sunny", "Partly Cloudy", "Cloudy", "Rain", "Light Rain"];
  const descIndex = Math.abs(hash) % descriptions.length;
  const description = descriptions[descIndex];
  
  // Use public static images for icons
  const icons = [
    "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png",
    "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png",
    "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0003_white_cloud.png",
    "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0009_light_rain_showers.png",
    "https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0009_light_rain_showers.png"
  ];
  
  return {
    weather_temperature: temperature,
    weather_description: description,
    weather_icon: icons[descIndex],
    location: {
      name: "Rome (Mock)",
      country: "Italy",
      region: "Lazio",
      lat: "41.903",
      lon: "12.496",
      timezone_id: "Europe/Rome",
      localtime: `${date} 12:00`
    }
  };
}
