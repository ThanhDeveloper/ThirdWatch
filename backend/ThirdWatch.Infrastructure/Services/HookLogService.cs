using Microsoft.EntityFrameworkCore;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Entities;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Services;

public class HookLogService(ApplicationDbContext context) : IHookLogService
{
    public async Task AddHookLog(HookLog hookLog, CancellationToken cancellationToken = default)
    {
        context.Add(hookLog);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<HookLog?> GetHookLogByEndpointId(Guid endpointId, CancellationToken cancellationToken = default)
        => await context.HookLogs.FirstOrDefaultAsync(h => h.EndpointId == endpointId, cancellationToken);

    public async Task<HookLogDetail> AddHookLogDetail(HookLog hookLog, HookLogDetail hookLogDetail, CancellationToken cancellationToken = default)
    {
        hookLog.HookLogDetails.Add(hookLogDetail);
        await context.SaveChangesAsync(cancellationToken);
        return hookLogDetail;
    }
}
