import { JobConnector } from './base.connector';
import { logger } from '../../utils/logger';

export class ConnectorRegistry {
  private static connectors: Map<string, JobConnector> = new Map();

  public static register(connector: JobConnector): void {
    if (this.connectors.has(connector.sourceName)) {
      logger.warn(`Connector for ${connector.sourceName} is already registered. Overwriting.`);
    }
    this.connectors.set(connector.sourceName, connector);
    logger.info(`Registered connector: ${connector.sourceName}`);
  }

  public static get(sourceName: string): JobConnector | undefined {
    return this.connectors.get(sourceName);
  }

  public static getAll(): JobConnector[] {
    return Array.from(this.connectors.values());
  }
}

