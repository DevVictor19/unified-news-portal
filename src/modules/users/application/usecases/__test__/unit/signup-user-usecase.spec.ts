import { faker } from '@faker-js/faker';

import { IHashProvider } from '../../../providers/hash-provider.interface';
import { ITemplateEngineProvider } from '../../../providers/template-engine-provider.interface';
import { IMailService } from '../../../services/mail-service.interface';
import { SignupUserUseCase } from '../../signup-user.usecase';

import { EmailInUseError } from '@/common/application/errors/application-errors'; // Import the correct error
import { IDatabaseService } from '@/modules/common/database/application/services/database-service.interface';
import { DatabaseServiceMock } from '@/modules/common/database/infrastructure/__MOCKS__/database-service.mock';
import { IEnvConfigProvider } from '@/modules/common/env-config/application/providers/env-config-provider.interface';
import { EnvConfigProviderMock } from '@/modules/common/env-config/infrastructure/__MOCKS__/env-config-provider.mock';
import { IJwtProvider } from '@/modules/common/jwt/application/providers/jwt-provider.interface';
import { JwtProviderMock } from '@/modules/common/jwt/infrastructure/__MOCKS__/jwt-provider.mock';
import { UserEntity } from '@/modules/users/domain/entities/users.entity';
import { HashProviderMock } from '@/modules/users/infrastructure/providers/hash/__MOCKS__/hash-provider.mock';
import { TemplateEngineProviderMock } from '@/modules/users/infrastructure/providers/template-engine/__MOCKS__/template-engine-provider.mock';
import { MailServiceMock } from '@/modules/users/infrastructure/services/mail/__MOCKS__/mail-service.mock';

describe('SignupUserUseCase unit tests', () => {
  let sut: SignupUserUseCase;
  let databaseService: IDatabaseService;
  let hashProvider: IHashProvider;
  let templateProvider: ITemplateEngineProvider;
  let jwtProvider: IJwtProvider;
  let mailService: IMailService;
  let envConfigProvider: IEnvConfigProvider;
  let payload: any;

  beforeEach(() => {
    payload = {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password(),
    };
    databaseService = new DatabaseServiceMock();
    hashProvider = new HashProviderMock();
    templateProvider = new TemplateEngineProviderMock();
    jwtProvider = new JwtProviderMock();
    mailService = new MailServiceMock();
    envConfigProvider = new EnvConfigProviderMock();
    sut = new SignupUserUseCase(
      databaseService,
      hashProvider,
      templateProvider,
      jwtProvider,
      mailService,
      envConfigProvider,
    );
  });

  it('Should create and save a user with hashed password', async () => {
    const repositoryFindByEmailSpy = jest.spyOn(
      databaseService.users,
      'findByEmail',
    );
    const hashProviderSpy = jest.spyOn(hashProvider, 'generateHash');
    const repositoryInsertSpy = jest.spyOn(databaseService.users, 'insert');

    await sut.execute(payload);

    expect(repositoryFindByEmailSpy).toHaveBeenCalledWith(payload.email);
    expect(hashProviderSpy).toHaveBeenCalledWith(payload.password);
    expect(repositoryInsertSpy).toHaveBeenCalled();
  });

  it('Should send a verification email with a url for verify', async () => {
    const signJwtSpy = jest.spyOn(jwtProvider, 'sign');
    const compileTemplateSpy = jest.spyOn(templateProvider, 'compile');
    const sendEmailSpy = jest.spyOn(mailService, 'sendMail');

    await sut.execute(payload);

    expect(signJwtSpy).toHaveBeenCalled();
    expect(compileTemplateSpy).toHaveBeenCalled();
    expect(sendEmailSpy).toHaveBeenCalled();
  });

  it('Should throw an EmailInUseError if email is already in use', async () => {
    const repositoryFindByEmailSpy = jest.spyOn(
      databaseService.users,
      'findByEmail',
    );
    repositoryFindByEmailSpy.mockResolvedValue({} as UserEntity);

    await expect(() => sut.execute(payload)).rejects.toBeInstanceOf(
      EmailInUseError,
    );
  });
});
