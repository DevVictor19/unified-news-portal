import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoDatabaseService } from './mongo-database.service';
import { IDatabaseService } from '../../application/services/database-service.interface';

import {
  CategoryMongoEntity,
  CategoryMongoSchema,
} from '@/modules/categories/infrastructure/database/models/mongo/categories-mongo.model';
import {
  ClassMongoEntity,
  ClassMongoSchema,
} from '@/modules/classes/infrastrucutre/database/models/mongo/classes-mongo.model';
import { IEnvConfigProvider } from '@/modules/common/env-config/application/providers/env-config-provider.interface';
import {
  CourseMongoEntity,
  CourseMongoSchema,
} from '@/modules/courses/infrastructure/database/models/mongo/courses-mongo.model';
import {
  PostTypeMongoEntity,
  PostTypeMongoSchema,
} from '@/modules/post-types/infrastructure/database/models/mongo/post-types-mongo.model';
import {
  PostsMongoEntity,
  PostsMongoSchema,
} from '@/modules/posts/infrastructure/database/models/mongo/posts-mongo.model';
import {
  SubjectMongoEntity,
  SubjectMongoSchema,
} from '@/modules/subjects/infrastructure/database/models/mongo/subjects-mongo.model';
import {
  UserMongoEntity,
  UserMongoSchema,
} from '@/modules/users/infrastructure/database/models/mongo/users-mongo.model';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (envConfigProvider: IEnvConfigProvider) => ({
        uri: envConfigProvider.getDbHost(),
        autoIndex: true,
        dbName: 'pnu',
      }),
      inject: [IEnvConfigProvider],
    }),
    MongooseModule.forFeature([
      { name: UserMongoEntity.name, schema: UserMongoSchema },
      { name: CategoryMongoEntity.name, schema: CategoryMongoSchema },
      { name: ClassMongoEntity.name, schema: ClassMongoSchema },
      { name: SubjectMongoEntity.name, schema: SubjectMongoSchema },
      { name: PostTypeMongoEntity.name, schema: PostTypeMongoSchema },
      { name: CourseMongoEntity.name, schema: CourseMongoSchema },
      { name: PostsMongoEntity.name, schema: PostsMongoSchema },
    ]),
  ],
  providers: [{ provide: IDatabaseService, useClass: MongoDatabaseService }],
  exports: [IDatabaseService],
})
export class MongoDatabaseModule {}
