using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThirdWatch.Shared.Extensions;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class SiteConfiguration : BaseEntityConfiguration<Site>
{
    public override void Configure(EntityTypeBuilder<Site> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.LastStatus).HasEnumToStringConversion();

        builder.Property(x => x.HealthStatus).HasEnumToStringConversion();

        builder.Property(p => p.ResponseTrendData).HasMaxLength(1000);

        builder.Property(x => x.Url).HasMaxLength(255);

        builder.Property(x => x.SiteName).HasMaxLength(100);

        builder.Property(x => x.UptimePercentage)
            .HasColumnType("decimal(18,5)");

        builder.Property(x => x.StabilityPercentage)
            .HasColumnType("decimal(18,5)");

        builder.HasOne(x => x.User)
            .WithMany(u => u.Sites)
            .HasForeignKey(x => x.UserId);
    }
}
