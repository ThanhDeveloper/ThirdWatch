using Azure.Identity;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

namespace ThirdWatch.Shared.Extensions;

public static class KeyVaultExtensions
{
    public static IConfigurationBuilder AddKeyVault(this WebApplicationBuilder builder, string prefix)
    {
        if (builder.Configuration.GetValue("UseKeyVault", true))
        {
            // List the keys that are referenced by configuration, do not load the others
            var keysToLoad = builder.Configuration.AsEnumerable()
                .Where(secret => secret.Value?.Equals("<KeyVault>", StringComparison.OrdinalIgnoreCase) ?? false)
                .Select(secret => secret.Key)
                .ToList();

            return builder.Configuration.AddAzureKeyVault(
                new Uri(builder.Configuration["KeyVault:KeyVaultURL"]!.ToString()),
                new ClientSecretCredential(builder.Configuration["KeyVault:DirectoryId"], builder.Configuration["KeyVault:ClientId"], builder.Configuration["KeyVault:ClientSecret"]),
                new ThirdWatchKeyVaultSecretManager(prefix, keysToLoad));
        }

        return builder.Configuration;
    }
}

