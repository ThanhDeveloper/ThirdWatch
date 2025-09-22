using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThirdWatch.Domain.Entities;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class WebHookLogDetailConfiguration : IEntityTypeConfiguration<WebHookLogDetail>
{
    public void Configure(EntityTypeBuilder<WebHookLogDetail> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne<WebHookLog>()
            .WithMany(h => h.WebHookLogDetails)
            .HasForeignKey(x => x.HookLogId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
