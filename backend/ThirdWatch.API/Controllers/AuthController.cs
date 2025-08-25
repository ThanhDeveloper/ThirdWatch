using System.Net;
using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThirdWatch.API.Models.Requests.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;

namespace ThirdWatch.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces(MediaTypeNames.Application.Json)]
public class AuthController(IMediator mediator) : ControllerBase
{
    private CookieOptions BuildAuthCookieOptions(DateTimeOffset? expires = null)
        => new()
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = expires
        };

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<string>), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.InternalServerError)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var command = new LoginCommand(request.Email.Trim().ToLowerInvariant(), request.Password.Trim());
        var result = await mediator.Send(command);

        Response.Cookies.Append("AccessToken", result.AccessToken, BuildAuthCookieOptions(result.ExpiresAt));

        return Ok(ApiResponse.SuccessResult("Login successfully"));
    }

    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse<string>), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
    public IActionResult Logout()
    {
        if (Request.Cookies.ContainsKey("AccessToken"))
        {
            Response.Cookies.Append("AccessToken", string.Empty, BuildAuthCookieOptions(DateTimeOffset.UtcNow.AddDays(-1)));
        }
        return Ok(ApiResponse.SuccessResult("Logout successfully"));
    }

    [Authorize]
    [HttpGet("verify")]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
    public IActionResult Verify() => Ok(ApiResponse.SuccessResult("Authenticated"));
}
