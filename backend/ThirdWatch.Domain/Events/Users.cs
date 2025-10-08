using ThirdWatch.Domain.Events.Base;

namespace ThirdWatch.Domain.Events;

/// <summary>
/// This event is triggered when a user successfully registers in the system.
/// Send a verification email or welcome message.
/// </summary>
public sealed record UserRegistrationEvent(Guid UserId, string CorrelationId) : IIntegrationEvent;
