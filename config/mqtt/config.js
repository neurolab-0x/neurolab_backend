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
    this.config = {
      broker: {
        protocol: 'mqtt',
        host: 'broker.hivemq.com',
        port: 1883,
        url: 'mqtt://broker.hivemq.com:1883'
      },
      auth: {
        username: 'polo',
        password: '#nelprox92'
      },
      options: {
        clientId: '214669',
        clean: true,
        reconnectPeriod: 10000,
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

  async initialize() {
    try {
      logger.info('Initializing MQTT service...');
      logger.info(`Connecting to MQTT broker at ${this.config.broker.url}`);

      this.client = mqtt.connect(this.config.broker.url, {
        ...this.config.options,
        username: this.config.auth.username,
        password: this.config.auth.password
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        logger.info('Connected to MQTT broker');
        this.subscribeToTopics();
        this.publishStatus('online');
      });

      this.client.on('error', (error) => {
        logger.error('MQTT connection error:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logger.info('MQTT connection closed');
        this.isConnected = false;
        this.handleReconnect();
      });

      this.client.on('reconnect', () => {
        this.reconnectAttempts++;
        logger.info(`Attempting to reconnect (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      });

      this.client.on('offline', () => {
        logger.info('MQTT client went offline');
        this.isConnected = false;
        this.publishStatus('offline');
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

    } catch (error) {
      logger.error('Failed to initialize MQTT service:', error);
      throw error;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping reconnection attempts.`);
      this.client.end();
      return;
    }
  }

  publishStatus(status) {
    if (this.isConnected) {
      this.publish('devices/backend/status', { status });
    }
  }

  subscribeToTopics() {
    const topics = [
      'devices/+/status',
      'devices/+/data',
      'devices/+/control'
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          logger.error(`Failed to subscribe to ${topic}:`, err);
        }
      });
    });
  }

  handleMessage(topic, message) {
    try {
      let payload;
      const messageStr = message.toString();

      // Try to parse as JSON first
      try {
        payload = JSON.parse(messageStr);
      } catch (e) {
        // If not JSON, use the message as is
        payload = {
          value: messageStr,
          timestamp: Date.now()
        };
      }

      // Handle different message types based on topic
      if (topic.includes('/status')) {
        this.handleStatusUpdate(topic, payload);
      } else if (topic.includes('/data')) {
        this.handleDataUpdate(topic, payload);
      } else if (topic.includes('/control')) {
        this.handleControlMessage(topic, payload);
      }
    } catch (error) {
      logger.error(`Error processing message from ${topic}:`, error);
    }
  }

  handleStatusUpdate(topic, payload) {
    // Handle device status updates
    let status, timestamp;
    if (typeof payload === 'object' && payload !== null) {
      status = payload.status || payload.value;
      timestamp = payload.timestamp;
    } else {
      status = payload;
    }

    if (!timestamp) {
      timestamp = Date.now();
    }

  }

  handleDataUpdate(topic, payload) {
    // Handle device data updates
    logger.info(`Device data update: ${topic}`, payload);
  }

  handleControlMessage(topic, payload) {
    // Handle control messages
    logger.info(`Control message received: ${topic}`, payload);
  }

  async publish(topic, message) {
    if (!this.isConnected) {
      throw new Error('MQTT client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.publish(topic, JSON.stringify(message), (error) => {
        if (error) {
          logger.error(`Failed to publish to ${topic}:`, error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async shutdown() {
    if (this.client) {
      try {
        await this.publishStatus('offline');
        return new Promise((resolve) => {
          this.client.end(true, () => {
            logger.info('MQTT client disconnected');
            resolve();
          });
        });
      } catch (error) {
        logger.error('Error during MQTT shutdown:', error);
        throw error;
      }
    }
  }
}

// Create and export a singleton instance
export const mqttService = new MQTTService(); 