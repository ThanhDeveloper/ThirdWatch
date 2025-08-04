Backend structure example

ThirdWatch.API/
├── src/
│   ├── ThirdWatch.API/                    # Presentation Layer (Web API)
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── UserController.cs
│   │   │   └── BaseController.cs
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   ├── RequestLoggingMiddleware.cs
│   │   │   └── JwtMiddleware.cs
│   │   ├── Filters/
│   │   │   ├── ValidationFilter.cs
│   │   │   └── AuthorizationFilter.cs
│   │   ├── Extensions/
│   │   │   ├── ServiceCollectionExtensions.cs
│   │   │   └── ApplicationBuilderExtensions.cs
│   │   ├── Models/
│   │   │   ├── Requests/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginRequest.cs
│   │   │   │   │   └── RegisterRequest.cs
│   │   │   │   └── User/
│   │   │   │       ├── CreateUserRequest.cs
│   │   │   │       └── UpdateUserRequest.cs
│   │   │   └── Responses/
│   │   │       ├── ApiResponse.cs
│   │   │       ├── PagedResponse.cs
│   │   │       └── ErrorResponse.cs
│   │   ├── Program.cs
│   │   ├── Startup.cs
│   │   └── appsettings.json
│   │
│   ├── ThirdWatch.Application/             # Application Layer (Business Logic)
│   │   ├── Services/
│   │   │   ├── Interfaces/
│   │   │   │   ├── IAuthService.cs
│   │   │   │   ├── IUserService.cs
│   │   │   │   └── IEmailService.cs
│   │   │   └── Implementations/
│   │   │       ├── AuthService.cs
│   │   │       ├── UserService.cs
│   │   │       └── EmailService.cs
│   │   ├── Handlers/
│   │   │   ├── Commands/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginCommand.cs
│   │   │   │   │   └── RegisterCommand.cs
│   │   │   │   └── User/
│   │   │   │       ├── CreateUserCommand.cs
│   │   │   │       └── UpdateUserCommand.cs
│   │   │   ├── Queries/
│   │   │   │   ├── Auth/
│   │   │   │   │   └── GetUserProfileQuery.cs
│   │   │   │   └── User/
│   │   │   │       ├── GetUserByIdQuery.cs
│   │   │   │       └── GetUsersQuery.cs
│   │   │   └── Handlers/
│   │   │       ├── Auth/
│   │   │       │   ├── LoginCommandHandler.cs
│   │   │       │   └── RegisterCommandHandler.cs
│   │   │       └── User/
│   │   │           ├── CreateUserCommandHandler.cs
│   │   │           └── GetUserByIdQueryHandler.cs
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginDto.cs
│   │   │   │   └── RegisterDto.cs
│   │   │   └── User/
│   │   │       ├── UserDto.cs
│   │   │       └── UserProfileDto.cs
│   │   ├── Mappings/
│   │   │   ├── AutoMapperProfile.cs
│   │   │   └── MappingExtensions.cs
│   │   ├── Validators/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequestValidator.cs
│   │   │   │   └── RegisterRequestValidator.cs
│   │   │   └── User/
│   │   │       └── CreateUserRequestValidator.cs
│   │   ├── Exceptions/
│   │   │   ├── BusinessException.cs
│   │   │   ├── ValidationException.cs
│   │   │   └── NotFoundException.cs
│   │   └── Interfaces/
│   │       ├── ICurrentUserService.cs
│   │       └── IDateTimeService.cs
│   │
│   ├── ThirdWatch.Domain/                 # Domain Layer (Core Business)
│   │   ├── Entities/
│   │   │   ├── Base/
│   │   │   │   ├── BaseEntity.cs
│   │   │   │   └── AuditableEntity.cs
│   │   │   ├── User.cs
│   │   │   ├── Role.cs
│   │   │   └── UserRole.cs
│   │   ├── Enums/
│   │   │   ├── UserStatus.cs
│   │   │   └── UserType.cs
│   │   ├── ValueObjects/
│   │   │   ├── Email.cs
│   │   │   └── Password.cs
│   │   ├── Events/
│   │   │   ├── UserCreatedEvent.cs
│   │   │   └── UserUpdatedEvent.cs
│   │   ├── Exceptions/
│   │   │   ├── DomainException.cs
│   │   │   └── InvalidEmailException.cs
│   │   └── Interfaces/
│   │       ├── IRepository.cs
│   │       └── IUnitOfWork.cs
│   │
│   ├── ThirdWatch.Infrastructure/         # Infrastructure Layer (External Concerns)
│   │   ├── Persistence/
│   │   │   ├── Contexts/
│   │   │   │   ├── ApplicationDbContext.cs
│   │   │   │   └── DesignTimeDbContextFactory.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── UserConfiguration.cs
│   │   │   │   └── RoleConfiguration.cs
│   │   │   ├── Repositories/
│   │   │   │   ├── Base/
│   │   │   │   │   ├── GenericRepository.cs
│   │   │   │   │   └── IGenericRepository.cs
│   │   │   │   └── UserRepository.cs
│   │   │   ├── UnitOfWork.cs
│   │   │   └── Extensions/
│   │   │       └── ServiceCollectionExtensions.cs
│   │   ├── Identity/
│   │   │   ├── ApplicationUser.cs
│   │   │   ├── ApplicationRole.cs
│   │   │   └── ApplicationDbContext.cs
│   │   ├── Services/
│   │   │   ├── CurrentUserService.cs
│   │   │   ├── DateTimeService.cs
│   │   │   └── EmailService.cs
│   │   ├── External/
│   │   │   ├── Services/
│   │   │   │   ├── IExternalApiService.cs
│   │   │   │   └── ExternalApiService.cs
│   │   │   └── Clients/
│   │   │       └── HttpClientWrapper.cs
│   │   └── Logging/
│   │       ├── LoggingService.cs
│   │       └── SerilogExtensions.cs
│   │
│   └── ThirdWatch.Shared/                 # Shared Layer (Common Utilities)
│       ├── Constants/
│       │   ├── AppConstants.cs
│       │   ├── ErrorMessages.cs
│       │   └── ValidationMessages.cs
│       ├── Extensions/
│       │   ├── StringExtensions.cs
│       │   ├── DateTimeExtensions.cs
│       │   └── EnumExtensions.cs
│       ├── Helpers/
│       │   ├── PasswordHelper.cs
│       │   ├── JwtHelper.cs
│       │   └── EncryptionHelper.cs
│       ├── Models/
│       │   ├── Result.cs
│       │   ├── PaginationResult.cs
│       │   └── BaseResponse.cs
│       └── Attributes/
│           ├── SwaggerDefaultValueAttribute.cs
│           └── ValidateModelAttribute.cs
│
├── tests/                                 # Test Projects
│   ├── ThirdWatch.API.Tests/
│   │   ├── Controllers/
│   │   │   ├── AuthControllerTests.cs
│   │   │   └── UserControllerTests.cs
│   │   ├── Integration/
│   │   │   └── ApiIntegrationTests.cs
│   │   └── TestBase/
│   │       ├── TestBase.cs
│   │       └── TestDataBuilder.cs
│   │
│   ├── ThirdWatch.Application.Tests/
│   │   ├── Services/
│   │   │   ├── AuthServiceTests.cs
│   │   │   └── UserServiceTests.cs
│   │   ├── Handlers/
│   │   │   ├── Auth/
│   │   │   │   └── LoginCommandHandlerTests.cs
│   │   │   └── User/
│   │   │       └── CreateUserCommandHandlerTests.cs
│   │   └── Validators/
│   │       ├── Auth/
│   │       │   └── LoginRequestValidatorTests.cs
│   │       └── User/
│   │           └── CreateUserRequestValidatorTests.cs
│   │
│   ├── ThirdWatch.Domain.Tests/
│   │   ├── Entities/
│   │   │   └── UserTests.cs
│   │   ├── ValueObjects/
│   │   │   ├── EmailTests.cs
│   │   │   └── PasswordTests.cs
│   │   └── Events/
│   │       └── UserCreatedEventTests.cs
│   │
│   └── ThirdWatch.Infrastructure.Tests/
│       ├── Persistence/
│       │   ├── Repositories/
│       │   │   └── UserRepositoryTests.cs
│       │   └── UnitOfWorkTests.cs
│       └── Services/
│           ├── CurrentUserServiceTests.cs
│           └── EmailServiceTests.cs
│
├── docs/                                  # Documentation
│   ├── API/
│   │   ├── README.md
│   │   └── endpoints.md
│   ├── Architecture/
│   │   ├── README.md
│   │   └── clean-architecture.md
│   └── Database/
│       ├── README.md
│       └── migrations.md
│
├── scripts/                               # Build & Deployment Scripts
│   ├── build.ps1
│   ├── deploy.ps1
│   └── database/
│       ├── init-db.ps1
│       └── seed-data.ps1
│
├── .github/                               # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── security.yml
│
├── ThirdWatch.API.sln                     # Solution File
├── Directory.Build.props                  # Common Build Properties
├── global.json                           # .NET Version
├── .editorconfig                         # Code Style Rules
├── .gitignore
├── README.md
├── CHANGELOG.md
└── LICENSE


# 1. API Layer (Presentation)
Controllers: Handle HTTP requests/responses
Middleware: Cross-cutting concerns (logging, auth, exception handling)
Models: Request/Response DTOs
Filters: Validation và Authorization
# 2. Application Layer (Business Logic)
Services: Business logic implementation
Handlers: CQRS pattern (Commands/Queries)
DTOs: Data Transfer Objects
Validators: FluentValidation
Mappings: AutoMapper configurations
# 3. Domain Layer (Core Business)
Entities: Domain models với business rules
Value Objects: Immutable objects
Events: Domain events
Interfaces: Repository contracts
# 4. Infrastructure Layer (External Concerns)
Persistence: EF Core, DbContext, Repositories
Identity: ASP.NET Core Identity
External Services: Third-party integrations
Logging: Serilog, structured logging
# 5. Shared Layer (Common Utilities)
Constants: App-wide constants
Extensions: Extension methods
Helpers: Utility classes
Models: Common response models