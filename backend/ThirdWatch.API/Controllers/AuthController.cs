using System.Net;
using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using ThirdWatch.API.Models.Requests.Auth;
using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;

namespace ThirdWatch.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces(MediaTypeNames.Application.Json)]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.InternalServerError)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var command = new LoginCommand(request.Email.Trim().ToLowerInvariant(), request.Password.Trim());

        return Ok(ApiResponse<LoginResponseDto>.SuccessResult(await mediator.Send(command)));
    }
}
