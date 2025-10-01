namespace ThirdWatch.Application.DTOs.Webhooks;

public record WebhookHistoriesDto(Guid Id, string ProviderName, Guid EndpointId, string Headers, DateTimeOffset ReceivedAt);
