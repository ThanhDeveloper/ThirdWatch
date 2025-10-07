using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ThirdWatch.Domain.Entities.Base;

namespace ThirdWatch.Infrastructure.Persistence.Configurations;

public abstract class BaseEntityConfiguration<TBase> : IEntityTypeConfiguration<TBase> where TBase : BaseEntity
{
    public virtual void Configure(EntityTypeBuilder<TBase> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
