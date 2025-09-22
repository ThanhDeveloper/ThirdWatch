using System.ComponentModel.DataAnnotations;

namespace ThirdWatch.API.Models.Requests.Auth;

public class LoginRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100, ErrorMessage = "Email must not exceed 100 characters")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(50, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 50 characters")]
    public string Password { get; set; } = string.Empty;
}
