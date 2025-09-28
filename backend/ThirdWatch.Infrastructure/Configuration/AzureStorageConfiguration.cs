namespace ThirdWatch.Infrastructure.Configuration;

public class AzureStorageConfiguration
{
    public const string SectionName = "AzureStorage";

    public required string ConnectionString { get; set; }

    public required string WebHookContainerName { get; set; }

    public required string ContainerName { get; set; }

    public string DefaultBlobAccessTier { get; set; } = "Hot";
}
