using System.ComponentModel.DataAnnotations;

namespace ThirdWatch.Domain.Entities.Base;

public abstract class BaseEntity
{
    [Key]
    public Guid Id { get; set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset? UpdatedAt { get; private set; }

    public bool IsDeleted { get; private set; }

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTimeOffset.UtcNow;
        IsDeleted = false;
    }

    public void SetUpdated()
    {
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetDeleted()
    {
        IsDeleted = true;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetCreated()
    {
        CreatedAt = DateTimeOffset.UtcNow;
    }
}
