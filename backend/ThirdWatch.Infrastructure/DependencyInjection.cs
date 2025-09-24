using System.Reflection;
using Azure.Storage.Blobs;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ThirdWatch.Application.Services;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Configuration;
using ThirdWatch.Infrastructure.Persistence;
using ThirdWatch.Infrastructure.Persistence.Contexts;
using ThirdWatch.Infrastructure.Persistence.Repositories;
using ThirdWatch.Infrastructure.Services;
using ThirdWatch.Shared.Helpers;

namespace ThirdWatch.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IWebhookEndpointRepository, WebhookEndpointRepository>();

        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<JwtHelper>();
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();

        services.AddScoped<IEventPublisher, EventPublisher>();

        services.AddDatabaseServices();

        services.AddMassTransitServices(configuration);

        services.AddAzureStorageServices(configuration);

        return services;
    }

    private static IServiceCollection AddAzureStorageServices(this IServiceCollection services, IConfiguration configuration)
    {
        var azureStorageConfig = configuration.GetSection(AzureStorageConfiguration.SectionName).Get<AzureStorageConfiguration>()
                                ?? throw new InvalidOperationException($"Azure Storage configuration section '{AzureStorageConfiguration.SectionName}' is missing");

        services.Configure<AzureStorageConfiguration>(configuration.GetSection(AzureStorageConfiguration.SectionName));

        services.AddSingleton(_ => new BlobServiceClient(azureStorageConfig.ConnectionString));

        services.AddScoped<IBlobStorageService, AzureBlobStorageService>();

        return services;
    }

    private static IServiceCollection AddMassTransitServices(this IServiceCollection services, IConfiguration configuration)
    {
        var massTransitConfig = configuration.GetSection(ServiceBusConfiguration.SectionName).Get<ServiceBusConfiguration>()
                              ?? throw new InvalidOperationException($"MassTransit configuration section '{ServiceBusConfiguration.SectionName}' is missing");

        services.Configure<ServiceBusConfiguration>(configuration.GetSection(ServiceBusConfiguration.SectionName));

        services.AddMassTransit(configurator =>
        {
            configurator.AddConsumers(Assembly.GetExecutingAssembly());

            configurator.UsingAzureServiceBus((context, cfg) =>
            {
                cfg.Host(massTransitConfig.ConnectionString);

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
