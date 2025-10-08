using MassTransit;
using Microsoft.Extensions.Logging;
using ThirdWatch.Domain.Enums;
using ThirdWatch.Domain.Events;
using ThirdWatch.Domain.Interfaces;

namespace ThirdWatch.Infrastructure.Consumers;
public sealed class UserRegistrationEventConsumer(
    IUnitOfWork unitOfWork,
    ILogger<UserRegistrationEventConsumer> logger) : BaseConsumer<UserRegistrationEvent>(logger)
{
    protected override async Task ConsumeMessage(ConsumeContext<UserRegistrationEvent> context)
    {
        var message = context.Message;

        logger.LogInformation("Processing user registration event for userId: {UserId}, correlationId: {CorrelationId}", message.UserId, context.CorrelationId);

        var notification = new Notification
        {
            UserId = message.UserId,
            Type = NotificationType.System,
            Title = "Welcome to ThirdWatch!",
            Description = "We’re excited to have you on board. Explore your dashboard to get started.",
        };

        await unitOfWork.Notifications.AddAsync(notification);

        await unitOfWork.SaveChangesAsync();

        logger.LogInformation("User registration event processed successfully for userId: {UserId}", message.UserId);
    }
}
