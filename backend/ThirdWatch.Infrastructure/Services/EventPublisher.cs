using MassTransit;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Events.Base;

namespace ThirdWatch.Infrastructure.Services;

public sealed class EventPublisher(IPublishEndpoint publishEndpoint) : IEventPublisher
{
    public async Task PublishAsync<TEvent>(TEvent integrationEvent, CancellationToken cancellationToken = default)
        where TEvent : class, IIntegrationEvent
    {
        ArgumentNullException.ThrowIfNull(integrationEvent);

        await publishEndpoint.Publish(integrationEvent, cancellationToken);
    }

    public async Task PublishAsync(IEnumerable<IIntegrationEvent> integrationEvents, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(integrationEvents);

        var tasks = integrationEvents.Select(evt => publishEndpoint.Publish(evt, cancellationToken));
        await Task.WhenAll(tasks);
    }
}
