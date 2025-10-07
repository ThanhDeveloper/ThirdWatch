using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThirdWatch.Domain.Enums;
using ThirdWatch.Shared.Extensions;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class UserConfiguration : BaseEntityConfiguration<User>
{
    public override void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(x => x.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.FirstName)
            .HasMaxLength(50);

        builder.Property(x => x.LastName)
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .HasEnumToStringConversion()
            .IsRequired();

        builder.Property(x => x.Type)
            .HasEnumToStringConversion()
            .IsRequired();

        builder.Property(x => x.LoginProvider)
            .HasEnumToStringConversion()
            .HasDefaultValue(LoginProvider.Internal)
            .IsRequired();

        builder.Property(x => x.ProfilePictureUrl)
            .HasMaxLength(255);

        builder.HasIndex(x => x.Username)
            .IsUnique();

        builder.HasIndex(x => x.Email)
            .IsUnique();

        builder.HasMany(p => p.WebhookEndpoints)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId);
    }
}
