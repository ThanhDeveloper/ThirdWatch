using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Azure.Security.KeyVault.Secrets;
using Microsoft.Extensions.Configuration;

namespace ThirdWatch.Shared.Extensions;

public class ThirdWatchKeyVaultSecretManager : KeyVaultSecretManager
{
    private readonly IReadOnlyCollection<string> _allowedKeys;
    private const string SecrectPrefix = "secrect-";
    private readonly string _prefix;

    public ThirdWatchKeyVaultSecretManager(string prefix, IReadOnlyCollection<string> allowedKeys)
    {
        //ArgumentException.ThrowIfNullOrEmpty(prefix);
        _prefix = $"{prefix}-";
        _allowedKeys = allowedKeys;
    }

    public override string GetKey(KeyVaultSecret secret) => GetKey(secret.Name);

    private string GetKey(string secretName)
    {
        if (secretName.StartsWith(_prefix, StringComparison.OrdinalIgnoreCase))
        {
            return secretName[_prefix.Length..].Replace("--", ConfigurationPath.KeyDelimiter, StringComparison.OrdinalIgnoreCase);
        }

        return secretName[SecrectPrefix.Length..].Replace("--", ConfigurationPath.KeyDelimiter, StringComparison.OrdinalIgnoreCase);
    }

#pragma warning disable RS0030 // Do not use banned APIs: this is the only place where we have to do it, we cannot receive an injected TimeProvider instance here
    /// <summary>
    /// Secret never expired
    /// </summary>
    /// <param name="secret"></param>
    /// <returns></returns>
    //public override bool Load(SecretProperties secret) =>
    //    secret.Enabled == true && (!secret.ExpiresOn.HasValue || secret.ExpiresOn > DateTimeOffset.UtcNow)
    //                           && (secret.Name.StartsWith(_prefix, StringComparison.OrdinalIgnoreCase) || secret.Name.StartsWith(SharedPrefix, StringComparison.OrdinalIgnoreCase))
    //                           && _allowedKeys.Contains(GetKey(secret.Name), StringComparer.OrdinalIgnoreCase);

    public override bool Load(SecretProperties secret)
        => secret.Enabled == true
                  && (secret.Name.StartsWith(_prefix, StringComparison.OrdinalIgnoreCase) || secret.Name.StartsWith(SecrectPrefix, StringComparison.OrdinalIgnoreCase))
                  && _allowedKeys.Contains(GetKey(secret.Name), StringComparer.OrdinalIgnoreCase);
#pragma warning restore RS0030
}
