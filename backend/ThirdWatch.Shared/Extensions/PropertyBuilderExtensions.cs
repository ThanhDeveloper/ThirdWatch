using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ThirdWatch.Shared.Extensions;

public static class PropertyBuilderExtensions
{
    public static PropertyBuilder<TEnum> HasEnumToStringConversion<TEnum>(this PropertyBuilder<TEnum> builder) where TEnum : struct, Enum
#pragma warning disable RS0030 // We allow the banned API only here in the codebase
        => builder.HasConversion<string>().HasMaxLength(Enum.GetValues<TEnum>().Max(e => e.ToString().Length));
#pragma warning restore RS0030

    public static PropertyBuilder<TEnum?> HasEnumToStringConversion<TEnum>(this PropertyBuilder<TEnum?> builder) where TEnum : struct, Enum
#pragma warning disable RS0030 // We allow the banned API only here in the codebase
        => builder.HasConversion<string>().HasMaxLength(Enum.GetValues<TEnum>().Max(e => e.ToString().Length));
#pragma warning restore RS0030

    public static PropertyBuilder<TimeSpan> HasTicksConversion(this PropertyBuilder<TimeSpan> builder)
#pragma warning disable RS0030 // We allow the banned API only here in the codebase
        => builder.HasConversion<long>();
#pragma warning restore RS0030
}
