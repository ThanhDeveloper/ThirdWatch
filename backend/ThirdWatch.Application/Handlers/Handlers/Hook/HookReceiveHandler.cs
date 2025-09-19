using ThirdWatch.Application.DTOs.Hooks;
using ThirdWatch.Application.Handlers.Commands.Hooks;
using ThirdWatch.Domain.Entities;

namespace ThirdWatch.Application.Handlers.Handlers.Hook;

public class HookReceiveHandler(IHookLogService hookService) : IRequestHandler<HookReceiveCommand, HookReceiveDto>
{
    public async Task<HookReceiveDto> Handle(HookReceiveCommand request, CancellationToken cancellationToken)
    {
        var existingHookLog = await hookService.GetHookLogByEndpointId(request.EndpointId, cancellationToken)
            ?? throw new NotFoundException("Hook log not found");

        var hookLogDetail = new HookLogDetail
        {
            Headers = request.Headers,
            Payload = request.Payload,
        };

        await hookService.AddHookLogDetail(existingHookLog, hookLogDetail, cancellationToken);

        return new HookReceiveDto(
            existingHookLog.Id,
            hookLogDetail.Id,
            existingHookLog.EndpointId,
            hookLogDetail.Payload,
            hookLogDetail.Headers,
            hookLogDetail.CreatedAt);
    }
}
