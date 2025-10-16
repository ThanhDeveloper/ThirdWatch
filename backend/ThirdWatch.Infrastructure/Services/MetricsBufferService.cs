using System.Collections.Concurrent;

namespace ThirdWatch.Infrastructure.Services;

public interface IMetricsBufferService
{
    void AddMetricToBuffer(string key, Site processedSite);

    (string key, IReadOnlyList<Site> sites) GetFirstBatchFromBuffer();

    void RemoveBatchFromBuffer(string key);
}

public class SiteMetricsBufferService : IMetricsBufferService
{
    private readonly ConcurrentDictionary<string, ConcurrentBag<Site>> _processedSiteBuffer = [];

    public void AddMetricToBuffer(string key, Site processedSite)
    {
        var siteChecks = _processedSiteBuffer.GetOrAdd(
               key: key,
               valueFactory: _ => []
        );

        siteChecks.Add(processedSite);
    }

    // This method retrieves and returns the first batch of processed sites from the buffer.
    public (string key, IReadOnlyList<Site> sites) GetFirstBatchFromBuffer()
    {
        try
        {
            if (_processedSiteBuffer.IsEmpty)
            {
                return (string.Empty, Array.Empty<Site>());
            }

            string firstKey = _processedSiteBuffer.Keys.First();

            if (_processedSiteBuffer.TryGetValue(firstKey, out var sites) && sites != null)
            {
                return (firstKey, sites.ToList());
            }
            return (string.Empty, Array.Empty<Site>());
        }
        catch (Exception)
        {
            return (string.Empty, Array.Empty<Site>());
        }
    }

    public void RemoveBatchFromBuffer(string key) => _processedSiteBuffer.TryRemove(key, out _);
}
