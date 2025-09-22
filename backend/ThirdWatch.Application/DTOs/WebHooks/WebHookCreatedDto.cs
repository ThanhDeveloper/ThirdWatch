namespace ThirdWatch.Application.DTOs.WebHooks;

public record WebHookCreatedDto(string ProviderName, Guid EndpointId);
