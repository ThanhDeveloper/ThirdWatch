using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class WebhookRequestLogConfiguration : IEntityTypeConfiguration<WebhookRequestLog>
{
    public void Configure(EntityTypeBuilder<WebhookRequestLog> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SourceIp).HasMaxLength(50);

        builder.Property(x => x.PayloadBlobUrl).HasMaxLength(255);

        builder.HasOne(p => p.WebhookEndpoint)
            .WithMany(o => o.WebhookRequestLogs)
            .HasForeignKey(p => p.WebhookEndpointId);
    }
}
