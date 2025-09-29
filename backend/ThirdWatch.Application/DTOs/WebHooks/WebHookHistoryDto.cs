namespace ThirdWatch.Application.DTOs.WebHooks;

public record WebHookHistoryDto(Guid Id, string Payload, string Size);
