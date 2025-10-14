using System.Reflection;
using Azure.Storage.Blobs;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Configuration;
using ThirdWatch.Infrastructure.Persistence;
using ThirdWatch.Infrastructure.Persistence.Contexts;
using ThirdWatch.Infrastructure.Persistence.Repositories;
using ThirdWatch.Infrastructure.Services;
using ThirdWatch.Infrastructure.Workers;
using ThirdWatch.Shared.Helpers;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IWebhookEndpointRepository, WebhookEndpointRepository>();
        services.AddScoped<ISiteRepository, SiteRepository>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();
        services.AddScoped<JwtHelper>();
        services.AddScoped<IEventPublisher, EventPublisher>();

        services.AddDatabaseServices();

        services.AddMassTransitServices(configuration);

        services.AddAzureStorageServices(configuration);

        services.AddCacheServices(configuration);

        services.AddHealthCheckServices(configuration);

        services.AddHostedServices();

        return services;
    }

    public static IServiceCollection AddHostedServices(this IServiceCollection services)
    {
        services
            .AddHostedService<CleanUpDeletedWebhookHistoryFilesJob>()
            .AddHostedService<HealthCheckJob>();

        return services;
    }

    private static IServiceCollection AddHealthCheckServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<HealthCheckOptions>(configuration.GetSection(HealthCheckOptions.SectionName));

        services.AddHttpClient("HealthCheckClient", client =>
        {
            var settings = configuration.GetSection(HealthCheckOptions.SectionName).Get<HealthCheckOptions>();
            client.Timeout = TimeSpan.FromSeconds(settings?.CheckTimeoutSeconds ?? 15);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("ThirdWatch-HealthCheck/1.0");
        });

        services.AddScoped<IHealthCheckService, HealthCheckService>();

        return services;
    }

    private static IServiceCollection AddCacheServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddStackExchangeRedisCache(options => options.Configuration = configuration.GetConnectionString("Redis"));

        services.AddScoped<ICacheService, RedisCacheService>();

        return services;
    }

    private static IServiceCollection AddAzureStorageServices(this IServiceCollection services, IConfiguration configuration)
    {
        var azureStorageConfig = configuration.GetSection(AzureStorageConfiguration.SectionName).Get<AzureStorageConfiguration>()
                                ?? throw new InvalidOperationException($"Azure Storage configuration section '{AzureStorageConfiguration.SectionName}' is missing");

        services.Configure<AzureStorageConfiguration>(configuration.GetSection(AzureStorageConfiguration.SectionName));

        services.AddScoped<IBlobStorageService, AzureBlobStorageService>();
        services.AddSingleton(_ => new BlobServiceClient(azureStorageConfig.ConnectionString));
        services.AddSingleton<ICompressionService, GzipCompressionService>();

        return services;
    }

    private static IServiceCollection AddMassTransitServices(this IServiceCollection services, IConfiguration configuration)
    {
        var massTransitConfig = configuration.GetSection(MessageBusConfiguration.SectionName).Get<MessageBusConfiguration>()
                              ?? throw new InvalidOperationException($"MassTransit configuration section '{MessageBusConfiguration.SectionName}' is missing");

        services.Configure<MessageBusConfiguration>(configuration.GetSection(MessageBusConfiguration.SectionName));

        services.AddMassTransit(configurator =>
        {
            configurator.AddConsumers(Assembly.GetExecutingAssembly());

            configurator.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(massTransitConfig.ConnectionString);

                cfg.ConcurrentMessageLimit = 50;

                cfg.UseMessageRetry(retryConfig =>
                {
                    retryConfig.Incremental(
                        massTransitConfig.Consumer.RetryCount,
                        TimeSpan.FromSeconds(1),
                        TimeSpan.FromSeconds(massTransitConfig.Consumer.RetryDelaySeconds));
                });

                cfg.ConfigureEndpoints(context);
            });

            if (massTransitConfig.EnableOutbox)
            {
                configurator.AddEntityFrameworkOutbox<ApplicationDbContext>(outboxConfig =>
                {
                    outboxConfig.UseSqlServer();
                    outboxConfig.UseBusOutbox();
                    outboxConfig.QueryDelay = TimeSpan.FromSeconds(5);
                    outboxConfig.DuplicateDetectionWindow = TimeSpan.FromMinutes(30);
                });
            }
        });

        return services;
    }
}
