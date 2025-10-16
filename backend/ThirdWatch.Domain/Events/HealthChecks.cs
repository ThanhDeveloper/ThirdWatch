using ThirdWatch.Domain.Events.Base;

namespace ThirdWatch.Domain.Events;

/// <summary>
/// This event is triggered when a health check job is performed.
/// </summary>
public sealed record HealthCheckEvent(Guid SiteId, string Url, DateTime LastCheckedAt, string CorrelationId) : IIntegrationEvent;
