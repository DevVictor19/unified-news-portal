import { Injectable } from '@nestjs/common';

import { SubjectEntity } from '../../domain/entities/subjects.entity';

import { IBaseUseCase } from '@/common/application/usecases/base-usecase.interface';
import { RepositorySearch } from '@/common/domain/repositories/base-search-repository.interface';
import { IDatabaseService } from '@/modules/common/database/application/services/database-service.interface';

type Input = RepositorySearch;

type Output = SubjectEntity[];

@Injectable()
export class SearchSubjectsUseCase implements IBaseUseCase<Input, Output> {
  constructor(private databaseService: IDatabaseService) {}

  execute(input: Input): Promise<Output> {
    return this.databaseService.subjects.search(input);
  }
}
