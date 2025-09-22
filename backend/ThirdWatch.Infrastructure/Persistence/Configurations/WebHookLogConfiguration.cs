using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThirdWatch.Domain.Entities;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;
public class WebHookLogConfiguration : IEntityTypeConfiguration<WebHookLog>
{
    public void Configure(EntityTypeBuilder<WebHookLog> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(100);

        builder.HasMany(x => x.WebHookLogDetails)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.EndpointId).IsUnique();
    }
}
