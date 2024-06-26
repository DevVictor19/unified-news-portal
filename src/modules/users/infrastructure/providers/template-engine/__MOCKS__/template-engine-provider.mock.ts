/* eslint-disable @typescript-eslint/no-unused-vars */

import { ITemplateEngineProvider } from '@/modules/users/application/providers/template-engine-provider.interface';

export class TemplateEngineProviderMock implements ITemplateEngineProvider {
  compile(
    fileName: string,
    variables?: { [key: string]: string | object } | undefined,
  ): string {
    return 'html';
  }
}
