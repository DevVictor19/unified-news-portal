import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';

import { SignupUserUseCase } from '../../signup-user.usecase';

import { TOKEN_TYPE } from '@/common/enums/token-type.enum';
import { JwtProviderMock } from '@/modules/common/jwt/providers/jwt/__MOCKS__/jwt-provider.mock';
import { IJwtProvider } from '@/modules/common/jwt/providers/jwt/jwt-provider.interface';
import { UsersInMemoryRepository } from '@/modules/users/database/repositories/in-memory/users-in-memory.repository';
import { IUsersRepository } from '@/modules/users/database/repositories/users-repository.interface';
import { UserEntity } from '@/modules/users/entities/users.entity';
import { UserEntityFactory } from '@/modules/users/entities/users.factory';
import { HashProviderMock } from '@/modules/users/providers/hash/__MOCKS__/hash-provider.mock';
import { IHashProvider } from '@/modules/users/providers/hash/hash-provider.interface';
import { TemplateEngineProviderMock } from '@/modules/users/providers/template-engine/__MOCKS__/template-engine-provider.mock';
import { ITemplateEngineProvider } from '@/modules/users/providers/template-engine/template-engine-provider.interface';
import { MailServiceMock } from '@/modules/users/services/mail/__MOCKS__/mail-service.mock';
import { IMailService } from '@/modules/users/services/mail/mail-service.interface';

describe('SignupUserUseCase unit tests', () => {
  let sut: SignupUserUseCase;
  let repository: IUsersRepository;
  let factory: UserEntityFactory;
  let hashProvider: IHashProvider;
  let templateProvider: ITemplateEngineProvider;
  let jwtProvider: IJwtProvider;
  let mailProvider: IMailService;
  let serverUrl: string;
  let payload: any;

  beforeEach(() => {
    payload = {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password(),
    };
    repository = new UsersInMemoryRepository();
    factory = new UserEntityFactory();
    hashProvider = new HashProviderMock();
    templateProvider = new TemplateEngineProviderMock();
    jwtProvider = new JwtProviderMock();
    mailProvider = new MailServiceMock();
    serverUrl = 'server url';
    sut = new SignupUserUseCase(
      repository,
      factory,
      hashProvider,
      templateProvider,
      jwtProvider,
      mailProvider,
      serverUrl,
    );
  });

  it('Should create and save a user with hashed password', async () => {
    const repositoryFindByEmailSpy = jest.spyOn(repository, 'findByEmail');
    const hashProviderSpy = jest.spyOn(hashProvider, 'generateHash');
    const factorySpy = jest.spyOn(factory, 'create');
    const repositoryInsertSpy = jest.spyOn(repository, 'insert');

    await sut.execute(payload);

    const hashedPassword = await hashProviderSpy.mock.results[0].value;
    const user = await factorySpy.mock.results[0].value;

    expect(repositoryFindByEmailSpy).toHaveBeenCalledWith(payload.email);
    expect(hashProviderSpy).toHaveBeenCalledWith(payload.password);
    expect(factorySpy).toHaveBeenCalledWith({
      email: payload.email,
      name: payload.name,
      password: hashedPassword,
    });
    expect(repositoryInsertSpy).toHaveBeenCalledWith(user);
  });

  it('Should send a verification email with a url for verify', async () => {
    const signJwtSpy = jest.spyOn(jwtProvider, 'sign');
    const compileTemplateSpy = jest.spyOn(templateProvider, 'compile');
    const sendEmailSpy = jest.spyOn(mailProvider, 'sendMail');

    await sut.execute(payload);

    const token = await signJwtSpy.mock.results[0].value;
    const link = `${serverUrl}/users/verify?token=${token}`;
    const html = await compileTemplateSpy.mock.results[0].value;

    expect(signJwtSpy).toHaveBeenCalledWith({
      expiresIn: '2h',
      payload: { email: payload.email, token_type: TOKEN_TYPE.EMAIL_VERIFY },
    });
    expect(compileTemplateSpy).toHaveBeenCalledWith('email-verification.hbs', {
      link,
    });
    expect(sendEmailSpy).toHaveBeenCalledWith({
      body: html,
      subject: 'Verificação de Email',
      to: {
        email: payload.email,
        name: payload.name,
      },
    });
  });

  it('Should throw a BadRequestException if email is already in use', async () => {
    const repositoryFindByEmailSpy = jest.spyOn(repository, 'findByEmail');
    repositoryFindByEmailSpy.mockResolvedValue({} as UserEntity);

    await expect(() => sut.execute(payload)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
