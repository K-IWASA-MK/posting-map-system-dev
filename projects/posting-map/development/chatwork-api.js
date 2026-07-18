/**
 * POSTING MAP
 * Phase 37: Chatwork API Client Wrapper
 */

class ChatworkAPI {
  constructor() {
    this.token = process.env.CHATWORK_API_TOKEN;
    this.roomId = process.env.CHATWORK_ROOM_ID;
    this.isMock = !this.token || this.token === 'mock' || !this.roomId;
    
    if (this.isMock) {
      console.log("ℹ️ Chatwork API Client initialized in [MOCK] simulation mode.");
    }
  }

  async sendMessage(message) {
    if (this.isMock) {
      console.log("\n--- [CHATWORK MOCK SEND] ---");
      console.log(`Room ID: ${this.roomId || 'MOCK-ROOM'}`);
      console.log(`Message:\n${message}`);
      console.log("-----------------------------\n");
      return { success: true, messageId: `mock-msg-${Date.now()}` };
    }

    const url = `https://api.chatwork.com/v2/rooms/${this.roomId}/messages`;
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'X-ChatWorkToken': this.token,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ body: message })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Chatwork HTTP Status ${res.status}: ${text}`);
      }

      const json = await res.json();
      return { success: true, messageId: json.message_id };
    } catch (e) {
      console.error(`❌ Chatwork sending failure: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
}

module.exports = ChatworkAPI;
