using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

internal class ApiRunnerCollectionConfiguration : BaseEntityConfiguration<ApiRunnerCollection>
{
    public override void Configure(EntityTypeBuilder<ApiRunnerCollection> builder)
    {
        base.Configure(builder);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(255);
    }
}
