using ThirdWatch.Domain.Entities;

namespace ThirdWatch.Application.Services.Interfaces;

public interface IHookLogService
{
    Task<HookLog?> GetHookLogByEndpointId(Guid endpointId, CancellationToken cancellationToken = default);
    Task AddHookLog(HookLog hookLog, CancellationToken cancellationToken = default);
    Task<HookLogDetail> AddHookLogDetail(HookLog hookLog, HookLogDetail hookLogDetail, CancellationToken cancellationToken = default);
}
