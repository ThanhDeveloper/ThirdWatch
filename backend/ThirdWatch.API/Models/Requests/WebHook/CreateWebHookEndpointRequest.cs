using System.ComponentModel.DataAnnotations;
using ThirdWatch.Domain.Enums;

namespace ThirdWatch.API.Models.Requests.WebHook;

public class CreateWebHookEndpointRequest
{
    [Required(ErrorMessage = "Provider name is required")]
    public required string ProviderName { get; set; }

    [Required(ErrorMessage = "HTTP Method is required")]
    public required HttpMethodType HttpMethod { get; set; }
}
