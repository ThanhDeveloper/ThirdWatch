using System.ComponentModel.DataAnnotations;

namespace ThirdWatch.API.Models.Requests.Auth;

public class LoginRequest
{
    [Required(ErrorMessage = "Email is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Email is required")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
    public string Password { get; set; } = string.Empty;
}
