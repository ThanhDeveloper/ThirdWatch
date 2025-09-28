using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class WebhookHistoryConfiguration : IEntityTypeConfiguration<WebhookHistory>
{
    public void Configure(EntityTypeBuilder<WebhookHistory> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SourceIp).HasMaxLength(50);

        builder.Property(x => x.PayloadBlobUrl).HasMaxLength(255);

        builder.HasOne(p => p.WebhookEndpoint)
            .WithMany(o => o.WebhookHistories)
            .HasForeignKey(p => p.WebhookEndpointId);
    }
}
