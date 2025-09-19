using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThirdWatch.Domain.Entities;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public class HookLogDetailConfiguration : IEntityTypeConfiguration<HookLogDetail>
{
    public void Configure(EntityTypeBuilder<HookLogDetail> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne<HookLog>()
            .WithMany(h => h.HookLogDetails);
    }
}
