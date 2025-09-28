import { DataSource } from 'typeorm';
import { config } from './index';
import { User } from '../models/User';
// import other entities as needed

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.dbUrl,
  entities: [User],
  synchronize: true,
});

export const connectDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};
