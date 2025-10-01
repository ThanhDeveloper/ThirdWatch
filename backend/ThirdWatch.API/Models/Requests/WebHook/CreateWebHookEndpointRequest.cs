using System.ComponentModel.DataAnnotations;

namespace ThirdWatch.API.Models.Requests.WebHook;

public class CreateWebHookEndpointRequest
{
    [Required(ErrorMessage = "Provider name is required")]
    public required string ProviderName { get; set; }
}
