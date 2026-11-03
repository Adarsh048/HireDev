import { ConnectorRegistry } from './registry';
import { LinkedInConnector } from './linkedin.connector';
import { NaukriConnector } from './naukri.connector';
import { IndeedConnector } from './indeed.connector';
import { InternshalaConnector } from './internshala.connector';
import { FounditConnector } from './foundit.connector';
import { WellfoundConnector } from './wellfound.connector';

// Register all available connectors
ConnectorRegistry.register(new LinkedInConnector());
ConnectorRegistry.register(new NaukriConnector());
ConnectorRegistry.register(new IndeedConnector());
ConnectorRegistry.register(new InternshalaConnector());
ConnectorRegistry.register(new FounditConnector());
ConnectorRegistry.register(new WellfoundConnector());

export * from './base.connector';
export * from './registry';

