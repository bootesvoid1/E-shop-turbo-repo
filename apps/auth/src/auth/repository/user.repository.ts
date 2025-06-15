import { Repository, DataSource } from 'typeorm';
import { UsersEntity } from '@repo/shared-entities';

export class UsersEntityRepository extends Repository<UsersEntity> {
  constructor(private dataSource: DataSource) {
    super(UsersEntity, dataSource.createEntityManager());
  }
}