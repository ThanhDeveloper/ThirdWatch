namespace ThirdWatch.Infrastructure.Configuration;

public sealed class MessageBusConfiguration
{
    public const string SectionName = "ServiceBus";

    public string ConnectionString { get; set; } = string.Empty;

    public bool EnableOutbox { get; set; } = true;

    public ConsumerConfiguration Consumer { get; set; } = new();
}


public sealed class ConsumerConfiguration
{
    public int RetryCount { get; set; } = 3;

    public int RetryDelaySeconds { get; set; } = 5;
}
