namespace ThirdWatch.Application.Services.Interfaces;

public interface IHealthCheckService
{
    Task ExecuteBatchChecksAsync(IEnumerable<Site> sites, CancellationToken cancellationToken);
}
