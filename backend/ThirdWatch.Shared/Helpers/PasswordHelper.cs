using System.Security.Cryptography;

namespace ThirdWatch.Shared.Helpers;

public static class PasswordHelper
{
    private const int SaltSize = 16; // bytes
    private const int HashSize = 32; // bytes
    private const int Iterations = 100_000;

    public static string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        byte[] hash = pbkdf2.GetBytes(HashSize);

        byte[] result = new byte[SaltSize + HashSize];
        Buffer.BlockCopy(salt, 0, result, 0, SaltSize);
        Buffer.BlockCopy(hash, 0, result, SaltSize, HashSize);
        return Convert.ToBase64String(result);
    }

    public static bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(hashedPassword))
        {
            return false;
        }

        byte[] stored;
        try
        {
            stored = Convert.FromBase64String(hashedPassword);
        }
        catch (FormatException)
        {
            return false;
        }

        if (stored.Length != SaltSize + HashSize)
        {
            return false;
        }

        byte[] salt = new byte[SaltSize];
        Buffer.BlockCopy(stored, 0, salt, 0, SaltSize);

        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        byte[] computed = pbkdf2.GetBytes(HashSize);

        byte[] storedHash = new byte[HashSize];
        Buffer.BlockCopy(stored, SaltSize, storedHash, 0, HashSize);

        return CryptographicOperations.FixedTimeEquals(storedHash, computed);
    }

    public static bool IsValidPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
        {
            return false;
        }

        return password.Length >= 8
               && password.Any(char.IsUpper)
               && password.Any(char.IsLower)
               && password.Any(char.IsDigit);
    }
}
