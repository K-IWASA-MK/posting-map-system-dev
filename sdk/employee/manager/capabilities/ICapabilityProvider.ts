export interface ICapabilityProvider {
  capabilityId: string;
  capabilityName: string;
  isSupported(): boolean;
}

export class BrowserCapabilityProvider implements ICapabilityProvider {
  capabilityId = 'cap-browser-v1';
  capabilityName = 'IBrowserCapability';
  isSupported(): boolean { return true; }
}

export class MapCapabilityProvider implements ICapabilityProvider {
  capabilityId = 'cap-map-v1';
  capabilityName = 'IMapCapability';
  isSupported(): boolean { return true; }
}

export class LineCapabilityProvider implements ICapabilityProvider {
  capabilityId = 'cap-line-v1';
  capabilityName = 'ILineCapability';
  isSupported(): boolean { return true; }
}

export class WeatherCapabilityProvider implements ICapabilityProvider {
  capabilityId = 'cap-weather-v1';
  capabilityName = 'IWeatherCapability';
  isSupported(): boolean { return true; }
}
