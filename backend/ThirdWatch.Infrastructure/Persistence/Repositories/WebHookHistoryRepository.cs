using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Persistence.Repositories;

public class WebHookHistoryRepository(ApplicationDbContext context) : Repository<WebhookHistory>(context), IWebhookHistoryRepository { }
