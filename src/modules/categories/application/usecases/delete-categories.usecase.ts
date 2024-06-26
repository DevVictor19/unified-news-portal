import { Injectable } from '@nestjs/common';

import { NotFoundError } from '@/common/application/errors/application-errors';
import { IBaseUseCase } from '@/common/application/usecases/base-usecase.interface';
import { IDatabaseService } from '@/modules/common/database/application/services/database-service.interface';

type Input = {
  categoryId: string;
};

type Output = void;

@Injectable()
export class DeleteCategoriesUseCase implements IBaseUseCase<Input, Output> {
  constructor(private databaseService: IDatabaseService) {}

  async execute(input: Input): Promise<Output> {
    const existentCategory = await this.databaseService.categories.findById(
      input.categoryId,
    );

    if (!existentCategory) {
      throw new NotFoundError();
    }

    await this.databaseService.categories.delete(input.categoryId);
  }
}
