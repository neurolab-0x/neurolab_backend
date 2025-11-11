import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { logger } from '../logger/config.js';

dotenv.config();

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.pendingMessages = []; // 🟢 Queue messages during reconnects

    this.config = {
      broker: {
        url: process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883'
      },
      auth: {
        username: process.env.MQTT_USERNAME || 'polo',
        password: process.env.MQTT_PASSWORD || '#nelprox92'
      },
      options: {
        clientId: process.env.MQTT_CLIENT_ID || `neurolab_${Math.random().toString(16).slice(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000, // 5s retry delay
        connectTimeout: 30 * 1000,
        keepalive: 60,
        will: {
          topic: 'devices/backend/status',
          payload: JSON.stringify({ status: 'offline' }),
          qos: 1,
          retain: true
        }
      }
    };
  }

  // ✅ Initialize connection to broker
  async initialize() {
    try {
      logger.info('Initializing MQTT service...');
      logger.info(`Connecting to MQTT broker at ${this.config.broker.url}`);

      this.client = mqtt.connect(this.config.broker.url, {
        ...this.config.options,
        username: this.config.auth.username,
        password: this.config.auth.password
      });

      this.registerEventHandlers();
    } catch (error) {
      logger.error('Failed to initialize MQTT service:', error);
      throw error;
    }
  }

  // ✅ Set up all MQTT event listeners
  registerEventHandlers() {
    this.client.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.info('✅ Connected to MQTT broker');

      this.publishStatus('online');
      this.subscribeToTopics();

      // Flush queued messages
      this.flushPendingMessages();
    });

    this.client.on('error', (error) => {
      logger.error('❌ MQTT connection error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('⚠️ MQTT connection closed');
      this.handleReconnect();
    });

    this.client.on('reconnect', () => {
      this.reconnectAttempts++;
      logger.info(`🔁 Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    });

    this.client.on('offline', () => {
      logger.warn('📴 MQTT client went offline');
      this.isConnected = false;
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  // ✅ Safe reconnect logic
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`❌ Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping reconnection attempts.`);
      this.client.end();
      return;
    }
  }

  // ✅ Subscribe to necessary topics
  subscribeToTopics() {
    const userId = process.env.DEFAULT_USER_ID || 'public'; // 🟢 Use dynamic user ID if available

    const topics = [
      'devices/+/status',
      'devices/+/data',
      'devices/+/control',
      `user/${userId}/messages`,
      `user/${userId}/appointments`,
      `user/${userId}/session`
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) logger.error(`❌ Failed to subscribe to ${topic}:`, err);
        else logger.info(`📡 Subscribed to topic: ${topic}`);
      });
    });
  }

  // ✅ Handle incoming messages
  handleMessage(topic, message) {
    try {
      const messageStr = message.toString();
      let payload = {};

      try {
        payload = JSON.parse(messageStr);
      } catch {
        payload = { value: messageStr, timestamp: Date.now() };
      }

      if (topic.includes('/status')) this.handleStatusUpdate(topic, payload);
      else if (topic.includes('/data')) this.handleDataUpdate(topic, payload);
      else if (topic.includes('/control')) this.handleControlMessage(topic, payload);
    } catch (error) {
      logger.error(`Error processing message from ${topic}:`, error);
    }
  }

  handleStatusUpdate(topic, payload) {
    logger.info(`🟢 Device status update: ${topic}`, payload);
  }

  handleDataUpdate(topic, payload) {
    logger.info(`📊 Device data update: ${topic}`, payload);
  }

  handleControlMessage(topic, payload) {
    logger.info(`🛠️ Control message received: ${topic}`, payload);
  }

  // ✅ Safe publish (auto-queues messages if disconnected)
  async publish(topic, message) {
    if (!this.isConnected) {
      logger.warn(`⚠️ MQTT not connected. Queuing message to ${topic}`);
      this.pendingMessages.push({ topic, message });
      return;
    }

    return new Promise((resolve, reject) => {
      this.client.publish(topic, JSON.stringify(message), (error) => {
        if (error) {
          logger.error(`❌ Failed to publish to ${topic}:`, error);
          reject(error);
        } else {
          logger.info(`📨 Published to ${topic}`);
          resolve();
        }
      });
    });
  }

  // ✅ Publish backend status
  publishStatus(status) {
    this.publish('devices/backend/status', { status, timestamp: Date.now() });
  }

  // ✅ Retry queued messages
  flushPendingMessages() {
    if (this.pendingMessages.length === 0) return;

    logger.info(`📬 Flushing ${this.pendingMessages.length} pending MQTT messages...`);
    const queued = [...this.pendingMessages];
    this.pendingMessages = [];

    queued.forEach(({ topic, message }) => {
      this.publish(topic, message).catch(err => logger.error('❌ Failed queued publish:', err));
    });
  }

  // ✅ Graceful shutdown
  async shutdown() {
    if (!this.client) return;
    try {
      await this.publishStatus('offline');
      return new Promise((resolve) => {
        this.client.end(true, () => {
          logger.info('🔌 MQTT client disconnected gracefully');
          resolve();
        });
      });
    } catch (error) {
      logger.error('Error during MQTT shutdown:', error);
      throw error;
    }
  }
}

// 🟢 Export singleton instance
export const mqttService = new MQTTService();
