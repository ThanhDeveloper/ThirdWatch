using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using ThirdWatch.Application.Services.Interfaces;

namespace ThirdWatch.Infrastructure.Services;

public class RedisCacheService(IDistributedCache distributedCache) : ICacheService
{
    private readonly DistributedCacheEntryOptions _defaultOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(8),
        SlidingExpiration = TimeSpan.FromHours(1)
    };

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        string? cachedData = await distributedCache.GetStringAsync(key, cancellationToken);

        if (string.IsNullOrEmpty(cachedData))
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(cachedData);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpirationRelativeToNow = null, CancellationToken cancellationToken = default)
    {
        string serializedData = JsonSerializer.Serialize(value);

        var options = absoluteExpirationRelativeToNow.HasValue
            ? new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = absoluteExpirationRelativeToNow }
            : _defaultOptions;

        await distributedCache.SetStringAsync(key, serializedData, options, cancellationToken);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        await distributedCache.RemoveAsync(key, cancellationToken);
    }
}
