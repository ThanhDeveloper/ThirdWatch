namespace ThirdWatch.Application.Services.Interfaces;

public interface IHealthCheckService
{
    Task<Site?> CheckSingleSiteAsync(Site site, DateTime lastCheckedAt, CancellationToken cancellationToken);
}
