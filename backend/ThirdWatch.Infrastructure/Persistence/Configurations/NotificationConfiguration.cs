using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThirdWatch.Shared.Extensions;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : BaseEntityConfiguration<Notification>
{
    public override void Configure(EntityTypeBuilder<Notification> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.Type).HasEnumToStringConversion();

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasOne(x => x.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(x => x.UserId);
    }
}
