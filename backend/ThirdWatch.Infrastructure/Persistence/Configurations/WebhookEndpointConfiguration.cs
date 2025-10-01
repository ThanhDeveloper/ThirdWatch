using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class WebhookEndpointConfiguration : BaseEntityConfiguration<WebhookEndpoint>
{
    public override void Configure(EntityTypeBuilder<WebhookEndpoint> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.ProviderName).HasMaxLength(100);

        builder.HasMany(x => x.WebhookHistories)
            .WithOne(x => x.WebhookEndpoint)
            .HasForeignKey(x => x.WebhookEndpointId);

        builder.HasOne(x => x.User)
            .WithMany(u => u.WebhookEndpoints)
            .HasForeignKey(x => x.UserId);

        builder.HasIndex(x => x.EndpointId).IsUnique();
    }
}
