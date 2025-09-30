namespace ThirdWatch.Application.DTOs.Webhooks;

public record WebhookHistoryDto(Guid Id, string Payload, string Size);
