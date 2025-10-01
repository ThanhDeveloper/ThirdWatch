using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class WebhookHistoryConfiguration : BaseEntityConfiguration<WebhookHistory>
{
    public override void Configure(EntityTypeBuilder<WebhookHistory> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.SourceIp).HasMaxLength(50);

        builder.Property(x => x.PayloadBlobUrl).HasMaxLength(255);

        builder.HasOne(p => p.WebhookEndpoint)
            .WithMany(o => o.WebhookHistories)
            .HasForeignKey(p => p.WebhookEndpointId);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
