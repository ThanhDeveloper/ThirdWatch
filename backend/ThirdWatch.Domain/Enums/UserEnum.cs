namespace ThirdWatch.Domain.Enums;

[Flags]
public enum UserType
{
    NormalUser = 1,
    Administrator = 2
}


public enum UserStatus
{
    None = 0,
    Active = 1,
    Inactive = 2
}


public enum LoginProvider
{
    Internal = 0,
    Google = 1,
    AzureEntraId = 2
}
