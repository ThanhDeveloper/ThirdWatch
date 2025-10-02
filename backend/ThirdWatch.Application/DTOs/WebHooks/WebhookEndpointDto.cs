namespace ThirdWatch.Application.DTOs.Webhooks;

public record WebhookEndpointDto(Uri EndpointUrl, DateTimeOffset ExpirationTime);
