using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Services;

public static class DatabaseService
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services)
    {
        services.AddDbContext<ApplicationDbContext>(options => SetupDbContext(services.BuildServiceProvider(), options));

        return services;
    }

    public static async Task ApplyMigrationsAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            await context.Database.MigrateAsync();
            logger.LogInformation("Database migrations applied successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error applying database migrations");
            throw;
        }
    }

    private static void SetupDbContext(IServiceProvider serviceProvider, DbContextOptionsBuilder options)
    {
        options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

        options.UseSqlServer(serviceProvider.GetRequiredService<IConfiguration>().GetConnectionString("Sql"),
            sqlOptions => sqlOptions.EnableRetryOnFailure(3));

        var environment = serviceProvider.GetRequiredService<IHostEnvironment>();
        if (environment.IsDevelopment())
        {
            options.EnableSensitiveDataLogging().EnableDetailedErrors();
        }
    }
}
