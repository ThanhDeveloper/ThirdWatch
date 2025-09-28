using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThirdWatch.Shared.Extensions;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class WebhookEndpointConfiguration : IEntityTypeConfiguration<WebhookEndpoint>
{
    public void Configure(EntityTypeBuilder<WebhookEndpoint> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProviderName).HasMaxLength(100);

        builder.Property(x => x.HttpMethod).HasEnumToStringConversion();

        builder.HasMany(x => x.WebhookHistories)
            .WithOne(x => x.WebhookEndpoint)
            .HasForeignKey(x => x.WebhookEndpointId);

        builder.HasOne(x => x.User)
            .WithMany(u => u.WebhookEndpoints)
            .HasForeignKey(x => x.UserId);

        builder.HasIndex(x => x.EndpointId).IsUnique();
    }
}
