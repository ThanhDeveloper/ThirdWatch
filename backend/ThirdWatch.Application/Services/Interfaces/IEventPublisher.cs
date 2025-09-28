using ThirdWatch.Domain.Events.Base;

namespace ThirdWatch.Application.Services.Interfaces;

/// <summary>
/// Service for publishing integration events
/// </summary>
public interface IEventPublisher
{
    /// <summary>
    /// Publishes an integration event using the outbox pattern
    /// </summary>
    /// <typeparam name="TEvent">The type of event to publish</typeparam>
    /// <param name="integrationEvent">The event to publish</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task PublishAsync<TEvent>(TEvent integrationEvent, CancellationToken cancellationToken = default)
        where TEvent : class, IIntegrationEvent;

    /// <summary>
    /// Publishes multiple integration events using the outbox pattern
    /// </summary>
    /// <param name="integrationEvents">The events to publish</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task PublishAsync(IEnumerable<IIntegrationEvent> integrationEvents, CancellationToken cancellationToken = default);
}
