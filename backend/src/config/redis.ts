import { DataSourceOptions } from 'typeorm';
import { config } from './index';
import IORedis from 'ioredis';

export const redis = new IORedis(config.redisUrl);
