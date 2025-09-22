using ThirdWatch.Application.DTOs.WebHooks;
using ThirdWatch.Application.Handlers.Commands.WebHooks;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public class WebHookReceiveHandler(IUnitOfWork unitOfWork) : IRequestHandler<WebHookReceiveCommand, WebHookReceiveDto>
{
    public async Task<WebHookReceiveDto> Handle(WebHookReceiveCommand request, CancellationToken cancellationToken)
    {
        var existingHookLog = await unitOfWork.WebHookLogs.GetByEndpointIdAsync(request.EndpointId, cancellationToken)
            ?? throw new NotFoundException("Hook log not found");


        var hookLogDetail = new WebHookLogDetail
        {
            Headers = request.Headers,
            Payload = request.Payload,
        };

        existingHookLog.WebHookLogDetails.Add(hookLogDetail);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new WebHookReceiveDto(
            existingHookLog.Id,
            hookLogDetail.Id,
            existingHookLog.EndpointId,
            hookLogDetail.Payload,
            hookLogDetail.Headers,
            hookLogDetail.CreatedAt);
    }
}
