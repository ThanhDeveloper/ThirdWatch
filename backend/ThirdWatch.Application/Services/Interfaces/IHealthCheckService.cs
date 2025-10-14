namespace ThirdWatch.Application.Services.Interfaces;

public interface IHealthCheckService
{
    Task CheckSingleSiteAsync(Guid siteId, string url, DateTime lastCheckedAt, CancellationToken cancellationToken);
}
