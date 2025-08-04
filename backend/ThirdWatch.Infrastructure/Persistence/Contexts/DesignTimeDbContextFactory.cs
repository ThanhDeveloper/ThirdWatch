using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ThirdWatch.Infrastructure.Persistence.Contexts;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Data Source=Dummy")
            .UseEnumCheckConstraints()
            .UseValidationCheckConstraints(options => options.UseRegex(false))
            .Options;

        return new(options);
    }
}
