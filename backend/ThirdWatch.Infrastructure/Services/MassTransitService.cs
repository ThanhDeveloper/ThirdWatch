using System.Reflection;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ThirdWatch.Infrastructure.Configuration;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Services;

/// <summary>
/// Extension methods for configuring MassTransit with Azure Service Bus
/// </summary>
public static class MassTransitService
{
    /// <summary>
    /// Adds MassTransit services with Azure Service Bus and outbox pattern
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <param name="configuration">Configuration</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddMassTransitServices(this IServiceCollection services, IConfiguration configuration)
    {
        var massTransitConfig = configuration.GetSection(MassTransitConfiguration.SectionName).Get<MassTransitConfiguration>()
                              ?? throw new InvalidOperationException($"MassTransit configuration section '{MassTransitConfiguration.SectionName}' is missing");

        services.Configure<MassTransitConfiguration>(configuration.GetSection(MassTransitConfiguration.SectionName));

        services.AddMassTransit(configurator =>
        {
            // Add consumers from the current assembly
            configurator.AddConsumers(Assembly.GetExecutingAssembly());

            configurator.UsingAzureServiceBus((context, cfg) =>
            {
                cfg.Host(massTransitConfig.ConnectionString);

                // Configure retry policy
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
                    outboxConfig.QueryDelay = TimeSpan.FromSeconds(10);
                    outboxConfig.DuplicateDetectionWindow = TimeSpan.FromMinutes(30);
                });
            }
        });

        return services;
    }
}
