using ThirdWatch.Domain.Entities;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Persistence.Repositories;

public class WebHookRequestLogRepository(ApplicationDbContext context) : Repository<WebhookRequestLog>(context), IWebhookRequestLogRepository { }
