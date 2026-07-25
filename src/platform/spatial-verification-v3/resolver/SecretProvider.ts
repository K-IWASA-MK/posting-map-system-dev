export class SecretProvider {
  /**
   * Retrieves the Google Maps API Key from the environment variables.
   * Throws an error if it is not set.
   */
  static getGoogleMapsApiKey(): string {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      throw new Error("SecretProvider Error: GOOGLE_MAPS_API_KEY is not set in environment variables.");
    }
    return key;
  }
}
