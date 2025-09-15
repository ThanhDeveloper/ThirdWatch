using System.ComponentModel.DataAnnotations;

namespace ThirdWatch.API.Models.Requests.Auth;

public class GoogleLoginRequest
{
    [Required(ErrorMessage = "IdToken is required")]
    public required string IdToken { get; set; }
}
