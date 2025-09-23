using MassTransit;
using Microsoft.Extensions.Logging;

namespace ThirdWatch.Infrastructure.Consumers.Base;

/// <summary>
/// Base consumer class with common functionality
/// </summary>
/// <typeparam name="TMessage">Type of message to consume</typeparam>
public abstract class BaseConsumer<TMessage> : IConsumer<TMessage>
    where TMessage : class
{
    private readonly ILogger _logger;

    protected BaseConsumer(ILogger logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task Consume(ConsumeContext<TMessage> context)
    {
        string correlationId = context.CorrelationId?.ToString() ?? Guid.NewGuid().ToString();
        string messageType = typeof(TMessage).Name;

        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["MessageType"] = messageType,
            ["MessageId"] = context.MessageId?.ToString() ?? "Unknown"
        }))
        {
            try
            {
                _logger.LogInformation("Processing message: {MessageType}", messageType);

                await ConsumeMessage(context);

                _logger.LogInformation("Successfully processed message: {MessageType}", messageType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing message: {MessageType}", messageType);
                throw;
            }
        }
    }

    /// <summary>
    /// Override this method to implement message processing logic
    /// </summary>
    /// <param name="context">Message consume context</param>
    protected abstract Task ConsumeMessage(ConsumeContext<TMessage> context);
}
