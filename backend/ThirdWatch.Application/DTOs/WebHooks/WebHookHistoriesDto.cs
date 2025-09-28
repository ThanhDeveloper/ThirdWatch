using ThirdWatch.Domain.Enums;

namespace ThirdWatch.Application.DTOs.WebHooks;

public record WebHookHistoriesDto(Guid Id, Guid EndpointId, string Headers, HttpMethodType HttpMethod, DateTimeOffset ReceivedAt);
